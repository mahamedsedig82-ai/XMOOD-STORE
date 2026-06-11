
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Exigo Marketplace | Luxury Digital Showroom',
  description: 'The ultimate digital marketplace for games, designs, and escrow services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        {children}
      </body>
    </html>
  );
}
