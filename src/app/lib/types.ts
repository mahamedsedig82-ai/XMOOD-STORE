
export type UserRole = 'user' | 'admin' | 'agent' | 'vip';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  walletBalance: number;
  role: UserRole;
  label?: string; // مسمى المستخدم (مثلاً: تاجر معتمد، عميل VIP)
  photoURL?: string;
  createdAt: string;
  lastLogin?: string;
}

export type Category = 'شحن ألعاب' | 'حسابات ألعاب' | 'خدمات رقمية' | 'خدمات تصميم' | 'وساطة وخدمات خاصة' | 'تبادل عملات';
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
  discountPrice?: number;
  isP2P?: boolean;
  vendorId?: string;
  rating?: number;
}

export type OrderStatus = 'waiting_payment' | 'processing' | 'completed' | 'cancelled' | 'refunded';

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

export type TransactionType = 'deposit' | 'purchase' | 'refund' | 'withdrawal' | 'exchange' | 'transfer_send' | 'transfer_receive';

export interface Transaction {
  id: string;
  userId: string;
  targetUserId?: string; // في حال التحويل
  type: TransactionType;
  amount: number;
  description: string;
  agentId?: string;
  orderId?: string;
  createdAt: string;
  status?: 'success' | 'failed' | 'refunded';
}

export interface Agent {
  id: string;
  name: string;
  contactType: 'WhatsApp' | 'Telegram';
  contactValue: string;
  availability: string;
}
