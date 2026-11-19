import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, 
  Phone, 
  MapPin, 
  LogOut, 
  Server, 
  MessageCircle, 
  Package, 
  Clock, 
  CheckCircle2, 
  Edit3,
  Save,
  X
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api, getBaseUrl } from '../services/api';

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile, serverUrl, updateServerUrl } = useAuth();

  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, completedOrders: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // Edit Profile Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Server URL Modal
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState(serverUrl);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setEditAddress(user.bio || '');
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.getProfile();
      if (res.success && res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (e) {
      console.log('Error loading profile stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Perhatian', 'Nama tidak boleh kosong');
      return;
    }
    try {
      setIsSavingProfile(true);
      const res = await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
      });

      if (res.success) {
        Alert.alert('Sukses', 'Profil berhasil diperbarui');
        setEditModalVisible(false);
      } else {
        Alert.alert('Gagal', res.error || 'Gagal update profil');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveServerUrl = async () => {
    if (!newServerUrl.trim()) return;
    await updateServerUrl(newServerUrl.trim());
    setServerModalVisible(false);
    Alert.alert('Server Tersimpan', `Koneksi diarahkan ke: ${newServerUrl.trim()}`);
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari akun pelanggan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <User size={50} color="#94A3B8" />
        <Text style={styles.notLoggedTitle}>Belum Masuk Akun</Text>
        <Text style={styles.notLoggedDesc}>
          Masuk ke akun Anda untuk melihat profil dan riwayat transaksi.
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Masuk Akun</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'P';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profil Pelanggan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initialLetter}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Pelanggan Terverifikasi</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
            <Edit3 size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Package size={20} color="#2563EB" />
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Pesanan</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#D97706" />
            <Text style={styles.statNumber}>{stats.activeOrders}</Text>
            <Text style={styles.statLabel}>Proses Aktif</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle2 size={20} color="#059669" />
            <Text style={styles.statNumber}>{stats.completedOrders}</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
        </View>

        {/* Contact & Address Card */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Data Pribadi</Text>

          <View style={styles.dataRow}>
            <Phone size={18} color="#64748B" />
            <View style={styles.dataCol}>
              <Text style={styles.dataLabel}>Nomor WhatsApp / HP</Text>
              <Text style={styles.dataVal}>{user.phone || 'Belum diisi'}</Text>
            </View>
          </View>

          <View style={styles.dataRow}>
            <MapPin size={18} color="#64748B" />
            <View style={styles.dataCol}>
              <Text style={styles.dataLabel}>Alamat Pengiriman</Text>
              <Text style={styles.dataVal}>{user.bio || 'Belum diisi'}</Text>
            </View>
          </View>
        </View>

        {/* Settings & Links */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Pengaturan & Bantuan</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setNewServerUrl(serverUrl);
              setServerModalVisible(true);
            }}
          >
            <Server size={18} color="#2563EB" />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemTitle}>Koneksi Server API</Text>
              <Text style={styles.menuItemSub} numberOfLines={1}>{serverUrl}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://wa.me/6281234567890?text=Halo%20Admin%20PrintWere')}
          >
            <MessageCircle size={18} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemTitle}>Hubungi CS PrintWere (WhatsApp)</Text>
              <Text style={styles.menuItemSub}>Bantuan cetak & konfirmasi pesanan</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Keluar Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Perbarui Profil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Nama Lengkap</Text>
              <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Nomor Telepon / WhatsApp</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Alamat Domisili</Text>
              <TextInput
                style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                value={editAddress}
                onChangeText={setEditAddress}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSaveProfile}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Server URL Modal */}
      <Modal visible={serverModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Alamat Server Backend</Text>
              <TouchableOpacity onPress={() => setServerModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.serverInfoText}>
              Gunakan IP jaringan lokal komputer Anda (contoh: http://192.168.1.10:3000) agar HP bisa menghubungi backend web Next.js.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={newServerUrl}
              onChangeText={setNewServerUrl}
              placeholder="http://192.168.18.78:3000"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveServerUrl}>
              <Text style={styles.modalSaveBtnText}>Terapkan Server</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 30,
  },
  notLoggedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
  },
  notLoggedDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerBar: {
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  dataCol: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  dataVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 6,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  serverInfoText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
