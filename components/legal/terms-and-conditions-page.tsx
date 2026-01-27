"use client"

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Shield, Scale, Info } from "lucide-react"

const sections = [
  {
    id: "definitions",
    titleEn: "Definitions",
    titleAr: "التعريفات",
    icon: Info,
    contentEn: [
      "Mirvory is a multi-vendor commerce platform operated by Mirvory LLC.",
      "User refers to any visitor, buyer, or seller using the platform.",
      "Seller is a registered user who publishes products on Mirvory.",
      "Services include browsing, carts, checkout, reviews, notifications, dashboards, loyalty programs, returns, and pick-up services."
    ],
    contentAr: [
      "Mirvory: منصة تجارة إلكترونية متعددة البائعين تديرها شركة Mirvory.",
      "المستخدم: أي شخص يستخدم المنصة كمشتري أو بائع أو زائر.",
      "البائع: مستخدم مسجَّل يعرض منتجاته عبر Mirvory.",
      "الخدمات: جميع الميزات المتاحة مثل عرض المنتجات، السلة، الدفع، التقييمات، الإشعارات، لوحة البائع، النقاط، الاسترجاع ونقاط الاستلام."
    ],
  },
  {
    id: "consent",
    titleEn: "Acceptance",
    titleAr: "الموافقة على الشروط",
    icon: CheckCircle,
    contentEn: [
      "Using Mirvory implies acceptance of these terms. If you disagree, please stop using the platform.",
      "Mirvory may update the Terms periodically; continued use means acceptance of the updates."
    ],
    contentAr: [
      "استخدامك لـ Mirvory يعني قبولك لهذه الشروط، وفي حال عدم الموافقة يجب التوقف عن استخدام المنصة.",
      "يحق لـ Mirvory تعديل الشروط ونشرها، واستمرار الاستخدام بعد التعديل يُعد موافقة صريحة."
    ],
  },
  {
    id: "eligibility",
    titleEn: "Eligibility & Accounts",
    titleAr: "الأهلية والحساب",
    icon: Shield,
    contentEn: [
      "You must be 18+ or legally authorized to represent the account holder.",
      "Provide accurate registration information and keep your credentials secure.",
      "Verification (email, phone, ID) may be required for certain operations."
    ],
    contentAr: [
      "يجب أن يكون عمر المستخدم 18 سنة فأكثر أو أن يكون ممثلاً قانونياً للحساب.",
      "يجب إدخال معلومات صحيحة عند التسجيل والحفاظ على سرية بيانات الدخول.",
      "قد تطلب Mirvory التحقق عبر البريد أو الهاتف أو الهوية لبعض العمليات."
    ],
  },
  {
    id: "pricing",
    titleEn: "Products, Pricing & Payments",
    titleAr: "المنتجات، الأسعار والدفع",
    icon: Scale,
    contentEn: [
      "Sellers are responsible for accurate listings, stock, and pricing unless otherwise agreed.",
      "Mirvory may review or remove non-compliant listings.",
      "Default revenue split: 85% seller / 15% Mirvory (13% platform + 2% promos).",
      "Payments are processed through approved gateways (e.g., Stripe)."
    ],
    contentAr: [
      "البائع مسؤول عن دقة الوصف والمخزون والأسعار ما لم ينص خلاف ذلك.",
      "يحق لـ Mirvory مراجعة أو إيقاف المنتجات المخالفة للسياسات.",
      "نسبة مشاركة العائد الافتراضية: 85% للبائع و15% للمنصة (13% للموقع + 2% خصومات).",
      "تُعالج المدفوعات عبر بوابات معتمدة مثل Stripe وتقديم معلومات الدفع يعني قبول تعامل الطرف الثالث."
    ],
  },
  {
    id: "shipping",
    titleEn: "Shipping & Returns",
    titleAr: "الشحن والاسترجاع",
    icon: Info,
    contentEn: [
      "Shipping timelines and fees are handled by the seller or agreed logistics partner.",
      "Pickup points and secret PIN confirmations may be used based on coverage.",
      "Return / exchange policies vary per seller; each listing clarifies the applicable policy."
    ],
    contentAr: [
      "تفاصيل الشحن والمهل والتكاليف تقع ضمن مسؤولية البائع أو مزوّد الخدمة.",
      "قد توفر Mirvory نقاط استلام ودعم رمز تأكيد سري لتسليم الطلب.",
      "سياسات الإرجاع والاستبدال تختلف حسب البائع ونوع المنتج، وتعرض في صفحة المنتج."
    ],
  },
  {
    id: "ratings",
    titleEn: "Content & Ratings",
    titleAr: "المحتوى والتقييمات",
    icon: Info,
    contentEn: [
      "Registered users can leave one review per product and may edit or delete it.",
      "Mirvory may moderate or remove offensive, fraudulent, or promotional content.",
      "Manipulating ratings or creating fake accounts is prohibited."
    ],
    contentAr: [
      "يمكن للمستخدمين المسجّلين إضافة تقييم واحد لكل منتج مع إمكانية التعديل أو الحذف.",
      "يحق لـ Mirvory إزالة المحتوى المخالف أو المسيء أو الاحتيالي.",
      "ممنوع التلاعب بالتقييمات أو إنشاء حسابات مزيفة لهذا الغرض."
    ],
  },
  {
    id: "legal",
    titleEn: "Liability & Termination",
    titleAr: "المسؤولية وإنهاء الحساب",
    icon: Shield,
    contentEn: [
      "Mirvory acts as a marketplace intermediary and is not liable for indirect losses beyond statutory limits.",
      "Mirvory may suspend or terminate accounts for policy violations or fraud.",
      "Disputes fall under Egyptian law unless another governing law is agreed."
    ],
    contentAr: [
      "تعمل Mirvory كوسيط ولا تتحمل مسؤولية الأضرار غير المباشرة إلا وفق ما يفرضه القانون.",
      "يحق للمنصة تعليق أو إنهاء الحساب عند مخالفة الشروط أو الاشتباه في الاحتيال.",
      "تُطبق قوانين جمهورية مصر العربية على النزاعات ما لم يُتّفق على غير ذلك."
    ],
  },
]

export default function TermsAndConditionsPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 text-sm">
          {isArabic ? "مستند قانوني" : "Legal Document"}
        </Badge>
        <div className="space-y-3">
          <h1 className={cn("text-3xl font-bold tracking-tight", isArabic && "font-[Cairo]")}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {isArabic ? "شروط الاستخدام - Mirvory" : "Mirvory Terms of Service"}
          </h1>
          <p className="text-muted-foreground" dir={isArabic ? "rtl" : "ltr"}>
            {isArabic
              ? "آخر تحديث: 25 نوفمبر 2025"
              : "Last updated: 25 November 2025"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle dir={isArabic ? "rtl" : "ltr"}>
            {isArabic ? "ملخص سريع" : "Quick Highlights"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "معلومات الشحن" : "Shipping"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "البائع أو مقدم الخدمة مسؤول عن الشحن والمهل الزمنية، مع إمكانية استخدام نقاط الاستلام."
                  : "Sellers/logistics partners handle shipping timelines; pickup hubs may apply."}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "سياسة العمولات" : "Revenue Split"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "النسبة الافتراضية 85% للبائع / 15% للمنصة (13% تشغيل + 2% خصومات)."
                  : "Default split: 85% seller / 15% Mirvory (13% ops + 2% promos)."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon
          const content = isArabic ? section.contentAr : section.contentEn
          const title = isArabic ? section.titleAr : section.titleEn

          return (
            <Card key={section.id} id={section.id} className="scroll-mt-20">
              <CardHeader className="flex flex-row items-center gap-3" dir={isArabic ? "rtl" : "ltr"}>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3" dir={isArabic ? "rtl" : "ltr"}>
                  {content.map((paragraph, idx) => (
                    <li key={idx} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="space-y-4" dir={isArabic ? "rtl" : "ltr"}>
          <h3 className="text-lg font-semibold">
            {isArabic ? "التواصل والدعم" : "Need to reach us?"}
          </h3>
          <p className="text-muted-foreground">
            {isArabic
              ? "للأسئلة القانونية أو التعاقدية راسلنا على mohamedyousefle@gmail.com أو استخدم صفحة الاتصال."
              : "For legal or commercial queries, email mohamedyousefle@gmail.com or use the contact form."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
