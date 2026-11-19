import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight, FileCheck } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getBaseUrl } from '../services/api';

export const CartScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const [serverBase, setServerBase] = React.useState('');

  React.useEffect(() => {
    getBaseUrl().then(setServerBase);
  }, []);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  const getFullImageUrl = (imgUri: string) => {
    if (!imgUri) return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500';
    if (imgUri.startsWith('http://') || imgUri.startsWith('https://')) return imgUri;
    return `${serverBase}${imgUri.startsWith('/') ? '' : '/'}${imgUri}`;
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Perlu Login',
        'Silakan masuk dengan akun pelanggan terlebih dahulu untuk memproses pesanan.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('Checkout');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Keranjang Belanja</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={() => clearCart()}>
            <Text style={styles.clearCartText}>Kosongkan</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <ShoppingBag size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Keranjang Masih Kosong</Text>
          <Text style={styles.emptyDesc}>
            Pilih produk percetakan yang Anda butuhkan dari katalog kami.
          </Text>
          <TouchableOpacity 
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Katalog')}
          >
            <Text style={styles.exploreBtnText}>Jelajahi Katalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {items.map((item, index) => {
              const isM2 = item.product?.priceType === 'M2' && item.width && item.height;
              const unitPrice = isM2 
                ? item.price * (item.width! * item.height!) 
                : item.price;
              const subtotal = unitPrice * item.quantity;

              return (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Image
                      source={{ uri: getFullImageUrl(item.product?.image) }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.product?.name}
                      </Text>
                      <Text style={styles.itemUnitPrice}>
                        {formatRupiah(unitPrice)} / pcs
                      </Text>

                      {isM2 && (
                        <View style={styles.m2Tag}>
                          <Text style={styles.m2TagText}>
                            📐 {item.width}m × {item.height}m ({(item.width! * item.height!).toFixed(2)} m²)
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeFromCart(index)}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Options & Notes */}
                  {item.options && Object.keys(item.options).length > 0 && (
                    <View style={styles.optionBox}>
                      <Text style={styles.optionBoxText}>
                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join('  |  ')}
                      </Text>
                    </View>
                  )}

                  {item.fileUri && (
                    <View style={styles.fileTag}>
                      <FileCheck size={14} color="#059669" />
                      <Text style={styles.fileTagText}>Berkas desain telah terlampir</Text>
                    </View>
                  )}

                  {item.notes && (
                    <Text style={styles.notesText}>Catatan: "{item.notes}"</Text>
                  )}

                  {/* Bottom Item Row: Subtotal & Quantity Stepper */}
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemSubtotalText}>
                      Subtotal: <Text style={styles.boldBlue}>{formatRupiah(subtotal)}</Text>
                    </Text>

                    <View style={styles.counterRow}>
                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <Minus size={14} color="#0F172A" />
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus size={14} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Sticky Checkout Bar */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={styles.bottomPriceCol}>
              <Text style={styles.bottomLabel}>Total Belanja</Text>
              <Text style={styles.bottomValue}>{formatRupiah(totalAmount)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Lanjut Checkout</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  clearCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  itemUnitPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  m2Tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  m2TagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
  },
  deleteBtn: {
    padding: 4,
  },
  optionBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  optionBoxText: {
    fontSize: 11,
    color: '#475569',
  },
  fileTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  fileTagText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  notesText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 6,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemSubtotalText: {
    fontSize: 12,
    color: '#64748B',
  },
  boldBlue: {
    fontWeight: '800',
    color: '#2563EB',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 18,
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
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
