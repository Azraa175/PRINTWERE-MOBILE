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
import { Printer, Mail, Lock, ArrowRight, UserCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Email dan password harus diisi.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      if (res.success) {
        navigation.goBack();
      } else {
        Alert.alert('Login Gagal', res.error || 'Email atau password salah');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('user@printwere.com');
    setPassword('user123');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Top Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Masuk Akun</Text>
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
              <Printer size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>PrintWere</Text>
            <Text style={styles.brandDesc}>Aplikasi Percetakan Digital Pelanggan</Text>
          </View>

          {/* Demo Fill Button */}
          <TouchableOpacity style={styles.demoFillBtn} onPress={handleDemoFill}>
            <UserCheck size={16} color="#2563EB" />
            <Text style={styles.demoFillBtnText}>Gunakan Akun Demo (user@printwere.com)</Text>
          </TouchableOpacity>

          {/* Input Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Masuk ke Akun Anda</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
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
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPass
                    ? <EyeOff size={18} color="#94A3B8" />
                    : <Eye size={18} color="#94A3B8" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Masuk Sekarang</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Belum punya akun?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchLink}>Daftar Baru</Text>
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
  brandBox: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  brandLogo: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  brandName: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  brandDesc: { fontSize: 12, color: '#64748B', marginTop: 3 },
  demoFillBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE',
    paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, marginBottom: 16,
  },
  demoFillBtnText: { fontSize: 11, fontWeight: '700', color: '#2563EB', flex: 1, textAlign: 'center' },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#E2E8F0', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569' },
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
    shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, marginTop: 22,
  },
  switchText: { fontSize: 13, color: '#64748B' },
  switchLink: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
});
