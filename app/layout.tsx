// Updated RootLayout with global user/token loader
import type React from "react"
import type { Metadata } from "next"
import { Cairo, Noto_Naskh_Arabic } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { ColorThemeProvider } from "@/components/color-theme-provider"
import { StoreProvider } from "@/src/app/providers/StoreProvider"
import { LayoutWrapper } from "./layout-wrapper"
import { MainNav } from "@/components/main-nav"
import ErrorBoundaryProvider from "@/providers/ErrorBoundaryProvider"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "sonner"
import { getUserServer } from "@/src/lib/getUserServer"
import { AuthProvider } from "@/contexts/AuthProvider"
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["400", "500", "700"],
})

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-naskh",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Mirvory - متجر الكوتشيات والملابس",
  description: "منصة تجارة إلكترونية متعددة التجار متخصصة في بيع الكوتشيات الميرور والملابس",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const userData = await getUserServer()
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${notoNaskh.variable} font-sans antialiased`}>
        <StoreProvider>
          <LayoutWrapper>
            <LanguageProvider>
              <ColorThemeProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                  <ErrorBoundaryProvider>
                    <AuthProvider initialUser={userData}>
                    <MainNav />
                    <div className="pt-16">
                      <Toaster
                        position="top-center"
                        richColors
                        expand
                        duration={4000}
                        closeButton
                      />
                      {children}
                    </div>
                    <SiteFooter />
                  </AuthProvider>
                  </ErrorBoundaryProvider>
                </ThemeProvider>
              </ColorThemeProvider>
            </LanguageProvider>
          </LayoutWrapper>
        </StoreProvider>
      </body>
    </html>
  )
}
