import { Product, Agent } from './types';

export const STORE_PRODUCTS: Product[] = [
  // Free Fire
  {
    id: 'ff1',
    name: 'Free Fire - 100 Diamonds',
    description: 'شحن فوري لجواهر فري فاير عبر المعرف (ID).',
    price: 1.20,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/ff1/400/300',
    stock: 100,
    status: 'active'
  },
  {
    id: 'ff2',
    name: 'Free Fire - 520 Diamonds',
    description: 'باقة الجواهر المتوسطة لفري فاير.',
    price: 5.50,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/ff2/400/300',
    stock: 50,
    status: 'discount',
    discountPrice: 4.99
  },
  {
    id: 'ff3',
    name: 'Free Fire - 2180 Diamonds',
    description: 'الباقة الكبيرة لمحترفي فري فاير.',
    price: 22.00,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/ff3/400/300',
    stock: 0,
    status: 'out_of_stock'
  },
  // PUBG Mobile
  {
    id: 'pb1',
    name: 'PUBG UC - 60 UC',
    description: 'شحن شدات ببجي موبايل الأساسية.',
    price: 1.10,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/pubg1/400/300',
    stock: 500,
    status: 'active'
  },
  {
    id: 'pb2',
    name: 'PUBG UC - 325 UC',
    description: 'شحن شدات ببجي موبايل - باقة المبتدئين.',
    price: 5.20,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/pubg2/400/300',
    stock: 200,
    status: 'active'
  },
  {
    id: 'pb3',
    name: 'PUBG UC - 6000 UC',
    description: 'الباقة الملكية لشحن شدات ببجي.',
    price: 95.00,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/pubg3/400/300',
    stock: 10,
    status: 'discount',
    discountPrice: 89.99
  },
  // FC (FIFA)
  {
    id: 'fc1',
    name: 'FC Points - 500 Points',
    description: 'نقاط إف سي موبايل لشحن حسابك فورا.',
    price: 5.00,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/fc1/400/300',
    stock: 150,
    status: 'active'
  },
  {
    id: 'fc2',
    name: 'FC Points - 2800 Points',
    description: 'باقة النقاط الاحترافية لـ FC Mobile.',
    price: 25.00,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/fc2/400/300',
    stock: 30,
    status: 'active'
  },
  {
    id: 'fc3',
    name: 'FC Points - 12000 Points',
    description: 'أكبر باقة نقاط لـ FC Mobile.',
    price: 110.00,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/fc3/400/300',
    stock: 5,
    status: 'active'
  },
];

export const MARKETPLACE_PRODUCTS: Product[] = [
  {
    id: 'm1',
    name: 'حساب ببجي لفل 75 نادر',
    description: 'حساب قديم يحتوي على سكنات نادرة من الموسم الثاني.',
    price: 320.00,
    category: 'حسابات ألعاب',
    imageUrl: 'https://picsum.photos/seed/m1/400/300',
    stock: 1,
    status: 'active',
    isP2P: true
  },
  {
    id: 'm2',
    name: 'حساب فري فاير ساكورا',
    description: 'حساب يحتوي على رقصة الساكورا وسكنات حصرية.',
    price: 450.00,
    category: 'حسابات ألعاب',
    imageUrl: 'https://picsum.photos/seed/m2/400/300',
    stock: 1,
    status: 'active',
    isP2P: true
  }
];

export const AGENTS: Agent[] = [
  {
    id: 'ag1',
    name: 'أبو فهد للوساطة',
    contactType: 'WhatsApp',
    contactValue: '+966500000000',
    availability: '24/7',
  },
  {
    id: 'ag2',
    name: 'إكسيجو تليجرام',
    contactType: 'Telegram',
    contactValue: '@ExigoSupport',
    availability: '10 AM - 10 PM',
  },
];
