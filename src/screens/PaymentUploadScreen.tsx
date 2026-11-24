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
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Copy,
  Building,
  AlertCircle,
  RefreshCw,
  Camera,
  ImageIcon,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { Order } from '../types';

const BANK_ACCOUNTS = [
  { bank: 'BCA', no: '8735019283', name: 'PT PRINTWERE DIGITAL', color: '#1E40AF' },
  { bank: 'Mandiri', no: '1370019283741', name: 'PT PRINTWERE DIGITAL', color: '#065F46' },
  { bank: 'BRI', no: '012901029384501', name: 'PT PRINTWERE DIGITAL', color: '#7C2D12' },
];

export const PaymentUploadScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string>('');
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

  const formatRupiah = (val: number) =>
    'Rp ' + Math.round(val).toLocaleString('id-ID');

  const copyAccountNo = async (no: string, bank: string) => {
    Clipboard.setString(no);
    Alert.alert('Tersalin! ✓', `Nomor rekening ${bank} (${no}) telah disalin ke clipboard.`);
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
        allowsEditing: true,
        quality: 0.85,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProofImage(asset.uri);
        // Calculate file size estimate
        if (asset.fileSize) {
          const kb = asset.fileSize / 1024;
          if (kb > 1024) {
            setImageSize(`${(kb / 1024).toFixed(1)} MB`);
          } else {
            setImageSize(`${Math.round(kb)} KB`);
          }
        } else {
          setImageSize('');
        }
      }
    } catch (err) {
      console.log('Pick proof error:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Dibutuhkan', 'Izinkan akses kamera untuk foto bukti transfer.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofImage(result.assets[0].uri);
        setImageSize('');
      }
    } catch (err) {
      console.log('Take photo error:', err);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofImage) {
      Alert.alert('Perhatian', 'Silakan pilih gambar bukti transfer terlebih dahulu.');
      return;
    }

    Alert.alert(
      'Konfirmasi Pengiriman',
      'Pastikan foto bukti transfer sudah benar dan jelas terbaca sebelum mengirim.',
      [
        { text: 'Periksa Lagi', style: 'cancel' },
        {
          text: 'Ya, Kirim Sekarang',
          onPress: async () => {
            try {
              setIsSubmitting(true);

              const uploadRes = await api.uploadFile(proofImage, `bukti_bayar_${orderId}.jpg`);
              if (!uploadRes.success || !uploadRes.fileUrl) {
                throw new Error(uploadRes.error || 'Gagal mengunggah foto bukti pembayaran');
              }

              const res = await api.uploadPaymentProof(orderId, uploadRes.fileUrl);
              if (res.success) {
                Alert.alert(
                  '✅ Bukti Diterima!',
                  'Admin akan memverifikasi transfer Anda. Status pesanan beralih ke "Menunggu Verifikasi".',
                  [{ text: 'OK', onPress: () => navigation.replace('OrderDetail', { orderId }) }]
                );
              } else {
                Alert.alert('Gagal', res.error || 'Gagal menyimpan bukti pembayaran');
              }
            } catch (err: any) {
              Alert.alert('Kesalahan', err.message || 'Terjadi gangguan saat mengirim bukti bayar');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !order) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat instruksi pembayaran...</Text>
      </View>
    );
  }

  const isRejected = order.status === 'PEMBAYARAN_DITOLAK';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Pembayaran Pesanan</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadOrder}>
          <RefreshCw size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Rejected Warning */}
        {isRejected && (
          <View style={styles.rejectedBanner}>
            <AlertCircle size={18} color="#DC2626" />
            <Text style={styles.rejectedBannerText}>
              Bukti pembayaran sebelumnya ditolak oleh admin. Silakan unggah bukti yang lebih jelas.
            </Text>
          </View>
        )}

        {/* Bill Summary Banner */}
        <View style={styles.billCard}>
          <Text style={styles.billLabel}>Total yang Harus Ditransfer</Text>
          <Text style={styles.billAmount}>{formatRupiah(order.totalAmount)}</Text>
          <View style={styles.billOrderRow}>
            <Text style={styles.billOrderNo}>
              {order.orderNo || `#${order.id.slice(0, 8)}`}
            </Text>
            <TouchableOpacity onPress={() => { Clipboard.setString(order.totalAmount.toString()); Alert.alert('Tersalin', 'Nominal telah disalin.'); }}>
              <Text style={styles.billCopyHint}>Ketuk nominal untuk salin</Text>
            </TouchableOpacity>
          </View>
          {order.dueDate && (
            <Text style={styles.billDueDate}>
              ⏰ Batas pembayaran: {new Date(order.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Important reminder */}
        <View style={styles.reminderCard}>
          <AlertCircle size={15} color="#D97706" />
          <Text style={styles.reminderText}>
            Transfer <Text style={{ fontWeight: '800', color: '#92400E' }}>tepat sesuai nominal</Text> tagihan. Pembayaran kurang atau lebih akan diproses manual.
          </Text>
        </View>

        {/* Bank Accounts */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Building size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Rekening Resmi PrintWere</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Transfer ke salah satu rekening di bawah ini:
          </Text>

          <View style={styles.banksList}>
            {BANK_ACCOUNTS.map((bank, idx) => (
              <View key={idx} style={[styles.bankCard, { borderLeftColor: bank.color, borderLeftWidth: 4 }]}>
                <View style={styles.bankInfo}>
                  <View style={[styles.bankNameBadge, { backgroundColor: bank.color + '15' }]}>
                    <Text style={[styles.bankName, { color: bank.color }]}>{bank.bank}</Text>
                  </View>
                  <Text style={styles.bankNo}>{bank.no}</Text>
                  <Text style={styles.bankHolder}>a.n. {bank.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyAccountNo(bank.no, bank.bank)}
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
            Foto struk ATM, m-Banking, atau screenshot QRIS yang jelas dan tidak terpotong.
          </Text>

          {proofImage ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: proofImage }} style={styles.previewImg} resizeMode="cover" />
              {imageSize ? (
                <View style={styles.imageSizeBadge}>
                  <Text style={styles.imageSizeText}>📁 {imageSize}</Text>
                </View>
              ) : null}
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.rePickBtn} onPress={handlePickProof}>
                  <ImageIcon size={15} color="#2563EB" />
                  <Text style={styles.rePickBtnText}>Ganti dari Galeri</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reCameraBtn} onPress={handleTakePhoto}>
                  <Camera size={15} color="#059669" />
                  <Text style={styles.reCameraBtnText}>Foto Ulang</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.previewCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.previewCheckText}>Foto dipilih — periksa kejelasannya</Text>
              </View>
            </View>
          ) : (
            <View>
              <TouchableOpacity style={styles.uploadArea} onPress={handlePickProof}>
                <Upload size={34} color="#2563EB" />
                <Text style={styles.uploadMainText}>Pilih dari Galeri</Text>
                <Text style={styles.uploadSubText}>JPG / PNG · Maks. 10MB</Text>
              </TouchableOpacity>
              <View style={styles.uploadDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>atau</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity style={styles.cameraBtn} onPress={handleTakePhoto}>
                <Camera size={18} color="#059669" />
                <Text style={styles.cameraBtnText}>Ambil Foto Langsung</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Submit Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.submitBtn, (!proofImage || isSubmitting) && styles.submitBtnDisabled]}
          onPress={handleSubmitProof}
          disabled={!proofImage || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <CheckCircle2 size={18} color={proofImage ? '#FFFFFF' : '#94A3B8'} />
              <Text style={[styles.submitBtnText, !proofImage && { color: '#94A3B8' }]}>
                {proofImage ? 'Konfirmasi & Kirim Bukti' : 'Pilih Foto Bukti Dulu'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerBox: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B' },
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
  refreshBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 120, gap: 14 },
  rejectedBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#FEF2F2', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#FECACA',
  },
  rejectedBannerText: { flex: 1, fontSize: 12, color: '#991B1B', fontWeight: '600', lineHeight: 18 },
  billCard: {
    backgroundColor: '#1E293B', borderRadius: 22, padding: 20, alignItems: 'center',
  },
  billLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  billAmount: { fontSize: 30, fontWeight: '800', color: '#60A5FA' },
  billOrderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  billOrderNo: { fontSize: 12, color: '#CBD5E1', fontWeight: '600' },
  billCopyHint: { fontSize: 10, color: '#475569', fontStyle: 'italic' },
  billDueDate: { fontSize: 11, color: '#FCD34D', marginTop: 6, fontWeight: '600' },
  reminderCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FEF3C7', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  reminderText: { flex: 1, fontSize: 11, color: '#78350F', lineHeight: 17 },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  sectionDesc: { fontSize: 11, color: '#64748B', marginBottom: 14, lineHeight: 16 },
  banksList: { gap: 10 },
  bankCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  bankInfo: { flex: 1 },
  bankNameBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 4 },
  bankName: { fontSize: 11, fontWeight: '800' },
  bankNo: { fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: 0.5, marginBottom: 2 },
  bankHolder: { fontSize: 10, color: '#64748B' },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: '#BFDBFE',
  },
  copyBtnText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#93C5FD',
    backgroundColor: '#F8FAFC', borderRadius: 18, padding: 28,
    alignItems: 'center', gap: 8,
  },
  uploadMainText: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginTop: 4 },
  uploadSubText: { fontSize: 11, color: '#94A3B8' },
  uploadDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  cameraBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#ECFDF5', borderRadius: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  cameraBtnText: { fontSize: 13, fontWeight: '700', color: '#059669' },
  previewBox: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  previewImg: { width: '100%', height: 200, backgroundColor: '#F1F5F9' },
  imageSizeBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6,
  },
  imageSizeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  previewActions: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  rePickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
    borderRightWidth: 1, borderRightColor: '#E2E8F0',
  },
  rePickBtnText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  reCameraBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
  },
  reCameraBtnText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  previewCheckRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#DCFCE7', paddingHorizontal: 14, paddingVertical: 8,
  },
  previewCheckText: { fontSize: 11, color: '#166534', fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0',
    paddingHorizontal: 16, paddingTop: 12,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563EB', paddingVertical: 15, borderRadius: 16,
  },
  submitBtnDisabled: { backgroundColor: '#F1F5F9' },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
