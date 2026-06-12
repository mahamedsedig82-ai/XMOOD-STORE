import { Product, Agent } from './types';

// تم تصفير كافة المنتجات بطلب من الإدارة لبدء البناء الأسطوري
export const STORE_PRODUCTS: Product[] = [];

export const MARKETPLACE_PRODUCTS: Product[] = [];

export const AGENTS: Agent[] = [
  {
    id: 'ag1',
    name: 'الوكيل الأسطوري XMOOD',
    contactType: 'WhatsApp',
    contactValue: '+966500000000',
    availability: '24/7 Sovereign Access',
  },
  {
    id: 'ag2',
    name: 'دعم النخبة التليجرام',
    contactType: 'Telegram',
    contactValue: '@XMOOD_SOVEREIGN',
    availability: 'Instant Response',
  },
];