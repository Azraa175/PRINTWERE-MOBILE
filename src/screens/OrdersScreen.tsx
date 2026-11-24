import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Clipboard,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Package,
  ChevronRight,
  CreditCard,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Printer,
  Truck,
  Clock3,
  Layers,
  Star,
} from 'lucide-react-native';
import { api, getBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Order, ORDER_STATUS_LABELS } from '../types';

const TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'MENUNGGU_PEMBAYARAN', label: 'Belum Bayar' },
  { id: 'MENUNGGU_VERIFIKASI', label: 'Verifikasi' },
  { id: 'ANTRIAN_PRODUKSI', label: 'Antrean' },
  { id: 'SEDANG_DICETAK', label: 'Dicetak' },
  { id: 'FINISHING', label: 'Finishing' },
  { id: 'SIAP_DIAMBIL', label: 'Siap Ambil' },
  { id: 'DIKIRIM', label: 'Dikirim' },
  { id: 'SELESAI', label: 'Selesai' },
  { id: 'PEMBAYARAN_DITOLAK', label: 'Ditolak' },
  { id: 'DIBATALKAN', label: 'Dibatalkan' },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  MENUNGGU_PEMBAYARAN: <CreditCard size={14} color="#D97706" />,
  MENUNGGU_VERIFIKASI: <Clock3 size={14} color="#2563EB" />,
  ANTRIAN_PRODUKSI: <Layers size={14} color="#9333EA" />,
  SEDANG_DICETAK: <Printer size={14} color="#4F46E5" />,
  FINISHING: <Star size={14} color="#0891B2" />,
  SIAP_DIAMBIL: <CheckCircle2 size={14} color="#059669" />,
  DIKIRIM: <Truck size={14} color="#0891B2" />,
  SELESAI: <CheckCircle2 size={14} color="#16A34A" />,
  PEMBAYARAN_DITOLAK: <XCircle size={14} color="#DC2626" />,
  DIBATALKAN: <XCircle size={14} color="#475569" />,
};

export const OrdersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [serverBase, setServerBase] = useState('');

  const loadOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const base = await getBaseUrl();
      setServerBase(base);
      const res = await api.getMyOrders(selectedTab);
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (e) {
      console.log('Error loading orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTab, user]);

  useEffect(() => {
    setLoading(true);
    loadOrders();
  }, [selectedTab, user]);

  const formatRupiah = (val: number) =>
    'Rp ' + Math.round(val).toLocaleString('id-ID');

  const formatDate = (dateStr: string) => {
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

  const getFullImageUrl = (imgUri?: string) => {
    if (!imgUri) return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500';
    if (imgUri.startsWith('http://') || imgUri.startsWith('https://')) return imgUri;
    return `${serverBase}${imgUri.startsWith('/') ? '' : '/'}${imgUri}`;
  };

  const copyOrderNo = (orderNo: string) => {
    Clipboard.setString(orderNo);
    Alert.alert('Tersalin', `Nomor pesanan ${orderNo} telah disalin.`);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <Package size={52} color="#CBD5E1" />
        <Text style={styles.notLoggedTitle}>Masuk untuk Melihat Pesanan</Text>
        <Text style={styles.notLoggedDesc}>
          Pantau proses cetak dan riwayat transaksi dengan akun Anda.
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Masuk Akun</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Pesanan Saya</Text>
          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={() => { setRefreshing(true); loadOrders(); }}
          >
            <RefreshCw size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadOrders(); }}
            tintColor="#2563EB"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Memuat pesanan...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={52} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'all' ? 'Belum Ada Pesanan' : `Tidak Ada Pesanan "${TABS.find(t => t.id === selectedTab)?.label || selectedTab}"`}
            </Text>
            <Text style={styles.emptyDesc}>
              Pesanan percetakan Anda akan muncul di sini beserta alur proses kerjanya.
            </Text>
            {selectedTab === 'all' && (
              <TouchableOpacity
                style={styles.orderNowBtn}
                onPress={() => navigation.navigate('Katalog')}
              >
                <Text style={styles.orderNowBtnText}>Cetak Sekarang</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          orders.map((order) => {
            const statusMeta = ORDER_STATUS_LABELS[order.status] || {
              label: order.status,
              color: '#475569',
              bg: '#F1F5F9',
              border: '#E2E8F0',
            };
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
            const isNeedPayment = order.status === 'MENUNGGU_PEMBAYARAN';
            const isRejected = order.status === 'PEMBAYARAN_DITOLAK';
            const isCancelled = order.status === 'DIBATALKAN';
            const isDone = order.status === 'SELESAI';
            const statusIcon = STATUS_ICONS[order.status];

            return (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderCard,
                  { borderLeftColor: statusMeta.color, borderLeftWidth: 4 },
                ]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                {/* Order Card Header */}
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderNoCol}>
                    <TouchableOpacity
                      onLongPress={() => copyOrderNo(order.orderNo || order.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.orderNo}>{order.orderNo || `#${order.id.slice(0, 8)}`}</Text>
                    </TouchableOpacity>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
                    ]}
                  >
                    {statusIcon}
                    <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
                      {statusMeta.label}
                    </Text>
                  </View>
                </View>

                {/* First Product Summary */}
                {firstItem && (
                  <View style={styles.productSnippet}>
                    <Image
                      source={{ uri: getFullImageUrl(firstItem.product?.image) }}
                      style={styles.productImg}
                    />
                    <View style={styles.productTextCol}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {firstItem.product?.name || 'Produk Percetakan'}
                      </Text>
                      <Text style={styles.productSub}>
                        {firstItem.quantity} pcs
                        {order.items.length > 1 ? ` (+${order.items.length - 1} item lain)` : ''}
                      </Text>
                      {firstItem.product?.estDays && (
                        <Text style={styles.estDaysText}>
                          Est. {firstItem.product.estDays} hari kerja
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Cancelled / Rejected banner */}
                {(isCancelled || isRejected) && (
                  <View style={[styles.alertBanner, { backgroundColor: isRejected ? '#FEF2F2' : '#F8FAFC', borderColor: isRejected ? '#FECACA' : '#E2E8F0' }]}>
                    <XCircle size={13} color={isRejected ? '#DC2626' : '#94A3B8'} />
                    <Text style={[styles.alertBannerText, { color: isRejected ? '#DC2626' : '#64748B' }]}>
                      {isRejected
                        ? 'Bukti pembayaran Anda ditolak. Silakan unggah ulang.'
                        : 'Pesanan ini telah dibatalkan.'}
                    </Text>
                  </View>
                )}

                {/* Total and Action Button */}
                <View style={styles.orderCardFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total Tagihan</Text>
                    <Text style={styles.totalValue}>{formatRupiah(order.totalAmount)}</Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    {(isNeedPayment || isRejected) ? (
                      <TouchableOpacity
                        style={[styles.payNowBtn, isRejected && { backgroundColor: '#DC2626' }]}
                        onPress={() => navigation.navigate('PaymentUpload', { orderId: order.id })}
                      >
                        <CreditCard size={14} color="#FFFFFF" />
                        <Text style={styles.payNowBtnText}>
                          {isRejected ? 'Upload Ulang' : 'Upload Bayar'}
                        </Text>
                      </TouchableOpacity>
                    ) : isDone ? (
                      <TouchableOpacity
                        style={styles.invoiceBtn}
                        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                      >
                        <FileText size={14} color="#16A34A" />
                        <Text style={styles.invoiceBtnText}>Lihat Invoice</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                      >
                        <Text style={styles.trackBtnText}>Lacak Alur</Text>
                        <ChevronRight size={14} color="#2563EB" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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
    padding: 30,
  },
  notLoggedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    textAlign: 'center',
  },
  notLoggedDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 20,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
    gap: 12,
  },
  loadingBox: {
    paddingTop: 50,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  orderNowBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 20,
  },
  orderNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    overflow: 'hidden',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderNoCol: {
    flex: 1,
  },
  orderNo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 150,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  productSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  productImg: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  productTextCol: {
    flex: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  productSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  estDaysText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertBannerText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  payNowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  invoiceBtnText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  trackBtnText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
});
