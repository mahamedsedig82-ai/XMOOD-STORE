
export type UserRole = 'owner' | 'admin' | 'gm' | 'store_manager' | 'design_manager' | 'designer' | 'accountant' | 'support' | 'middleman' | 'agent' | 'user';

export interface UserProfile {
  uid: string;
  displayName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
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
    services: string[]; // e.g. ["escrow", "charging"]
    isAvailable: boolean;
    workHours?: string;
  }
}

export interface MarketplaceListing {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userLabel?: string;
  title: string;
  description: string;
  price: number;
  type: 'sell' | 'buy' | 'service';
  contactMethod: 'whatsapp' | 'telegram' | 'email' | 'onsite';
  contactValue: string;
  likes: string[];
  commentCount: number;
  status: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: string;
}
