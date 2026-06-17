import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { GuidanceBot } from '@/components/shared/GuidanceBot';
import { PageLoader } from '@/components/shared/PageLoader';
import { SystemHealthMonitor } from '@/components/shared/SystemHealthMonitor';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';

// الرابط الرسمي للهوية السيادية لمتجر XMOOD
const BRAND_IMAGE = 'https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png';

export const metadata: Metadata = {
  title: 'XMOOD STORE | منصة الخدمات الإلكترونية المعتمدة',
  description: 'المرجع الأول والأكثر موثوقية لشحن الألعاب، الحسابات الرقمية، والحلول الإبداعية الاحترافية بأعلى معايير الأمان والسرعة السيادية.',
  keywords: ['XMOOD', 'شحن ألعاب', 'بطاقات رقمية', 'خدمات تصميم', 'وساطة مالية', 'متجر ألعاب'],
  authors: [{ name: 'XMOOD SOVEREIGN TEAM' }],
  metadataBase: new URL('https://xmood-36c92.firebaseapp.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://xmood-36c92.firebaseapp.com',
    siteName: 'XMOOD STORE',
    title: 'XMOOD STORE | تجربة رقمية نُخبوية وموثوقة',
    description: 'استكشف أرقى باقات شحن الألعاب والخدمات التقنية المعتمدة سيادياً. أمان مطلق وتسليم فوري.',
    images: [
      {
        url: BRAND_IMAGE,
        width: 1200,
        height: 630,
        alt: 'XMOOD STORE Official Brand Identity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XMOOD STORE | منصة الخدمات الإلكترونية المعتمدة',
    description: 'أمان مطلق وتسليم فوري لكافة الخدمات الرقمية والألعاب.',
    images: [BRAND_IMAGE],
    creator: '@XMOOD_STORE',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: BRAND_IMAGE, sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: BRAND_IMAGE, sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=PT+Sans:wght@400;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
        <FirebaseClientProvider>
          <CartProvider>
            <SystemHealthMonitor />
            <PageLoader />
            <div className="relative flex min-h-screen flex-col">
              {children}
              <Footer />
            </div>
            <GuidanceBot />
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
