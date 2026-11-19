import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Copy, 
  CreditCard, 
  QrCode,
  ShieldAlert,
  Building
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { Order } from '../types';

const BANK_ACCOUNTS = [
  { bank: 'BCA', no: '8735019283', name: 'PT PRINTWERE DIGITAL' },
  { bank: 'Mandiri', no: '1370019283741', name: 'PT PRINTWERE DIGITAL' },
  { bank: 'BRI', no: '012901029384501', name: 'PT PRINTWERE DIGITAL' },
];

export const PaymentUploadScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await api.getOrderById(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (e) {
      console.log('Error loading order for payment:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  const handlePickProof = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Dibutuhkan', 'Izinkan akses galeri untuk mengunggah bukti transfer.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Pick proof error:', err);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofImage) {
      Alert.alert('Perhatian', 'Silakan pilih gambar bukti transfer terlebih dahulu.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Upload file to server
      const uploadRes = await api.uploadFile(proofImage, `bukti_bayar_${orderId}.jpg`);
      if (!uploadRes.success || !uploadRes.fileUrl) {
        throw new Error(uploadRes.error || 'Gagal mengunggah foto bukti pembayaran');
      }

      // 2. Submit payment proof to order
      const res = await api.uploadPaymentProof(orderId, uploadRes.fileUrl);
      if (res.success) {
        Alert.alert(
          'Bukti Pembayaran Diterima!',
          'Admin akan memverifikasi transfer Anda. Status pesanan telah beralih ke "Menunggu Verifikasi".',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('OrderDetail', { orderId }),
            },
          ]
        );
      } else {
        Alert.alert('Gagal', res.error || 'Gagal menyimpan bukti pembayaran');
      }
    } catch (err: any) {
      Alert.alert('Kesalahan', err.message || 'Terjadi gangguan saat mengirim bukti bayar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !order) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat instruksi pembayaran...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Pembayaran Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bill Summary Banner */}
        <View style={styles.billCard}>
          <Text style={styles.billLabel}>Total yang Harus Ditransfer</Text>
          <Text style={styles.billAmount}>{formatRupiah(order.totalAmount)}</Text>
          <Text style={styles.billOrderNo}>No. Pesanan: {order.orderNo || `#${order.id.slice(0, 8)}`}</Text>
        </View>

        {/* Bank Accounts Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Building size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Rekening Resmi PrintWere</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Transfer tepat sesuai nominal tagihan ke salah satu rekening berikut:
          </Text>

          <View style={styles.banksList}>
            {BANK_ACCOUNTS.map((bank, idx) => (
              <View key={idx} style={styles.bankCard}>
                <View>
                  <Text style={styles.bankName}>{bank.bank}</Text>
                  <Text style={styles.bankNo}>{bank.no}</Text>
                  <Text style={styles.bankHolder}>a.n {bank.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => Alert.alert('Tersalin', `Nomor rekening ${bank.bank} disalin.`)}
                >
                  <Copy size={14} color="#2563EB" />
                  <Text style={styles.copyBtnText}>Salin</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Upload Receipt Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Upload size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Unggah Bukti Transfer</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Foto struk ATM, bukti m-Banking, atau screenshot pembayaran QRIS.
          </Text>

          {proofImage ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: proofImage }} style={styles.previewImg} resizeMode="cover" />
              <TouchableOpacity style={styles.rePickBtn} onPress={handlePickProof}>
                <Text style={styles.rePickBtnText}>Ganti Foto Bukti</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadArea} onPress={handlePickProof}>
              <Upload size={32} color="#2563EB" />
              <Text style={styles.uploadMainText}>Pilih Foto dari Galeri</Text>
              <Text style={styles.uploadSubText}>Format JPG atau PNG (Maks. 10MB)</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Submit Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={[styles.submitBtn, (!proofImage || isSubmitting) && styles.submitBtnDisabled]}
          onPress={handleSubmitProof}
          disabled={!proofImage || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Konfirmasi & Kirim Bukti</Text>
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
  centerBox: {
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
  billCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#60A5FA',
  },
  billOrderNo: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 6,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  banksList: {
    gap: 8,
  },
  bankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  bankNo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
    marginVertical: 2,
  },
  bankHolder: {
    fontSize: 10,
    color: '#64748B',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  uploadMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  uploadSubText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  previewBox: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImg: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
  },
  rePickBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  rePickBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
