
import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { GuidanceBot } from '@/components/shared/GuidanceBot';
import { PageLoader } from '@/components/shared/PageLoader';

export const metadata: Metadata = {
  title: 'XMOOD STORE | منصة الخدمات الإلكترونية المعتمدة',
  description: 'وجهتك الأولى لشحن الألعاب، الحسابات المميزة، والخدمات الرقمية بأعلى جودة وأمان.',
  openGraph: {
    title: 'XMOOD STORE',
    description: 'منصة الخدمات الإلكترونية المعتمدة',
    images: ['https://picsum.photos/seed/xmood-og/1200/630'],
  }
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
          <PageLoader />
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
          <GuidanceBot />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
