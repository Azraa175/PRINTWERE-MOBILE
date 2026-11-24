import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, ArrowRight, Eye, EyeOff, Printer } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Nama, email, dan password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Perhatian', 'Format email tidak valid.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      if (res.success) {
        Alert.alert(
          '🎉 Akun Berhasil Dibuat!',
          'Selamat bergabung dengan PrintWere. Silakan masuk dengan akun baru Anda.',
          [{ text: 'Masuk Sekarang', onPress: () => navigation.popToTop() }]
        );
      } else {
        Alert.alert('Gagal', res.error || 'Gagal mendaftar akun');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Top Nav */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Daftar Akun Baru</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandBox}>
            <View style={styles.brandLogo}>
              <Printer size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Bergabung dengan PrintWere</Text>
            <Text style={styles.subTitle}>Pesan dan pantau kebutuhan cetak Anda kapan saja.</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Informasi Akun</Text>

            {/* Nama */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Lengkap *</Text>
              <View style={styles.inputRow}>
                <User size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Budi Santoso"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email *</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="nama@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password (Min. 6 Karakter) *</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPass
                    ? <EyeOff size={18} color="#94A3B8" />
                    : <Eye size={18} color="#94A3B8" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nomor WhatsApp / HP</Text>
              <View style={styles.inputRow}>
                <Phone size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="081234567890"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
              <Text style={styles.fieldHint}>Digunakan untuk notifikasi WhatsApp status pesanan</Text>
            </View>

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Alamat Pengiriman (Opsional)</Text>
              <View style={[styles.inputRow, { height: 72, alignItems: 'flex-start', paddingTop: 10 }]}>
                <MapPin size={18} color="#94A3B8" style={{ marginTop: 2 }} />
                <TextInput
                  style={[styles.textInput, { height: 56 }]}
                  placeholder="Alamat lengkap domisili"
                  placeholderTextColor="#94A3B8"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Daftar Sekarang</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Sudah punya akun?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchLink}>Masuk Akun</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
  scrollContent: { padding: 20, paddingBottom: 50 },
  brandBox: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  brandLogo: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, shadowColor: '#2563EB', shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subTitle: { fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#E2E8F0', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  formTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  fieldGroup: { gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569' },
  fieldHint: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8FAFC', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 14, height: 48,
  },
  textInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2563EB', paddingVertical: 15, borderRadius: 16, marginTop: 6,
    shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, marginTop: 22,
  },
  switchText: { fontSize: 13, color: '#64748B' },
  switchLink: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
});
