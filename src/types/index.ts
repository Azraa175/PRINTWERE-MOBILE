export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: 'UNIT' | 'M2' | 'PACKAGE';
  minArea?: number;
  estDays?: number;
  image: string;
  category: string;
  sizes?: string;
  finishing?: string;
  rating?: number;
  isRecommended?: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  width?: number;
  height?: number;
  options?: Record<string, string>;
  notes?: string;
  fileUri?: string;
  fileName?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  width?: number | null;
  height?: number | null;
  options?: Record<string, string> | null;
  notes?: string | null;
  fileUrl?: string | null;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: string;
  proofUrl?: string | null;
  status: string;
  createdAt: string;
}

export interface StatusLog {
  id: string;
  fromStatus: string;
  toStatus: string;
  note?: string;
  createdAt: string;
  changedBy?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentProof?: string | null;
  shippingAddress: string;
  shippingMethod: string;
  shippingCost: number;
  deliveryType?: string | null;
  note?: string | null;
  dueDate?: string | null;
  createdAt: string;
  items: OrderItem[];
  payments?: PaymentRecord[];
  statusLogs?: StatusLog[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  MENUNGGU_PEMBAYARAN: {
    label: 'Belum Bayar',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
  MENUNGGU_VERIFIKASI: {
    label: 'Menunggu Verifikasi',
    color: '#2563EB',
    bg: '#DBEAFE',
    border: '#BFDBFE',
  },
  ANTRIAN_PRODUKSI: {
    label: 'Antrean Produksi',
    color: '#9333EA',
    bg: '#F3E8FF',
    border: '#E9D5FF',
  },
  SEDANG_DICETAK: {
    label: 'Sedang Dicetak',
    color: '#4F46E5',
    bg: '#E0E7FF',
    border: '#C7D2FE',
  },
  FINISHING: {
    label: 'Finishing',
    color: '#0891B2',
    bg: '#CFFAFE',
    border: '#A5F3FC',
  },
  SIAP_DIAMBIL: {
    label: 'Siap Diambil / Kirim',
    color: '#059669',
    bg: '#D1FAE5',
    border: '#A7F3D0',
  },
  DIKIRIM: {
    label: 'Dalam Pengiriman',
    color: '#0891B2',
    bg: '#E0F2FE',
    border: '#BAE6FD',
  },
  SELESAI: {
    label: 'Selesai',
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#BBF7D0',
  },
  PEMBAYARAN_DITOLAK: {
    label: 'Bukti Bayar Ditolak',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#FECACA',
  },
  DIBATALKAN: {
    label: 'Dibatalkan',
    color: '#475569',
    bg: '#F1F5F9',
    border: '#E2E8F0',
  },
};
