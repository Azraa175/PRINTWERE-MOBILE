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
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  ExternalLink,
  RefreshCw,
  Clock,
  Truck,
  Package,
  Copy,
  StickyNote,
  CheckCircle2,
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

  const formatRupiah = (val: number) =>
    'Rp ' + Math.round(val).toLocaleString('id-ID');

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
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

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Tersalin!', `${label} telah disalin.`);
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
        <Package size={48} color="#CBD5E1" />
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

  const isNeedPayment = order.status === 'MENUNGGU_PEMBAYARAN' || order.status === 'PENDING';
  const isPaymentRejected = order.status === 'PEMBAYARAN_DITOLAK';
  const isShipping = order.status === 'DIKIRIM';
  const isDone = order.status === 'SELESAI';
  const isCancelled = order.status === 'DIBATALKAN';

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
        <View style={[styles.headerCard, { borderLeftColor: statusMeta.color, borderLeftWidth: 4 }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.orderLabel}>Nomor Pesanan</Text>
              <TouchableOpacity
                onLongPress={() => copyToClipboard(order.orderNo || order.id, 'Nomor pesanan')}
                activeOpacity={0.7}
              >
                <Text style={styles.orderNoText}>{order.orderNo || `#${order.id.slice(0, 8)}`}</Text>
              </TouchableOpacity>
              <Text style={styles.orderDateText}>Dibuat: {formatDate(order.createdAt)}</Text>
            </View>
            <View>
              <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg, borderColor: statusMeta.border }]}>
                <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
                  {statusMeta.label}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyNoBtn}
                onPress={() => copyToClipboard(order.orderNo || order.id, 'Nomor pesanan')}
              >
                <Copy size={12} color="#64748B" />
                <Text style={styles.copyNoBtnText}>Salin No.</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Due date & delivery type info */}
          {(order.dueDate || order.deliveryType) && (
            <View style={styles.extraInfoRow}>
              {order.dueDate && (
                <View style={styles.extraInfoItem}>
                  <Calendar size={12} color="#D97706" />
                  <Text style={styles.extraInfoText}>
                    Jatuh Tempo: <Text style={{ color: '#D97706', fontWeight: '700' }}>{formatDateShort(order.dueDate)}</Text>
                  </Text>
                </View>
              )}
              {order.deliveryType && (
                <View style={styles.extraInfoItem}>
                  <Truck size={12} color="#2563EB" />
                  <Text style={styles.extraInfoText}>{order.deliveryType}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Invoice CTA — always visible & prominent */}
        <TouchableOpacity
          style={styles.invoiceCta}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(`https://printwere.vercel.app/orders/${order.id}/invoice`)}
        >
          <View style={styles.invoiceCtaLeft}>
            <View style={styles.invoiceCtaIcon}>
              <FileText size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.invoiceCtaTitle}>Lihat Invoice Digital</Text>
              <Text style={styles.invoiceCtaSub}>Unduh & simpan faktur resmi PDF</Text>
            </View>
          </View>
          <ExternalLink size={18} color="#2563EB" />
        </TouchableOpacity>

        {/* 7-Stage Order Stepper */}
        <OrderStatusStepper status={order.status} />

        {/* Payment Warning Banner */}
        {(isNeedPayment || isPaymentRejected) && (
          <View style={[styles.paymentAlertBox, isPaymentRejected && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <View style={styles.paymentAlertContent}>
              <Text style={[styles.paymentAlertTitle, isPaymentRejected && { color: '#991B1B' }]}>
                {isPaymentRejected ? 'Bukti Ditolak' : (order.paymentMethod === 'QRIS' ? 'Bayar QRIS' : 'Bayar Sekarang')}
              </Text>
              <Text style={[styles.paymentAlertDesc, isPaymentRejected && { color: '#B91C1C' }]}>
                {isPaymentRejected
                  ? 'Admin menolak bukti pembayaran. Upload ulang.'
                  : (order.paymentMethod === 'QRIS'
                      ? 'Selesaikan pembayaran QRIS di kasir/outlet.'
                      : `Total: ${formatRupiah(order.totalAmount)}`)}
              </Text>
            </View>
            {order.paymentMethod !== 'QRIS' && (
              <TouchableOpacity
                style={[styles.uploadProofBtn, isPaymentRejected && { backgroundColor: '#DC2626' }]}
                onPress={() => navigation.navigate('PaymentUpload', { orderId: order.id })}
              >
                <CreditCard size={16} color="#FFFFFF" />
                <Text style={styles.uploadProofBtnText}>
                  {isPaymentRejected ? 'Upload Ulang' : 'Upload Bukti'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Shipping/Delivery in progress banner */}
        {isShipping && (
          <View style={styles.shippingBanner}>
            <Truck size={18} color="#0891B2" />
            <View style={styles.shippingBannerText}>
              <Text style={styles.shippingBannerTitle}>Paket Dikirim</Text>
              <Text style={styles.shippingBannerSub}>
                Hubungi kami untuk nomor resi.
              </Text>
            </View>
          </View>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledBannerText}>
              Pesanan dibatalkan. Hubungi kami untuk info.
            </Text>
          </View>
        )}

        {/* Completed banner */}
        {isDone && (
          <View style={styles.doneBanner}>
            <CheckCircle2 size={18} color="#16A34A" />
            <Text style={styles.doneBannerText}>Pesanan selesai. Terima kasih!</Text>
          </View>
        )}

        {/* Customer Note */}
        {order.note && (
          <View style={styles.noteCard}>
            <View style={styles.noteTitleRow}>
              <StickyNote size={14} color="#D97706" />
              <Text style={styles.noteTitle}>Catatan Pesanan</Text>
            </View>
            <Text style={styles.noteText}>{order.note}</Text>
          </View>
        )}

        {/* Ordered Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Produk ({order.items?.length || 0})</Text>
          <View style={styles.itemsList}>
            {order.items?.map((item, idx) => {
              const isM2 = item.product?.priceType === 'M2' || (item.width && item.height);
              return (
                <View key={idx} style={[styles.itemRow, idx < (order.items.length - 1) && styles.itemRowBorder]}>
                  <Image
                    source={{ uri: getFullUrl(item.product?.image) || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200' }}
                    style={styles.itemImg}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.product?.name || 'Produk Cetak'}</Text>
                    <Text style={styles.itemPrice}>
                      {formatRupiah(item.price)} × {item.quantity} pcs
                    </Text>
                    <Text style={styles.itemTotal}>
                      Subtotal: {formatRupiah(item.price * item.quantity)}
                    </Text>

                    {isM2 && item.width && item.height && (
                      <Text style={styles.dimText}>
                        📐 {item.width}m × {item.height}m = {(item.width * item.height).toFixed(2)} m²
                      </Text>
                    )}

                    {item.options && Object.keys(item.options).length > 0 && (
                      <Text style={styles.optionsText}>
                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join('  |  ')}
                      </Text>
                    )}

                    {item.notes && (
                      <Text style={styles.itemNoteText}>📝 {item.notes}</Text>
                    )}

                    {item.fileUrl && (
                      <TouchableOpacity
                        style={styles.fileLinkBtn}
                        onPress={() => Linking.openURL(getFullUrl(item.fileUrl))}
                      >
                        <FileText size={13} color="#2563EB" />
                        <Text style={styles.fileLinkText}>Buka File Desain</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Shipping Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pengiriman</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode Kirim</Text>
            <Text style={styles.infoValue}>{order.shippingMethod || 'Ambil Sendiri'}</Text>
          </View>
          {order.deliveryType && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jenis Pengiriman</Text>
              <Text style={styles.infoValue}>{order.deliveryType}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alamat</Text>
            <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>
              {order.shippingAddress || '-'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ongkos Kirim</Text>
            <Text style={styles.infoValue}>{formatRupiah(order.shippingCost || 0)}</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pembayaran</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode Bayar</Text>
            <Text style={styles.infoValue}>{order.paymentMethod || 'TRANSFER'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ongkos Kirim</Text>
            <Text style={styles.infoValue}>{formatRupiah(order.shippingCost || 0)}</Text>
          </View>
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalRowLabel}>Total Tagihan</Text>
            <Text style={styles.totalRowValue}>{formatRupiah(order.totalAmount)}</Text>
          </View>

          {order.paymentProof && (
            <View style={styles.proofPreviewBox}>
              <Text style={styles.proofLabel}>Bukti Transfer:</Text>
              <TouchableOpacity
                style={styles.viewProofBtn}
                onPress={() => Linking.openURL(getFullUrl(order.paymentProof))}
              >
                <ExternalLink size={13} color="#2563EB" />
                <Text style={styles.viewProofBtnText}>Lihat Bukti Transfer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Records */}
        {order.payments && order.payments.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Riwayat Pembayaran</Text>
            {order.payments.map((p, idx) => (
              <View key={idx} style={[styles.infoRow, { paddingVertical: 6 }]}>
                <View>
                  <Text style={styles.infoValue}>{formatRupiah(p.amount)}</Text>
                  <Text style={styles.infoLabel}>{formatDateShort(p.createdAt)} · {p.method}</Text>
                </View>
                <View style={[styles.payStatusBadge, {
                  backgroundColor: p.status === 'VERIFIED' ? '#DCFCE7' : '#FEF3C7',
                  borderColor: p.status === 'VERIFIED' ? '#BBF7D0' : '#FDE68A',
                }]}>
                  <Text style={[styles.payStatusText, { color: p.status === 'VERIFIED' ? '#16A34A' : '#D97706' }]}>
                    {p.status === 'VERIFIED' ? 'Terverifikasi' : 'Menunggu'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Status History Logs */}
        {order.statusLogs && order.statusLogs.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Riwayat Alur</Text>
            <View style={styles.logsList}>
              {order.statusLogs.map((log, idx) => (
                <View key={idx} style={styles.logRow}>
                  <View style={styles.logBulletWrap}>
                    <View style={styles.logBullet} />
                    {idx < order.statusLogs!.length - 1 && <View style={styles.logLine} />}
                  </View>
                  <View style={styles.logContent}>
                    <Text style={styles.logNote}>{log.note || 'Pembaruan status'}</Text>
                    <Text style={styles.logDate}>
                      {formatDateShort(log.createdAt)}
                      {log.changedBy ? ` · oleh ${log.changedBy.name}` : ''}
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerBox: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B' },
  errorText: { fontSize: 15, color: '#EF4444', fontWeight: '700', marginTop: 12, textAlign: 'center' },
  backHomeBtn: {
    marginTop: 16, backgroundColor: '#2563EB',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
  },
  backHomeBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },
  topNavTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  refreshButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 50, gap: 14 },
  headerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1, marginRight: 10 },
  orderLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },
  orderNoText: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  orderDateText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1, alignSelf: 'flex-start',
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  copyNoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 6, alignSelf: 'flex-end',
  },
  copyNoBtnText: { fontSize: 10, color: '#64748B' },
  extraInfoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  extraInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  extraInfoText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  invoiceCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#EFF6FF', borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  invoiceCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  invoiceCtaIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
  },
  invoiceCtaTitle: { fontSize: 14, fontWeight: '800', color: '#1D4ED8' },
  invoiceCtaSub: { fontSize: 11, color: '#3B82F6', marginTop: 1 },
  paymentAlertBox: {
    backgroundColor: '#FEF3C7', borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: '#FDE68A',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  paymentAlertContent: { flex: 1, marginRight: 10 },
  paymentAlertTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  paymentAlertDesc: { fontSize: 11, color: '#B45309', marginTop: 2, lineHeight: 16 },
  uploadProofBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#D97706', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
  },
  uploadProofBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  shippingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#E0F2FE', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BAE6FD',
  },
  shippingBannerText: { flex: 1 },
  shippingBannerTitle: { fontSize: 13, fontWeight: '700', color: '#0C4A6E' },
  shippingBannerSub: { fontSize: 11, color: '#0369A1', marginTop: 2 },
  cancelledBanner: {
    backgroundColor: '#F1F5F9', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  cancelledBannerText: { fontSize: 12, color: '#475569', fontWeight: '600', textAlign: 'center' },
  doneBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#DCFCE7', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  doneBannerText: { fontSize: 12, color: '#166534', fontWeight: '600', flex: 1 },
  noteCard: {
    backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  noteTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  noteTitle: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  noteText: { fontSize: 12, color: '#78350F', lineHeight: 18 },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  itemsList: { gap: 12 },
  itemRow: { flexDirection: 'row', gap: 12, paddingBottom: 12 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemImg: { width: 62, height: 62, borderRadius: 12, backgroundColor: '#F1F5F9' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  itemPrice: { fontSize: 11, color: '#64748B', marginTop: 2 },
  itemTotal: { fontSize: 12, fontWeight: '700', color: '#2563EB', marginTop: 1 },
  dimText: { fontSize: 11, color: '#7C3AED', fontWeight: '600', marginTop: 3 },
  optionsText: { fontSize: 10, color: '#475569', marginTop: 3, lineHeight: 15 },
  itemNoteText: { fontSize: 11, color: '#78350F', marginTop: 3, fontStyle: 'italic' },
  fileLinkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
  },
  fileLinkText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingVertical: 5,
  },
  infoLabel: { fontSize: 12, color: '#64748B', flex: 1 },
  infoValue: { fontSize: 12, fontWeight: '600', color: '#0F172A', flex: 1, textAlign: 'right' },
  totalRow: {
    marginTop: 8, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  totalRowLabel: { fontSize: 14, fontWeight: '800', color: '#0F172A', flex: 1 },
  totalRowValue: { fontSize: 16, fontWeight: '800', color: '#2563EB', flex: 1, textAlign: 'right' },
  proofPreviewBox: {
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  proofLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  viewProofBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  viewProofBtnText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  payStatusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1,
  },
  payStatusText: { fontSize: 10, fontWeight: '700' },
  logsList: { gap: 0 },
  logRow: { flexDirection: 'row', gap: 10 },
  logBulletWrap: { alignItems: 'center', width: 16 },
  logBullet: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#2563EB', marginTop: 3,
  },
  logLine: {
    width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: 2,
  },
  logContent: { flex: 1, paddingBottom: 14 },
  logNote: { fontSize: 12, fontWeight: '600', color: '#334155' },
  logDate: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
});
