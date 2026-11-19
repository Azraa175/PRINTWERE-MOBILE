import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Minus, Upload, FileText, CheckCircle, Calculator, ShoppingBag } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, getBaseUrl } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { productId } = route.params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverBase, setServerBase] = useState('');

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState('1');
  const [height, setHeight] = useState('1');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFinishing, setSelectedFinishing] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [designFile, setDesignFile] = useState<{ uri: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [productId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const base = await getBaseUrl();
      setServerBase(base);
      const res = await api.getProductById(productId);
      if (res.success && res.data) {
        setProduct(res.data);
        if (res.data.sizes) {
          const sizeList = res.data.sizes.split(',').map((s: string) => s.trim());
          if (sizeList.length > 0) setSelectedSize(sizeList[0]);
        }
        if (res.data.finishing) {
          const finList = res.data.finishing.split(',').map((f: string) => f.trim());
          if (finList.length > 0) setSelectedFinishing(finList[0]);
        }
      }
    } catch (e) {
      console.log('Error loading product detail:', e);
      Alert.alert('Gagal', 'Tidak dapat memuat detail produk');
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

  // M2 calculations
  const parsedWidth = parseFloat(width) || 0;
  const parsedHeight = parseFloat(height) || 0;
  const areaM2 = parsedWidth * parsedHeight;

  const calculateItemPrice = () => {
    if (!product) return 0;
    if (product.priceType === 'M2') {
      const minArea = product.minArea || 1.0;
      const effectiveArea = Math.max(areaM2, minArea);
      return product.price * effectiveArea;
    }
    return product.price;
  };

  const singleItemPrice = calculateItemPrice();
  const totalPrice = singleItemPrice * quantity;

  const handlePickFile = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Dibutuhkan', 'Izinkan akses galeri untuk mengunggah desain cetak.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `desain_${Date.now()}.jpg`;
        setDesignFile({ uri: asset.uri, name: fileName });
      }
    } catch (err) {
      console.log('Pick file error:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.priceType === 'M2' && areaM2 <= 0) {
      Alert.alert('Perhatian', 'Panjang dan lebar harus lebih dari 0.');
      return;
    }

    const options: Record<string, string> = {};
    if (selectedSize) options['Ukuran'] = selectedSize;
    if (selectedFinishing) options['Finishing'] = selectedFinishing;

    let finalFileUrl = designFile ? designFile.uri : undefined;

    // Add to cart
    addToCart({
      productId: product.id,
      product,
      quantity,
      price: product.price,
      width: product.priceType === 'M2' ? parsedWidth : undefined,
      height: product.priceType === 'M2' ? parsedHeight : undefined,
      options,
      notes: notes.trim() || undefined,
      fileUri: finalFileUrl,
      fileName: designFile?.name,
    });

    Alert.alert('Berhasil', 'Produk ditambahkan ke keranjang belanja.', [
      { text: 'Lanjut Belanja', style: 'cancel' },
      { text: 'Buka Keranjang', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  if (loading || !product) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat spesifikasi produk...</Text>
      </View>
    );
  }

  const sizesList = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : [];
  const finishingList = product.finishing ? product.finishing.split(',').map((f) => f.trim()) : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle} numberOfLines={1}>Detail Produk</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: getFullImageUrl(product.image) }} style={styles.heroImg} resizeMode="cover" />

        <View style={styles.cardInfo}>
          <Text style={styles.categoryBadge}>{product.category || 'Percetakan'}</Text>
          <Text style={styles.productTitle}>{product.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatRupiah(product.price)}</Text>
            {product.priceType === 'M2' ? (
              <Text style={styles.priceTypeBadge}>per meter persegi (m²)</Text>
            ) : (
              <Text style={styles.priceTypeBadge}>per pcs</Text>
            )}
          </View>

          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* M2 Dimension Calculator Section */}
        {product.priceType === 'M2' && (
          <View style={styles.calculatorSection}>
            <View style={styles.calcHeader}>
              <Calculator size={18} color="#2563EB" />
              <Text style={styles.calcHeaderTitle}>Kalkulator Luas Spanduk / Banner</Text>
            </View>

            <View style={styles.dimensionInputsRow}>
              <View style={styles.dimField}>
                <Text style={styles.dimLabel}>Panjang (meter)</Text>
                <TextInput
                  style={styles.dimInput}
                  keyboardType="numeric"
                  value={width}
                  onChangeText={setWidth}
                  placeholder="1.0"
                />
              </View>
              <Text style={styles.dimTimes}>×</Text>
              <View style={styles.dimField}>
                <Text style={styles.dimLabel}>Lebar (meter)</Text>
                <TextInput
                  style={styles.dimInput}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="1.0"
                />
              </View>
            </View>

            <View style={styles.areaCalculationBox}>
              <Text style={styles.areaCalcText}>
                Total Luas: <Text style={styles.boldText}>{areaM2.toFixed(2)} m²</Text>
              </Text>
              <Text style={styles.areaSubText}>
                Harga satuan: {formatRupiah(singleItemPrice)}
              </Text>
            </View>
          </View>
        )}

        {/* Sizes Options */}
        {sizesList.length > 0 && (
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>Pilih Ukuran / Dimensi</Text>
            <View style={styles.chipsRow}>
              {sizesList.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedSize(sz)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{sz}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Finishing Options */}
        {finishingList.length > 0 && (
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>Pilihan Finishing</Text>
            <View style={styles.chipsRow}>
              {finishingList.map((fin) => {
                const isSelected = selectedFinishing === fin;
                return (
                  <TouchableOpacity
                    key={fin}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedFinishing(fin)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{fin}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Design File Upload */}
        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>Upload File Desain (Siap Cetak)</Text>
          <Text style={styles.optionSubtitle}>Format foto/gambar JPG, PNG, atau desain Anda</Text>

          {designFile ? (
            <View style={styles.uploadedFileBox}>
              <View style={styles.fileLeft}>
                <CheckCircle size={20} color="#059669" />
                <Text style={styles.fileNameText} numberOfLines={1}>{designFile.name}</Text>
              </View>
              <TouchableOpacity onPress={handlePickFile}>
                <Text style={styles.changeFileText}>Ganti</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadDottedBtn} onPress={handlePickFile}>
              <Upload size={22} color="#2563EB" />
              <Text style={styles.uploadBtnText}>Pilih Berkas dari Galeri</Text>
              <Text style={styles.uploadBtnSub}>Maksimal ukuran 10MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes */}
        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>Catatan Khusus Percetakan</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Contoh: Mata ayam tiap 1 meter, laminasi doff, dsb."
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Quantity Counter */}
        <View style={styles.quantitySection}>
          <Text style={styles.optionTitle}>Jumlah Cetak</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={16} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Plus size={16} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Estimasi</Text>
          <Text style={styles.bottomPriceValue}>{formatRupiah(totalPrice)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.addToCartBtn} 
          onPress={handleAddToCart}
          disabled={isUploading}
        >
          <ShoppingBag size={18} color="#FFFFFF" />
          <Text style={styles.addToCartBtnText}>Tambah Keranjang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroImg: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2E8F0',
  },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  priceTypeBadge: {
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 4,
  },
  calculatorSection: {
    backgroundColor: '#EFF6FF',
    margin: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  calcHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  dimensionInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimField: {
    flex: 1,
  },
  dimLabel: {
    fontSize: 11,
    color: '#1E3A8A',
    marginBottom: 4,
    fontWeight: '600',
  },
  dimInput: {
    backgroundColor: '#FFFFFF',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dimTimes: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginHorizontal: 12,
    marginTop: 18,
  },
  areaCalculationBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaCalcText: {
    fontSize: 12,
    color: '#1E40AF',
  },
  boldText: {
    fontWeight: '800',
    color: '#1E3A8A',
  },
  areaSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  optionSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  uploadDottedBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  uploadBtnSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  uploadedFileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fileNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  changeFileText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  quantitySection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 24,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
