
export type UserRole = 'owner' | 'admin' | 'gm' | 'store_manager' | 'design_manager' | 'designer' | 'accountant' | 'support' | 'middleman' | 'user';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  walletBalance: number;
  role: UserRole;
  photoURL?: string;
  isVerified?: boolean;
  affinityPoints?: number;
  createdAt: string;
  label?: string;
  fullName?: string;
}

export type DesignStatus = 'pending' | 'assigned' | 'drafting' | 'review' | 'completed' | 'cancelled';

export interface AppConfig {
  appearance: {
    primaryColor: string;
    backgroundColor: string;
    accentColor: string;
    fontFamily: string;
    logoUrl: string;
    botIconUrl: string;
  };
  siteInfo: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroDescription: string;
  };
  contact: {
    email: string;
    phone: string;
    instagram: string;
    whatsapp: string;
    telegram: string;
  };
  promotions: {
    banner1Title: string;
    banner1Subtitle: string;
    banner1Link: string;
    banner2Title: string;
    banner2Subtitle: string;
    banner2Link: string;
  };
  bot: {
    greeting: string;
    tip1: string;
    tip2: string;
    tip3: string;
  };
}
