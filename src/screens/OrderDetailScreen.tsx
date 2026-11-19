import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Calendar, 
  FileText, 
  Download, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react-native';
import { api, getBaseUrl } from '../services/api';
import { Order, ORDER_STATUS_LABELS } from '../types';
import { OrderStatusStepper } from '../components/OrderStatusStepper';

export const OrderDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverBase, setServerBase] = useState('');

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const base = await getBaseUrl();
      setServerBase(base);
      const res = await api.getOrderById(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        Alert.alert('Tidak Ditemukan', res.error || 'Pesanan tidak ditemukan');
      }
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getFullUrl = (uri?: string | null) => {
    if (!uri) return '';
    if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
    return `${serverBase}${uri.startsWith('/') ? '' : '/'}${uri}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Pesanan tidak ditemukan.</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backHomeBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusMeta = ORDER_STATUS_LABELS[order.status] || {
    label: order.status,
    color: '#475569',
    bg: '#F1F5F9',
    border: '#E2E8F0',
  };

  const isNeedPayment = 
    order.status === 'MENUNGGU_PEMBAYARAN' || 
    order.status === 'PENDING' || 
    order.status === 'PEMBAYARAN_DITOLAK';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Detail Pesanan</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadOrderDetail}>
          <RefreshCw size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order ID & Status Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.orderLabel}>Nomor Pesanan</Text>
              <Text style={styles.orderNoText}>{order.orderNo || `#${order.id.slice(0, 8)}`}</Text>
              <Text style={styles.orderDateText}>Dibuat: {formatDate(order.createdAt)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>
        </View>

        {/* 7-Stage Order Stepper */}
        <OrderStatusStepper status={order.status} />

        {/* Payment Warning Banner if needed */}
        {isNeedPayment && (
          <View style={styles.paymentAlertBox}>
            <View style={styles.paymentAlertContent}>
              <Text style={styles.paymentAlertTitle}>
                {order.status === 'PEMBAYARAN_DITOLAK'
                  ? 'Bukti Transfer Ditolak'
                  : 'Selesaikan Pembayaran'}
              </Text>
              <Text style={styles.paymentAlertDesc}>
                Total tagihan: <Text style={styles.boldRed}>{formatRupiah(order.totalAmount)}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.uploadProofBtn}
              onPress={() => navigation.navigate('PaymentUpload', { orderId: order.id })}
            >
              <CreditCard size={16} color="#FFFFFF" />
              <Text style={styles.uploadProofBtnText}>Bayar & Upload</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ordered Items List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Produk yang Dipesan ({order.items?.length || 0})</Text>

          <View style={styles.itemsList}>
            {order.items?.map((item, idx) => {
              const isM2 = item.product?.priceType === 'M2' || (item.width && item.height);
              return (
                <View key={idx} style={styles.itemRow}>
                  <Image
                    source={{ uri: getFullUrl(item.product?.image) }}
                    style={styles.itemImg}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.product?.name || 'Produk Cetak'}</Text>
                    <Text style={styles.itemPrice}>
                      {formatRupiah(item.price)} × {item.quantity} pcs
                    </Text>

                    {isM2 && (
                      <Text style={styles.dimText}>
                        📐 Ukuran: {item.width}m × {item.height}m ({(item.width! * item.height!).toFixed(2)} m²)
                      </Text>
                    )}

                    {item.options && (
                      <Text style={styles.optionsText}>
                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join('  |  ')}
                      </Text>
                    )}

                    {item.fileUrl && (
                      <TouchableOpacity
                        style={styles.fileLinkBtn}
                        onPress={() => Linking.openURL(getFullUrl(item.fileUrl))}
                      >
                        <FileText size={14} color="#2563EB" />
                        <Text style={styles.fileLinkText}>Buka File Desain Siap Cetak</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Shipping & Delivery Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pengiriman & Pengambilan</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode:</Text>
            <Text style={styles.infoValue}>{order.shippingMethod || 'Ambil Sendiri'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alamat:</Text>
            <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>
              {order.shippingAddress || '-'}
            </Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode Bayar:</Text>
            <Text style={styles.infoValue}>{order.paymentMethod || 'TRANSFER'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Biaya Ongkir:</Text>
            <Text style={styles.infoValue}>{formatRupiah(order.shippingCost || 0)}</Text>
          </View>
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalRowLabel}>Total Tagihan:</Text>
            <Text style={styles.totalRowValue}>{formatRupiah(order.totalAmount)}</Text>
          </View>

          {order.paymentProof && (
            <View style={styles.proofPreviewBox}>
              <Text style={styles.proofLabel}>Bukti Transfer Terkirim:</Text>
              <TouchableOpacity
                style={styles.viewProofBtn}
                onPress={() => Linking.openURL(getFullUrl(order.paymentProof))}
              >
                <ExternalLink size={14} color="#2563EB" />
                <Text style={styles.viewProofBtnText}>Lihat Berkas Bukti Transfer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Status History Logs */}
        {order.statusLogs && order.statusLogs.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Riwayat Catatan Pengerjaan</Text>
            <View style={styles.logsList}>
              {order.statusLogs.map((log, idx) => (
                <View key={idx} style={styles.logRow}>
                  <View style={styles.logBullet} />
                  <View style={styles.logContent}>
                    <Text style={styles.logNote}>{log.note || 'Pembaruan status'}</Text>
                    <Text style={styles.logDate}>
                      {formatDate(log.createdAt)} {log.changedBy ? `• Oleh ${log.changedBy.name}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
  backHomeBtn: {
    marginTop: 14,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderNoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  orderDateText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paymentAlertBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentAlertContent: {
    flex: 1,
    marginRight: 10,
  },
  paymentAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  paymentAlertDesc: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  boldRed: {
    fontWeight: '800',
    color: '#B91C1C',
  },
  uploadProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  uploadProofBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  dimText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  optionsText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  fileLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  fileLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalRowLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalRowValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  proofPreviewBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  proofLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  viewProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewProofBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  logsList: {
    gap: 10,
  },
  logRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  logBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 4,
  },
  logContent: {
    flex: 1,
  },
  logNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  logDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});
