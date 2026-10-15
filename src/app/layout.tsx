import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Uri Bagüés — Portfolio de Fotografía & Arte Visual",
  description: "Portfolio personal de fotografía con experiencias interactivas en Three.js, galerías 3D y diseño editorial.",
  keywords: ["fotografía", "three.js", "portfolio", "leica", "sony", "arte visual"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08080a] text-zinc-100">{children}</body>
    </html>
  );
}
