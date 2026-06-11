
import { Product, Agent, Category, MiddlemanRequest } from './types';

export const STORE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'UC PUBG Mobile - 6000',
    description: 'شحن فوري ومباشر لحسابك في ببجي موبايل.',
    price: 99.99,
    category: 'شحن ألعاب',
    imageUrl: 'https://picsum.photos/seed/pubg1/400/300',
    stock: 50,
  },
  {
    id: 'p2',
    name: 'حساب Valorant نادر',
    description: 'يحتوي على سكنات حصرية من السيزون الأول.',
    price: 250.00,
    category: 'حسابات ألعاب',
    imageUrl: 'https://picsum.photos/seed/val1/400/300',
    stock: 1,
  },
  {
    id: 'p3',
    name: 'بوستر متجر احترافي',
    description: 'تصميم بوستر تسويقي عالي الجودة لمتجرك الرقمي.',
    price: 15.00,
    category: 'خدمات تصميم',
    imageUrl: 'https://picsum.photos/seed/design2/400/300',
    stock: 100,
  },
];

export const MARKETPLACE_PRODUCTS: Product[] = [
  {
    id: 'm1',
    name: 'خدمة رفع رنك League of Legends',
    description: 'أصل لبلاتينيوم خلال 3 أيام فقط.',
    price: 45.00,
    category: 'خدمات رقمية',
    imageUrl: 'https://picsum.photos/seed/lol1/400/300',
    stock: 5,
    vendor: 'Ahmad_Gamer',
    isP2P: true,
  },
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

export const MIDDLEMAN_REQUESTS: MiddlemanRequest[] = [
  {
    id: 'mid1',
    title: 'بيع حساب إنستقرام 100k',
    status: 'in progress',
    amount: 150.0,
    buyer: 'Khalid',
    seller: 'User99',
    createdAt: '2023-11-20',
  }
];
