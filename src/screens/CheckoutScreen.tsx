import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Store,
  QrCode
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CheckoutScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.bio || '');

  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'COURIER'>('PICKUP');
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'QRIS' | 'COD'>('TRANSFER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = deliveryType === 'COURIER' ? 15000 : 0;
  const grandTotal = totalAmount + shippingCost;

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      Alert.alert('Perhatian', 'Mohon lengkapi alamat pengiriman / domisili Anda.');
      return;
    }

    if (!recipientPhone.trim()) {
      Alert.alert('Perhatian', 'Mohon cantumkan nomor WhatsApp / HP yang aktif.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload local design files if needed
      const orderItems = [];
      for (const item of items) {
        let uploadedUrl = null;
        if (item.fileUri) {
          try {
            const upRes = await api.uploadFile(item.fileUri, item.fileName || 'desain.jpg');
            if (upRes.success) {
              uploadedUrl = upRes.fileUrl;
            }
          } catch (upErr) {
            console.log('Failed to upload design:', upErr);
          }
        }

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          width: item.width,
          height: item.height,
          fileUrl: uploadedUrl,
          notes: item.notes,
          options: item.options,
        });
      }

      const res = await api.createOrder({
        items: orderItems,
        totalAmount: grandTotal,
        paymentMethod,
        phone: recipientPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingMethod: deliveryType === 'PICKUP' ? 'Ambil di Toko' : 'Kurir Standar (JNE/J&T)',
        shippingCost,
      });

      if (res.success && res.data) {
        clearCart();
        const createdOrder = res.data;
        Alert.alert(
          'Pesanan Berhasil Dibuat!',
          `Nomor Pesanan: ${createdOrder.orderNo}\nSilakan selesaikan pembayaran agar pesanan segera masuk ke antrean cetak.`,
          [
            {
              text: 'Bayar Sekarang',
              onPress: () => navigation.replace('PaymentUpload', { orderId: createdOrder.id }),
            },
            {
              text: 'Lihat Detail',
              onPress: () => navigation.replace('OrderDetail', { orderId: createdOrder.id }),
            },
          ]
        );
      } else {
        Alert.alert('Gagal', res.error || 'Gagal memproses pesanan');
      }
    } catch (err: any) {
      Alert.alert('Kesalahan', err.message || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Konfirmasi Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recipient Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Informasi Penerima</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.textInput}
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="Nama pemesan"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nomor WhatsApp / Telepon</Text>
            <TextInput
              style={styles.textInput}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              placeholder="081234567890"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Alamat Pengiriman / Domisili</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              placeholder="Alamat lengkap tujuan kirim atau patokan pengambilan"
              multiline
            />
          </View>
        </View>

        {/* Delivery Options */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Truck size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Metode Pengambilan / Kirim</Text>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[styles.optionCard, deliveryType === 'PICKUP' && styles.optionCardActive]}
              onPress={() => setDeliveryType('PICKUP')}
            >
              <View style={styles.optionLeft}>
                <Store size={20} color={deliveryType === 'PICKUP' ? '#2563EB' : '#64748B'} />
                <View>
                  <Text style={[styles.optionName, deliveryType === 'PICKUP' && styles.optionNameActive]}>
                    Ambil Langsung di Percetakan
                  </Text>
                  <Text style={styles.optionSub}>Bebas ongkos kirim saat cetakan siap</Text>
                </View>
              </View>
              <Text style={styles.optionCost}>Rp 0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, deliveryType === 'COURIER' && styles.optionCardActive]}
              onPress={() => setDeliveryType('COURIER')}
            >
              <View style={styles.optionLeft}>
                <Truck size={20} color={deliveryType === 'COURIER' ? '#2563EB' : '#64748B'} />
                <View>
                  <Text style={[styles.optionName, deliveryType === 'COURIER' && styles.optionNameActive]}>
                    Pengiriman Kurir Ekspedisi
                  </Text>
                  <Text style={styles.optionSub}>JNE, J&T, atau Kurir Lokal (1-3 hari)</Text>
                </View>
              </View>
              <Text style={styles.optionCost}>Rp 15.000</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CreditCard size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[styles.optionCard, paymentMethod === 'TRANSFER' && styles.optionCardActive]}
              onPress={() => setPaymentMethod('TRANSFER')}
            >
              <View style={styles.optionLeft}>
                <CreditCard size={20} color={paymentMethod === 'TRANSFER' ? '#2563EB' : '#64748B'} />
                <View>
                  <Text style={[styles.optionName, paymentMethod === 'TRANSFER' && styles.optionNameActive]}>
                    Transfer Bank / Virtual Account
                  </Text>
                  <Text style={styles.optionSub}>BCA, Mandiri, BRI, BNI (Upload bukti bayar)</Text>
                </View>
              </View>
              {paymentMethod === 'TRANSFER' && <CheckCircle2 size={18} color="#2563EB" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, paymentMethod === 'QRIS' && styles.optionCardActive]}
              onPress={() => setPaymentMethod('QRIS')}
            >
              <View style={styles.optionLeft}>
                <QrCode size={20} color={paymentMethod === 'QRIS' ? '#2563EB' : '#64748B'} />
                <View>
                  <Text style={[styles.optionName, paymentMethod === 'QRIS' && styles.optionNameActive]}>
                    QRIS & E-Wallet
                  </Text>
                  <Text style={styles.optionSub}>GoPay, OVO, DANA, ShopeePay</Text>
                </View>
              </View>
              {paymentMethod === 'QRIS' && <CheckCircle2 size={18} color="#2563EB" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, paymentMethod === 'COD' && styles.optionCardActive]}
              onPress={() => setPaymentMethod('COD')}
            >
              <View style={styles.optionLeft}>
                <Store size={20} color={paymentMethod === 'COD' ? '#2563EB' : '#64748B'} />
                <View>
                  <Text style={[styles.optionName, paymentMethod === 'COD' && styles.optionNameActive]}>
                    Bayar di Kasir (COD)
                  </Text>
                  <Text style={styles.optionSub}>Bayar tunai saat pesanan diambil</Text>
                </View>
              </View>
              {paymentMethod === 'COD' && <CheckCircle2 size={18} color="#2563EB" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Cost Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Harga Produk ({items.length} item)</Text>
            <Text style={styles.summaryValue}>{formatRupiah(totalAmount)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Biaya Ongkir</Text>
            <Text style={styles.summaryValue}>{formatRupiah(shippingCost)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Tagihan</Text>
            <Text style={styles.grandTotalValue}>{formatRupiah(grandTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Place Order Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomLabel}>Total Tagihan</Text>
          <Text style={styles.bottomValue}>{formatRupiah(grandTotal)}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.placeOrderBtn, isSubmitting && { opacity: 0.7 }]} 
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderBtnText}>Buat Pesanan</Text>
          )}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  optionNameActive: {
    color: '#1E40AF',
  },
  optionSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  optionCost: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  grandTotalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
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
  placeOrderBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    minWidth: 140,
    alignItems: 'center',
  },
  placeOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
