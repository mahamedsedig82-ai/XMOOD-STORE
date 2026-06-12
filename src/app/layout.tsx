import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { GuidanceBot } from '@/components/shared/GuidanceBot';

export const metadata: Metadata = {
  title: 'XMOOD | متجرك الرقمي المتكامل',
  description: 'وجهتك الأولى لشحن الألعاب، الحسابات المميزة، والخدمات الرقمية بأعلى جودة وأمان.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/30">
        <FirebaseClientProvider>
          {children}
          <GuidanceBot />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
