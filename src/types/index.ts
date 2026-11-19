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
  createdAt: string;
  items: OrderItem[];
  payments?: PaymentRecord[];
  statusLogs?: StatusLog[];
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  MENUNGGU_PEMBAYARAN: {
    label: 'Belum Bayar',
    color: '#D97706', // amber-600
    bg: '#FEF3C7',    // amber-100
    border: '#FDE68A' // amber-200
  },
  MENUNGGU_VERIFIKASI: {
    label: 'Menunggu Verifikasi',
    color: '#2563EB', // blue-600
    bg: '#DBEAFE',    // blue-100
    border: '#BFDBFE' // blue-200
  },
  ANTRIAN_PRODUKSI: {
    label: 'Antrean Produksi',
    color: '#9333EA', // purple-600
    bg: '#F3E8FF',    // purple-100
    border: '#E9D5FF' // purple-200
  },
  SEDANG_DICETAK: {
    label: 'Sedang Dicetak',
    color: '#4F46E5', // indigo-600
    bg: '#E0E7FF',    // indigo-100
    border: '#C7D2FE' // indigo-200
  },
  FINISHING: {
    label: 'Finishing',
    color: '#0891B2', // cyan-600
    bg: '#CFFAFE',    // cyan-100
    border: '#A5F3FC' // cyan-200
  },
  SIAP_DIAMBIL: {
    label: 'Siap Diambil / Kirim',
    color: '#059669', // emerald-600
    bg: '#D1FAE5',    // emerald-100
    border: '#A7F3D0' // emerald-200
  },
  SELESAI: {
    label: 'Selesai',
    color: '#16A34A', // green-600
    bg: '#DCFCE7',    // green-100
    border: '#BBF7D0' // green-200
  },
  PEMBAYARAN_DITOLAK: {
    label: 'Bukti Bayar Ditolak',
    color: '#DC2626', // red-600
    bg: '#FEE2E2',    // red-100
    border: '#FECACA' // red-200
  },
  DIBATALKAN: {
    label: 'Dibatalkan',
    color: '#475569', // slate-600
    bg: '#F1F5F9',    // slate-100
    border: '#E2E8F0' // slate-200
  }
};
