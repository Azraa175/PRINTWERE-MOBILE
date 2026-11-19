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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react-native';
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Nama, email, dan password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter.');
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
        Alert.alert('Berhasil', 'Pendaftaran akun pelanggan berhasil!', [
          { text: 'OK', onPress: () => navigation.popToTop() },
        ]);
      } else {
        Alert.alert('Gagal', res.error || 'Gagal mendaftar akun');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Daftar Akun Baru</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerTextBox}>
          <Text style={styles.title}>Bergabung dengan PrintWere</Text>
          <Text style={styles.subTitle}>Pesan dan pantau kebutuhan cetak Anda kapan saja.</Text>
        </View>

        <View style={styles.formCard}>
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
              />
            </View>
          </View>

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
              />
            </View>
          </View>

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
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Alamat Pengiriman (Opsional)</Text>
            <View style={[styles.inputRow, { height: 56, alignItems: 'flex-start', paddingTop: 8 }]}>
              <MapPin size={18} color="#94A3B8" style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.textInput, { height: 46 }]}
                placeholder="Alamat lengkap domisili"
                placeholderTextColor="#94A3B8"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>

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
                secureTextEntry
              />
            </View>
          </View>

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

        <View style={styles.loginSwitchRow}>
          <Text style={styles.loginSwitchText}>Sudah punya akun?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Masuk Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },
  headerTextBox: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  fieldGroup: {},
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loginSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  loginSwitchText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});
