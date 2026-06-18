import { Product, Agent } from './types';

// تم تحديث قائمة المنتجات المختارة لتظهر في المتجر بلمسة فاخرة
export const STORE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'باقة النخبة PUBG UC - 8100',
    price: 99.99,
    category: 'شحن ألعاب',
    stock: 15,
    minStock: 5,
    imageUrl: 'https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png',
    description: 'شحن فوري ومعتمد لأعلى باقة UC في لعبة PUBG Mobile.',
    highlights: 'تسليم آلي\nتوثيق رسمي\nدعم 24/7',
    shippingCodes: '',
    status: 'active',
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    name: 'حزمة الماس Free Fire - 5600',
    price: 49.99,
    category: 'شحن ألعاب',
    stock: 20,
    minStock: 10,
    imageUrl: 'https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png',
    description: 'باقة الماس الكبرى للاعبي فري فاير المحترفين.',
    highlights: 'أمان كامل\nسرعة سيادية\nأسعار منافسة',
    shippingCodes: '',
    status: 'active',
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const AGENTS: Agent[] = [
  {
    id: 'ag1',
    name: 'الوكيل الرسمي XMOOD',
    contactType: 'WhatsApp',
    contactValue: '+966500000000',
    availability: '24/7 Sovereign Access',
  },
  {
    id: 'ag2',
    name: 'دعم النخبة المباشر',
    contactType: 'Telegram',
    contactValue: '@XMOOD_SUPPORT',
    availability: 'Instant Response',
  },
];