import type React from "react"
import type { Metadata } from "next"
import { Cairo, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { ColorThemeProvider } from "@/components/color-theme-provider";
import { StoreProvider } from "@/src/app/providers/StoreProvider";
import { LayoutWrapper } from "@/app/layout-wrapper";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "sonner"
import { SocketProvider } from "@/contexts/SocketProvider"
import { getUserServer } from "@/src/lib/getUserServer"
import { AuthProvider } from "./AuthProvider"

// Font configurations
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  display: "swap",
  variable: "--font-cairo",
  adjustFontFallback: false,
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: {
    default: "Mirvory - متجر الكوتشيات والملابس",
    template: "%s | Mirvory"
  },
  description: "منصة تجارة إلكترونية متعددة التجار متخصصة في بيع الكوتشيات الميرور والملابس",
  keywords: ["كوتشيات", "ملابس", "موضة", "تسوق", "أونلاين"],
  authors: [{ name: "Mirvory" }],
  creator: "Mirvory",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    title: "Mirvory - متجر الكوتشيات والملابس",
    description: "منصة تجارة إلكترونية متعددة التجار متخصصة في بيع الكوتشيات الميرور والملابس",
    siteName: "Mirvory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirvory - متجر الكوتشيات والملابس",
    description: "منصة تجارة إلكترونية متعددة التجار متخصصة في بيع الكوتشيات الميرور والملابس",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const userData = await getUserServer();

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        <StoreProvider>
          <AuthProvider initialUser={userData}> {/* Pass initial data */}
            <LanguageProvider>
              <ColorThemeProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange={false}
                >
                  <SocketProvider>
                    <LayoutWrapper>
                      <MainNav />
                      <main className="min-h-screen pt-16">
                        {children}
                      </main>
                      <SiteFooter />
                    </LayoutWrapper>

                    {/* Global Toaster */}
                    <Toaster
                      position="top-center"
                      richColors
                      expand
                      duration={4000}
                      closeButton
                      theme="light"
                    />
                  </SocketProvider>
                </ThemeProvider>
              </ColorThemeProvider>
            </LanguageProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
