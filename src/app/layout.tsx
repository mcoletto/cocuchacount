import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "CocuchaCount",
  description: "Mi registro de consumo de Coca-Cola",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CocuchaCount",
  },
  icons: {
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E8192C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="min-h-screen bg-background">
        <main className="max-w-md mx-auto min-h-screen pb-24 relative">
          {children}
        </main>
        <div className="max-w-md mx-auto">
          <BottomNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
