export type UserRole = 'owner' | 'admin' | 'gm' | 'community_admin' | 'community_mod' | 'store_manager' | 'design_manager' | 'designer' | 'accountant' | 'support' | 'middleman' | 'agent' | 'user';

export interface UserProfile {
  uid: string;
  displayName: string;
  fullName?: string;
  email: string;
  phoneNumber: string;
  walletBalance: number;
  role: UserRole;
  isTrusted?: boolean;
  communityStatus?: 'active' | 'muted' | 'banned';
  photoURL?: string;
  isVerified?: boolean;
  securityLevel: 'basic' | 'enhanced' | 'sovereign';
  isCaptchaVerified: boolean;
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt: string;
  lastSeen?: string;
  label?: string;
  bio?: string;
  completedDeals?: number;
  residence?: string;
  age?: number;
  middlemanInfo?: {
    services: string[];
    isAvailable: boolean;
    workHours?: string;
  }
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  extraFee: number;
  deliveryTime: string;
  badge?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  shippingMethodName: string;
  deliveryEmail?: string;
  notes?: string;
  status: 'completed' | 'failed' | 'pending_stock' | 'cancelled' | 'refunded';
  deliveryStatus: 'delivered' | 'preparing' | 'failed';
  shippingCodeSent?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  minStock: number;
  imageUrl: string;
  description: string;
  highlights: string;
  shippingCodes: string;
  status: 'active' | 'out_of_stock' | 'low_stock' | 'paused';
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
