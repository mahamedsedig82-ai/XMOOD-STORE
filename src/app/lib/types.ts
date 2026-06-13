
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

export interface SiteSettings {
  appearance: {
    primaryColor: string;
    backgroundColor: string;
    accentColor: string;
    logoUrl: string;
  };
  siteInfo: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroDescription: string;
    description: string;
    copyright: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    telegram: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    address: string;
    workHours: string;
  };
  promotions: {
    banner1Title: string;
    banner1Subtitle: string;
    banner1Link: string;
    banner2Title: string;
    banner2Subtitle: string;
    banner2Link: string;
  };
}

export interface OtherService {
  id: string;
  name: string;
  agentName: string;
  agentId: string;
  whatsapp: string;
  imageUrl: string;
  type: string;
  description: string;
  price: number;
  isAvailable: boolean;
  createdAt: any;
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
