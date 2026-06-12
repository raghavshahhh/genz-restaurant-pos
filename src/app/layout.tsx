import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from '@/lib/env';

// Log environment (validation happens at runtime)
console.log('Environment:', env.NODE_ENV);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gen-Z Restaurant POS",
  description: "Modern POS system for Gen-Z Restaurant",
};

import Sidebar from '@/components/sidebar';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-gray-50 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto p-6">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}