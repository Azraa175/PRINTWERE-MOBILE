import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_BASE_URL = 'https://printwere.vercel.app';
const STORAGE_KEY_BASE_URL = '@printwere_base_url';
const STORAGE_KEY_TOKEN = '@printwere_token';

let cachedBaseUrl: string | null = null;

export async function getBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;
  const stored = await AsyncStorage.getItem(STORAGE_KEY_BASE_URL);
  cachedBaseUrl = stored || DEFAULT_BASE_URL;
  return cachedBaseUrl;
}

export async function setBaseUrl(url: string): Promise<void> {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  cachedBaseUrl = cleanUrl;
  await AsyncStorage.setItem(STORAGE_KEY_BASE_URL, cleanUrl);
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
  }
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = await getBaseUrl();
  const token = await getToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || `HTTP ${res.status}: Gagal memproses permintaan`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    console.error(`API Error on [${url}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return request('/api/mobile/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (payload: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    return request('/api/mobile/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProfile: async () => {
    return request('/api/mobile/profile');
  },

  updateProfile: async (payload: { name?: string; phone?: string; address?: string }) => {
    return request('/api/mobile/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Products
  getProducts: async () => {
    return request('/api/products');
  },

  getProductById: async (id: string) => {
    return request(`/api/products/${id}`);
  },

  // Orders
  getMyOrders: async (status?: string) => {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return request(`/api/mobile/orders${query}`);
  },

  getOrderById: async (id: string) => {
    return request(`/api/mobile/orders/${id}`);
  },

  createOrder: async (orderData: {
    items: any[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
    shippingMethod: string;
    shippingCost: number;
    phone?: string;
  }) => {
    return request('/api/mobile/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Payment proof
  uploadPaymentProof: async (orderId: string, proofUrl: string) => {
    return request(`/api/mobile/orders/${orderId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentProof: proofUrl }),
    });
  },

  // File upload (multipart)
  uploadFile: async (fileUri: string, fileName: string, mimeType: string = 'image/jpeg') => {
    const formData = new FormData();
    // @ts-ignore: React Native form data file
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    });

    return request('/api/mobile/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
