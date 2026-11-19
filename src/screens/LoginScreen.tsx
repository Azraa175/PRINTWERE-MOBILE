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
import { Printer, Mail, Lock, ArrowRight, UserCheck, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Masuk Akun</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandBox}>
          <View style={styles.brandLogo}>
            <Printer size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>PrintWere</Text>
          <Text style={styles.brandDesc}>Aplikasi Mobile Pelanggan Percetakan</Text>
        </View>

        {/* Demo Fast Login Button */}
        <TouchableOpacity style={styles.demoFillBtn} onPress={handleDemoFill}>
          <UserCheck size={16} color="#2563EB" />
          <Text style={styles.demoFillBtnText}>Gunakan Akun Demo Pelanggan (user@printwere.com)</Text>
        </TouchableOpacity>

        {/* Input Form */}
        <View style={styles.formCard}>
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
              />
            </View>
          </View>

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
                secureTextEntry
              />
            </View>
          </View>

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

        {/* Register Switch */}
        <View style={styles.registerSwitchRow}>
          <Text style={styles.registerSwitchText}>Belum punya akun?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLinkText}>Daftar Baru</Text>
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
  brandBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  demoFillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
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
  registerSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  registerSwitchText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});
