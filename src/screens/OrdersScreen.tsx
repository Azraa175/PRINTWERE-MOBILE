import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Package, 
  ChevronRight, 
  CreditCard, 
  AlertCircle, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react-native';
import { api, getBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Order, ORDER_STATUS_LABELS } from '../types';

const TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'MENUNGGU_PEMBAYARAN', label: 'Belum Bayar' },
  { id: 'MENUNGGU_VERIFIKASI', label: 'Verifikasi' },
  { id: 'SEDANG_DICETAK', label: 'Proses Cetak' },
  { id: 'SELESAI', label: 'Selesai' },
];

export const OrdersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [serverBase, setServerBase] = useState('');

  const loadOrders = async () => {
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
  };

  useEffect(() => {
    loadOrders();
  }, [selectedTab, user]);

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

  if (!user) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <Package size={50} color="#94A3B8" />
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
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
            <Text style={styles.emptyDesc}>
              Pesanan percetakan Anda akan muncul di sini beserta alur proses kerjanya.
            </Text>
            <TouchableOpacity 
              style={styles.orderNowBtn}
              onPress={() => navigation.navigate('Katalog')}
            >
              <Text style={styles.orderNowBtnText}>Cetak Sekarang</Text>
            </TouchableOpacity>
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
            const isNeedPayment = order.status === 'MENUNGGU_PEMBAYARAN' || order.status === 'PENDING';

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                {/* Order Card Header */}
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderNoCol}>
                    <Text style={styles.orderNo}>{order.orderNo || `#${order.id.slice(0, 8)}`}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
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
                        {firstItem.quantity} pcs {order.items.length > 1 ? `(+${order.items.length - 1} item lain)` : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Total and Action Button */}
                <View style={styles.orderCardFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total Tagihan</Text>
                    <Text style={styles.totalValue}>{formatRupiah(order.totalAmount)}</Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    {isNeedPayment ? (
                      <TouchableOpacity
                        style={styles.payNowBtn}
                        onPress={() => navigation.navigate('PaymentUpload', { orderId: order.id })}
                      >
                        <CreditCard size={14} color="#FFFFFF" />
                        <Text style={styles.payNowBtnText}>Upload Bayar</Text>
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
  },
  notLoggedDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
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
    paddingVertical: 6,
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
    paddingBottom: 40,
    gap: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  orderNowBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  orderNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
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
    width: 44,
    height: 44,
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
    fontSize: 14,
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
    paddingVertical: 8,
    borderRadius: 10,
  },
  payNowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
