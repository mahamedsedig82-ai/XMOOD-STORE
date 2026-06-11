
export type Category = 'شحن ألعاب' | 'حسابات ألعاب' | 'خدمات رقمية' | 'خدمات تصميم' | 'وساطة وخدمات خاصة';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  stock: number;
  vendor?: string;
  isP2P?: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  date: string;
  description: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface MiddlemanRequest {
  id: string;
  title: string;
  status: 'pending' | 'in progress' | 'completed' | 'disputed';
  amount: number;
  buyer: string;
  seller: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  contactType: 'WhatsApp' | 'Telegram';
  contactValue: string;
  availability: string;
}
