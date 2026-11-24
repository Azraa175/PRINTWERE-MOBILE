import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Printer,
  ShoppingCart,
  Search,
  Clock,
  CheckCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Package,
  Bell,
  Star,
  Zap,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, getBaseUrl } from '../services/api';
import { Product, Order, ORDER_STATUS_LABELS } from '../types';

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverBase, setServerBase] = useState('');
  const [trackQuery, setTrackQuery] = useState('');

  const ACTIVE_STATUSES = [
    'MENUNGGU_PEMBAYARAN',
    'MENUNGGU_VERIFIKASI',
    'ANTRIAN_PRODUKSI',
    'SEDANG_DICETAK',
    'FINISHING',
    'SIAP_DIAMBIL',
    'DIKIRIM',
  ];

  const loadData = async () => {
    try {
      const base = await getBaseUrl();
      setServerBase(base);

      const [productsRes, ordersRes] = await Promise.all([
        api.getProducts(),
        user ? api.getMyOrders('all') : Promise.resolve({ success: false, data: [] }),
      ]);

      if (productsRes.success && Array.isArray(productsRes.data)) {
        setProducts(productsRes.data.slice(0, 6));
      }

      if (ordersRes.success && Array.isArray(ordersRes.data)) {
        const active = (ordersRes.data as Order[]).filter(o =>
          ACTIVE_STATUSES.includes(o.status)
        );
        setActiveOrders(active);
      }
    } catch (e) {
      console.log('Error loading home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const formatRupiah = (val: number) =>
    'Rp ' + Math.round(val).toLocaleString('id-ID');

  const getFullImageUrl = (imgUri: string) => {
    if (!imgUri) return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500';
    if (imgUri.startsWith('http://') || imgUri.startsWith('https://')) return imgUri;
    return `${serverBase}${imgUri.startsWith('/') ? '' : '/'}${imgUri}`;
  };

  const handleTrackSubmit = () => {
    if (!trackQuery.trim()) return;
    navigation.navigate('OrderDetail', { orderId: trackQuery.trim() });
    setTrackQuery('');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Printer size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandName}>PrintWere</Text>
            <Text style={styles.brandSub}>Percetakan Digital</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {user && activeOrders.length > 0 && (
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Pesanan')}
            >
              <Bell size={18} color="#2563EB" />
              <View style={styles.notifDot}>
                <Text style={styles.notifDotText}>
                  {activeOrders.length > 9 ? '9+' : activeOrders.length}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <ShoppingCart size={20} color="#334155" />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor="#2563EB"
          />
        }
      >
        {/* User Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            {getGreeting()}, {user ? user.name.split(' ')[0] : 'Pelanggan'}! 👋
          </Text>
          <Text style={styles.greetingDesc}>
            Mau cetak apa hari ini? Pesanan siap kami kerjakan.
          </Text>
        </View>

        {/* Active Order Banner — only if user is logged in & has active orders */}
        {user && activeOrders.length > 0 && (
          <TouchableOpacity
            style={styles.activeOrderBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Pesanan')}
          >
            <View style={styles.activeOrderLeft}>
              <View style={styles.activeOrderIconBg}>
                <Package size={18} color="#FFFFFF" />
              </View>
              <View style={styles.activeOrderText}>
                <Text style={styles.activeOrderTitle}>
                  {activeOrders.length} Pesanan Sedang Berjalan
                </Text>
                <Text style={styles.activeOrderSub}>
                  {ORDER_STATUS_LABELS[activeOrders[0].status]?.label || activeOrders[0].status}
                  {activeOrders.length > 1 ? ` (+${activeOrders.length - 1} lainnya)` : ''}
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Sparkles size={12} color="#93C5FD" />
            <Text style={styles.heroBadgeText}>Percetakan Online No. 1</Text>
          </View>
          <Text style={styles.heroTitle}>Cepat, Presisi &amp; Kualitas Premium</Text>
          <Text style={styles.heroDesc}>
            Spanduk M², brosur, stiker, hingga dokumen bisnis selesai tepat waktu.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('Katalog')}
            >
              <Text style={styles.heroButtonText}>Lihat Katalog</Text>
              <ArrowRight size={16} color="#2563EB" />
            </TouchableOpacity>
            {!user && (
              <TouchableOpacity
                style={styles.heroLoginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.heroLoginButtonText}>Masuk Akun</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Track Order Bar */}
        <View style={styles.trackCard}>
          <View style={styles.trackHeader}>
            <Search size={16} color="#2563EB" />
            <Text style={styles.trackTitle}>Lacak Pesanan Cepat</Text>
          </View>
          <View style={styles.trackInputRow}>
            <TextInput
              placeholder="Masukkan No. Pesanan (PW-...)"
              placeholderTextColor="#94A3B8"
              value={trackQuery}
              onChangeText={setTrackQuery}
              style={styles.trackInput}
              autoCapitalize="characters"
              onSubmitEditing={handleTrackSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.trackSubmitBtn} onPress={handleTrackSubmit}>
              <Text style={styles.trackSubmitBtnText}>Cari</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Value Propositions */}
        <View style={styles.featuresRow}>
          {[
            { icon: <Clock size={18} color="#2563EB" />, bg: '#EFF6FF', title: 'Cepat Tepat' },
            { icon: <Zap size={18} color="#059669" />, bg: '#ECFDF5', title: 'Mesin Modern' },
            { icon: <Truck size={18} color="#9333EA" />, bg: '#FAF5FF', title: 'Kirim Aman' },
            { icon: <ShieldCheck size={18} color="#D97706" />, bg: '#FFFBEB', title: 'Garansi Cetak' },
          ].map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={[styles.featureIconBg, { backgroundColor: f.bg }]}>{f.icon}</View>
              <Text style={styles.featureTitle}>{f.title}</Text>
            </View>
          ))}
        </View>

        {/* Recommended Products Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Produk Pilihan</Text>
            <Text style={styles.sectionSub}>Bahan terbaik untuk hasil maksimal</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Katalog')}>
            <Text style={styles.seeAllText}>Semua →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.productGrid}>
            {products.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              >
                <View style={styles.productImageWrap}>
                  <Image
                    source={{ uri: getFullImageUrl(item.image) }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  {item.isRecommended && (
                    <View style={styles.recommendBadge}>
                      <Star size={8} color="#D97706" />
                      <Text style={styles.recommendBadgeText}>Terlaris</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{item.category || 'Percetakan'}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                  {item.rating && (
                    <View style={styles.ratingRow}>
                      <Star size={10} color="#F59E0B" />
                      <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>
                      {formatRupiah(item.price)}
                      {item.priceType === 'M2' ? <Text style={styles.perUnit}> /m²</Text> : null}
                    </Text>
                  </View>

                  {item.estDays && (
                    <Text style={styles.estText}>Est. {item.estDays} hari</Text>
                  )}

                  <TouchableOpacity
                    style={styles.orderSmallBtn}
                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                  >
                    <Text style={styles.orderSmallBtnText}>Pesan Sekarang</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CTA Bottom */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => navigation.navigate('Katalog')}
          activeOpacity={0.85}
        >
          <Printer size={20} color="#2563EB" />
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Lihat Semua Produk</Text>
            <Text style={styles.ctaSub}>Temukan lebih banyak pilihan percetakan</Text>
          </View>
          <ArrowRight size={18} color="#2563EB" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifDotText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
    gap: 14,
  },
  greetingContainer: {
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  greetingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activeOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2563EB',
    borderRadius: 18,
    padding: 14,
  },
  activeOrderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activeOrderIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeOrderText: {
    flex: 1,
  },
  activeOrderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeOrderSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  heroButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  heroLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroLoginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  trackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  trackInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trackInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  trackSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  productImageWrap: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  recommendBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  recommendBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    minHeight: 32,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
  },
  priceRow: {
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  perUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  estText: {
    fontSize: 9,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 4,
  },
  orderSmallBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 2,
  },
  orderSmallBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  ctaSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
});
