
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
}

export type DesignStatus = 'pending' | 'assigned' | 'drafting' | 'review' | 'completed' | 'cancelled';

export interface DesignRequest {
  id: string;
  customerId: string;
  customerEmail: string;
  designType: string;
  description: string;
  colors: string;
  dimensions: string;
  attachments: string[];
  status: DesignStatus;
  assignedTo?: string;
  drafts: string[];
  finalFiles: string[];
  price: number;
  createdAt: string;
}

export interface AppConfig {
  appearance: {
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    logoUrl: string;
  };
  siteInfo: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroDescription: string;
  };
}
