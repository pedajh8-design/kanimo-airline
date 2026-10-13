import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SkyTickets | Fly More • Explore More',
  description: 'Book domestic and international flights, reserve seats, get instant digital boarding passes, and enjoy best price guarantees with SkyTickets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
