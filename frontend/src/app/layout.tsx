import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootLayoutContent } from "@/components/layout/root-layout-content";
import Script from "next/script";
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
  title: "OceanLearn | AI-Powered Learning Platform",
  description:
    "Enhance your learning experience with our AI-powered education platform featuring smart flashcards, concept maps, and adaptive tests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="http://localhost:8097" strategy="beforeInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
