export type UserRole = 'owner' | 'admin' | 'gm' | 'community_admin' | 'community_mod' | 'store_manager' | 'design_manager' | 'designer' | 'accountant' | 'support' | 'middleman' | 'agent' | 'user';

export interface UserProfile {
  uid: string;
  displayName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  residence?: string;
  walletBalance: number;
  role: UserRole;
  isTrusted?: boolean;
  communityStatus?: 'active' | 'muted' | 'banned';
  photoURL?: string;
  isVerified?: boolean;
  affinityPoints?: number;
  createdAt: string;
  lastSeen?: string;
  label?: string;
  bio?: string;
  completedDeals?: number;
  middlemanInfo?: {
    services: string[];
    isAvailable: boolean;
    workHours?: string;
  }
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: string;
}