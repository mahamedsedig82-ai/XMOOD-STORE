export type UserRole = 'user' | 'admin' | 'agent' | 'vip';

export interface UserProfile {
  uid: string;
  displayName: string;
  fullName: string;
  email: string;
  walletBalance: number;
  role: UserRole;
  label: string; 
  photoURL: string;
  createdAt: string;
  emergencyCode: string;
  securityQuestions: {
    question: string;
    answer: string;
  }[];
}

export type Category = 'شحن ألعاب' | 'حسابات ألعاب' | 'خدمات رقمية' | 'خدمات تصميم' | 'وساطة وخدمات خاصة';
export type ProductStatus = 'active' | 'out_of_stock' | 'discount' | 'inactive';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  stock: number;
  status: ProductStatus;
  shippingCodes?: string;
  updatedAt?: string;
  createdAt?: string;
}

export type OrderStatus = 'waiting_payment' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'deposit' | 'purchase' | 'refund' | 'transfer_send' | 'transfer_receive';

export interface Transaction {
  id: string;
  userId: string;
  targetUserId?: string; 
  senderUserId?: string;
  targetUserName?: string;
  senderUserName?: string;
  targetUserPhoto?: string;
  senderUserPhoto?: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
}