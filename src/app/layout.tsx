import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/store/cart-provider";
import SiteHeader from "@/components/store/site-header";
import SiteFooter from "@/components/store/site-footer";
import "./globals.css";

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-arabic",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "مسبار — متجر التراخيص الرقمية الأصلية",
    template: "%s | مسبار",
  },
  description:
    "متجر سعودي متخصص في تراخيص البرمجيات الأصلية: أنظمة ويندوز، حزم أوفيس، اشتراكات أدوبي، برامج الحماية، وأدوات أوتوديسك — بأسعار منافسة وتسليم فوري خلال دقائق.",
  keywords: ["تراخيص برامج", "ويندوز 11", "أوفيس 2021", "أدوبي", "مضاد فيروسات", "متجر برامج"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} ${grotesk.variable}`}>
      <body className="bg-ink-950 text-ink-100 antialiased min-h-screen flex flex-col">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0e1727",
              border: "1px solid rgba(34,211,238,0.3)",
              color: "#e8eefb",
              direction: "rtl",
              fontFamily: "var(--font-ibm-arabic)",
            },
          }}
        />
      </body>
    </html>
  );
}
