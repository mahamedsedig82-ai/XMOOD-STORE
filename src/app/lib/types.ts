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
  rating?: number;
  ratingCount?: number;
  middlemanInfo?: {
    services: string[];
    isAvailable: boolean;
    workHours?: string;
  }
}

export interface SiteSettings {
  appearance?: {
    primaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    logoRounded?: boolean;
  };
  siteInfo?: {
    title?: string;
    subtitle?: string;
    description?: string;
    copyright?: string;
    usdRate?: number;
  };
  navLabels?: {
    home: string;
    store: string;
    services: string;
    gallery: string;
    agents: string;
  };
  cartLabels?: {
    cartTitle: string;
    emptyCartMsg: string;
    checkoutTitle: string;
    successMsg: string;
  };
  gallerySettings?: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  agentSettings?: {
    title: string;
    subtitle: string;
    badge: string;
  };
  contact?: {
    whatsapp: string;
    email: string;
    telegram: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  footer?: {
    isActive: boolean;
    aboutText: string;
    address: string;
    copyright: string;
  };
}
