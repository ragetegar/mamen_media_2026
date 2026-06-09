import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import AuthGuard from "@/components/AuthGuard";
import PWARegistration from "@/components/PWARegistration";
import type { Viewport } from "next";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#7B3EFF",
};

export const metadata: Metadata = {
  title: {
    default: "MAMEN — Indonesian Music & Concert Culture",
    template: "%s | MAMEN",
  },
  description:
    "Your go-to platform for Indonesian music, concert culture, and everything that moves the crowd. Concert listings, music reviews, and cultural coverage from Jakarta and beyond.",
  keywords: [
    "Indonesian music",
    "concerts Jakarta",
    "music review",
    "concert review",
    "Jabodetabek events",
    "indie music Indonesia",
    "mamen indonesia",
    "mamen",
    "mamen.id"
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "MAMEN",
    title: "MAMEN — Indonesian Music & Concert Culture",
    description:
      "Your go-to platform for Indonesian music, concert culture, and everything that moves the crowd. JKT48 gaming and others too",
  },
  icons: {
    icon: "/icon-192.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="bg-mamen-black text-mamen-white font-body antialiased transition-colors duration-300">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E0BS1D856V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E0BS1D856V');
          `}
        </Script>
        <PWARegistration />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AuthGuard>
              <Marquee />
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
