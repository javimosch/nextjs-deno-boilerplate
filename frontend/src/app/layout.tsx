import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex gap-4">
            <Link href="/" className="text-white hover:text-gray-300">Home</Link>
            <Link href="/groq-transcribe" className="text-white hover:text-gray-300">Voice to module</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
