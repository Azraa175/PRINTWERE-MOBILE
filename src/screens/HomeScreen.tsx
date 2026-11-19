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
  Layers
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, getBaseUrl } from '../services/api';
import { Product } from '../types';

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverBase, setServerBase] = useState('');
  const [trackQuery, setTrackQuery] = useState('');

  const loadData = async () => {
    try {
      const base = await getBaseUrl();
      setServerBase(base);
      const res = await api.getProducts();
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data.slice(0, 6));
      }
    } catch (e) {
      console.log('Error loading home products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
      >
        {/* User Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            Halo, {user ? user.name.split(' ')[0] : 'Pelanggan'}! 👋
          </Text>
          <Text style={styles.greetingDesc}>
            Mau cetak apa hari ini? Pesanan siap kami kerjakan.
          </Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Sparkles size={12} color="#93C5FD" />
            <Text style={styles.heroBadgeText}>Percetakan Online No. 1</Text>
          </View>
          <Text style={styles.heroTitle}>Cepat, Presisi & Kualitas Premium</Text>
          <Text style={styles.heroDesc}>
            Spanduk M², brosur, stiker, hingga dokumen bisnis selesai tepat waktu.
          </Text>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => navigation.navigate('Katalog')}
          >
            <Text style={styles.heroButtonText}>Lihat Katalog</Text>
            <ArrowRight size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Quick Track Order Bar */}
        <View style={styles.trackCard}>
          <View style={styles.trackHeader}>
            <Search size={16} color="#2563EB" />
            <Text style={styles.trackTitle}>Lacak Pesanan Cepat</Text>
          </View>
          <View style={styles.trackInputRow}>
            <TextInput
              placeholder="Masukkan No. Pesanan (#PW-...)"
              placeholderTextColor="#94A3B8"
              value={trackQuery}
              onChangeText={setTrackQuery}
              style={styles.trackInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.trackSubmitBtn} onPress={handleTrackSubmit}>
              <Text style={styles.trackSubmitBtnText}>Cari</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Value Propositions (4 Icons) */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Clock size={18} color="#2563EB" />
            </View>
            <Text style={styles.featureTitle}>Cepat Tepat</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBg, { backgroundColor: '#ECFDF5' }]}>
              <CheckCircle size={18} color="#059669" />
            </View>
            <Text style={styles.featureTitle}>Mesin Modern</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBg, { backgroundColor: '#FAF5FF' }]}>
              <Truck size={18} color="#9333EA" />
            </View>
            <Text style={styles.featureTitle}>Kirim Aman</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBg, { backgroundColor: '#FFFBEB' }]}>
              <ShieldCheck size={18} color="#D97706" />
            </View>
            <Text style={styles.featureTitle}>Garansi Cetak</Text>
          </View>
        </View>

        {/* Recommended Products Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Produk Pilihan</Text>
            <Text style={styles.sectionSub}>Bahan terbaik untuk hasil maksimal</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Katalog')}>
            <Text style={styles.seeAllText}>Semua →</Text>
          </TouchableOpacity>
        </View>

        {/* Products Grid */}
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
                <Image
                  source={{ uri: getFullImageUrl(item.image) }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{item.category || 'Percetakan'}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>
                      {formatRupiah(item.price)}
                      {item.priceType === 'M2' ? <Text style={styles.perUnit}> /m²</Text> : null}
                    </Text>
                  </View>

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
    paddingBottom: 40,
  },
  greetingContainer: {
    marginBottom: 16,
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
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
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
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  trackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
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
    height: 40,
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
    paddingHorizontal: 16,
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
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
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
    marginBottom: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    padding: 12,
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
  priceRow: {
    marginVertical: 6,
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
  orderSmallBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
  },
  orderSmallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
