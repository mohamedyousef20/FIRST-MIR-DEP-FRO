"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import MirvoryLogo from "@/components/mirvory-logo"

export function SiteFooter() {
  const { language, t } = useLanguage()

  return (
    <footer className="bg-muted/40">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <MirvoryLogo className="text-3xl" />
            </Link>
            <p className="text-muted-foreground mb-4">
              {language === "ar"
                ? "متجر متخصص في بيع الكوتشيات الميرور والملابس العصرية بأفضل الأسعار وأعلى جودة."
                : "A store specializing in selling mirror sneakers and modern clothing at the best prices and highest quality."}
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">Youtube</span>
              </Button>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">{language === "ar" ? "روابط سريعة" : "Quick Links"}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("offers")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {language === "ar" ? "من نحن" : "About Us"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("faq")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">{language === "ar" ? "معلومات قانونية" : "Legal Information"}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("termsAndConditions")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {language === "ar" ? "سياسة الإرجاع" : "Return Policy"}
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {language === "ar" ? "سياسة الشحن" : "Shipping Policy"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">{language === "ar" ? "اتصل بنا" : "Contact Us"}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {language === "ar" ? "123 شارع النصر، القاهرة، مصر" : "123 El-Nasr St, Cairo, Egypt"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href="tel:+201060167568" className="text-muted-foreground hover:text-foreground transition-colors">
                  +20 106 016 7568
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a
                  href="mailto:info@mirvory.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  info@mirvory.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-6 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Mirvory.
            {language === "ar" ? " جميع الحقوق محفوظة." : " All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  )
}
