/**
 * Root Layout
 * Next.js App Router root layout with metadata, providers, and global structure
 */

import './globals.css';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastProvider from '@/components/ui/ToastProvider';

export const metadata = {
  title: 'GR Groups | Luxury E-Commerce',
  description:
    'Experience the future of e-commerce. Premium products tailored for the modern individual with impeccable taste. Shop luxury streetwear, accessories, and limited editions.',
  keywords: ['luxury', 'e-commerce', 'premium', 'fashion', 'streetwear', 'GR Groups'],
  openGraph: {
    title: 'GR Groups | Luxury E-Commerce',
    description: 'Redefining luxury aesthetics for the modern era.',
    type: 'website',
  },
  verification: {
    google: "bMQueQ4HLDbL6drn0zgPcy7jEYPZe_lcwE1RbZEmJtg",
  },
};


export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ToastProvider />
        <Suspense fallback={<div className="h-20 bg-background" />}>
          <Navbar />
        </Suspense>
        <main className="flex-grow pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
