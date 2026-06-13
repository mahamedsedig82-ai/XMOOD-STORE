
export type UserRole = 'owner' | 'admin' | 'gm' | 'store_manager' | 'design_manager' | 'designer' | 'accountant' | 'support' | 'middleman' | 'agent' | 'user';

export interface UserProfile {
  uid: string;
  displayName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  residence?: string;
  walletBalance: number;
  role: UserRole;
  photoURL?: string;
  isVerified?: boolean;
  affinityPoints?: number;
  createdAt: string;
  label?: string;
  bio?: string;
  completedDeals?: number;
  middlemanInfo?: {
    services: string[];
    isAvailable: boolean;
    workHours?: string;
  }
}

export interface OtherService {
  id: string;
  name: string;
  agentName: string;
  agentId: string;
  type: string;
  description: string;
  price: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  description: string;
  status: string;
  shippingCodes?: string;
}
