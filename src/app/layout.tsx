import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CuanPro HPP Calculator - AI-Powered Business Analytics",
  description: "Advanced HPP calculator and business analytics platform for UMKM with AI-powered price optimization, competitor analysis, and financial projections.",
  keywords: ["HPP", "Calculator", "UMKM", "Business", "Analytics", "AI", "Price Optimization", "Indonesia"],
  authors: [{ name: "CuanPro Team" }],
  icons: {
    icon: "/gift-icon.png",
  },
  openGraph: {
    title: "CuanPro HPP Calculator",
    description: "AI-powered HPP calculator and business analytics for Indonesian UMKM",
    url: "https://cuanpro.ai",
    siteName: "CuanPro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CuanPro HPP Calculator",
    description: "AI-powered HPP calculator and business analytics for Indonesian UMKM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
