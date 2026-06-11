import { Product, Agent } from './types';

// تم تفريغ المنتجات بناءً على طلب المدير العام لبدء إضافة منتجات حقيقية عبر لوحة الإدارة
export const STORE_PRODUCTS: Product[] = [];

export const MARKETPLACE_PRODUCTS: Product[] = [];

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
