import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, ShoppingCart } from 'lucide-react-native';
import { api, getBaseUrl } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  'Semua',
  'Banner & Spanduk',
  'Brosur & Flyer',
  'Kartu Nama',
  'Stiker & Label',
  'Merchandise',
  'Dokumen',
];

export const ProductsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [serverBase, setServerBase] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const base = await getBaseUrl();
      setServerBase(base);
      const res = await api.getProducts();
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (e) {
      console.log('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  const getFullImageUrl = (imgUri: string) => {
    if (!imgUri) return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500';
    if (imgUri.startsWith('http://') || imgUri.startsWith('https://')) return imgUri;
    return `${serverBase}${imgUri.startsWith('/') ? '' : '/'}${imgUri}`;
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

    if (selectedCategory === 'Semua') return matchSearch;

    const matchCategory =
      p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchSearch && matchCategory;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Katalog Percetakan</Text>
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

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk cetak, spanduk, brosur..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Produk Tidak Ditemukan</Text>
          <Text style={styles.emptyDesc}>Coba ganti kata kunci atau pilih kategori lain.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
              <Image source={{ uri: getFullImageUrl(item.image) }} style={styles.cardImg} resizeMode="cover" />
              <View style={styles.cardBody}>
                <Text style={styles.cardCat}>{item.category || 'Percetakan'}</Text>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                
                <View style={styles.priceRow}>
                  <Text style={styles.cardPrice}>
                    {formatRupiah(item.price)}
                    {item.priceType === 'M2' ? <Text style={styles.unitText}> /m²</Text> : null}
                  </Text>
                </View>

                {item.priceType === 'M2' && (
                  <View style={styles.m2Badge}>
                    <Text style={styles.m2BadgeText}>Hitung Luas m²</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: 130,
    backgroundColor: '#F1F5F9',
  },
  cardBody: {
    padding: 12,
  },
  cardCat: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    minHeight: 34,
    lineHeight: 17,
  },
  priceRow: {
    marginTop: 6,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  unitText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  m2Badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  m2BadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});
