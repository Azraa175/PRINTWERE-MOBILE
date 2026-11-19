import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setToken, getToken, getBaseUrl, setBaseUrl } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  serverUrl: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  updateServerUrl: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@printwere_user_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverUrl, setServerUrlState] = useState('http://192.168.18.78:3000');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const url = await getBaseUrl();
      setServerUrlState(url);

      const savedToken = await getToken();
      const savedUserStr = await AsyncStorage.getItem(USER_STORAGE_KEY);

      if (savedToken && savedUserStr) {
        setTokenState(savedToken);
        setUser(JSON.parse(savedUserStr));

        // Background sync latest profile
        api.getProfile()
          .then((res) => {
            if (res.success && res.data?.user) {
              setUser(res.data.user);
              AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.log('Error restoring auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setTokenState(userToken);
        await setToken(userToken);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: res.error || 'Login gagal' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan jaringan' };
    }
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    try {
      const res = await api.register(payload);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setTokenState(userToken);
        await setToken(userToken);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: res.error || 'Pendaftaran gagal' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan jaringan' };
    }
  };

  const logout = async () => {
    setUser(null);
    setTokenState(null);
    await setToken(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateProfile = async (data: { name?: string; phone?: string; address?: string }) => {
    try {
      const res = await api.updateProfile(data);
      if (res.success && res.data) {
        setUser(res.data);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
        return { success: true };
      }
      return { success: false, error: res.error || 'Gagal update profil' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal update profil' };
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.getProfile();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
      }
    } catch (e) {}
  };

  const updateServerUrl = async (url: string) => {
    await setBaseUrl(url);
    setServerUrlState(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        serverUrl,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        updateServerUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
