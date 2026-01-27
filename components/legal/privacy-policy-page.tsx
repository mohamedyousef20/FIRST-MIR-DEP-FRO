"use client"

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Shield, Lock, Database, Mail, AlertTriangle } from "lucide-react"

const sections = [
  {
    id: "collection",
    titleAr: "ما البيانات التي نجمعها؟",
    titleEn: "Data We Collect",
    icon: Database,
    contentAr: [
      "بيانات الحساب والتسجيل (الاسم، البريد، الهاتف، العنوان، الصورة).",
      "بيانات الطلبات والمعاملات والدفع (لا نخزن بيانات البطاقات على خوادمنا).",
      "بيانات البائعين (مستندات التحقق، بيانات الحساب البنكي، نسب العمولة).",
      "المحتوى الذي ينشئه المستخدم (التقييمات، التعليقات، رسائل الدعم).",
      "بيانات الاستخدام (سجلات الدخول، عمليات البحث، تفضيلات اللغة، الكوكيز، عنوان IP)."
    ],
    contentEn: [
      "Account & registration info (name, email, phone, shipping/billing addresses, avatar).",
      "Order, transaction, and payment metadata (card details handled by the gateway).",
      "Seller verification docs, payout accounts, commission settings.",
      "User generated content such as reviews, comments, support messages.",
      "Usage data (login logs, searches, language preferences, cookies, IP, device info)."
    ],
  },
  {
    id: "purpose",
    titleAr: "لماذا نستخدم بياناتك؟",
    titleEn: "How We Use Your Data",
    icon: Shield,
    contentAr: [
      "تقديم الخدمات الأساسية: معالجة الطلبات، الشحن، الدفع، إدارة الحسابات.",
      "التحقق ومنع الاحتيال، الأمن، إدارة الوصول.",
      "التواصل معك حول الفواتير والإشعارات والدعم.",
      "تحسين الأداء، تخصيص تجربة التصفح، اقتراح المنتجات.",
      "الامتثال للقوانين، حفظ السجلات، الرد على الجهات الرسمية.",
      "التسويق (بعد الحصول على موافقتك) وإرسال العروض."
    ],
    contentEn: [
      "Deliver core services: checkout, shipping, payments, account management.",
      "Identity verification, fraud prevention, and platform security.",
      "Communications such as invoices, order updates, support replies.",
      "Product personalization, analytics, and feature improvements.",
      "Compliance with legal obligations and record keeping.",
      "Marketing campaigns when consented and configurable."
    ],
  },
  {
    id: "legal",
    titleAr: "الأساس القانوني",
    titleEn: "Legal Basis",
    icon: Lock,
    contentAr: [
      "تنفيذ العقد (الطلبات والمعاملات)",
      "الامتثال للالتزامات القانونية",
      "المصلحة المشروعة (الأمان ومنع الاحتيال)",
      "الموافقة الصريحة للأنشطة التسويقية"
    ],
    contentEn: [
      "Contract performance (processing orders/payments)",
      "Legal compliance",
      "Legitimate interest (security, fraud prevention)",
      "Consent for marketing / optional profiling"
    ],
  },
  {
    id: "sharing",
    titleAr: "متى نشارك بياناتك؟",
    titleEn: "Sharing with Third Parties",
    icon: Mail,
    contentAr: [
      "بوابات الدفع (مثل Stripe) لمعالجة المدفوعات.",
      "مزودو الاستضافة والتخزين (Vercel، Render، MongoDB Atlas، Cloudinary).",
      "مزودو الإشعارات (WhatsApp API، البريد، SMS).",
      "شركاء الشحن واللوجستيات.",
      "مزودو التحليلات والتسويق لتحسين المنصة."
    ],
    contentEn: [
      "Payment processors (e.g., Stripe).",
      "Hosting / storage providers such as Vercel/Render, MongoDB Atlas, Cloudinary.",
      "Notification vendors (WhatsApp API, email/SMS providers).",
      "Shipping and logistics partners.",
      "Analytics/marketing tools to optimize the platform."
    ],
  },
  {
    id: "rights",
    titleAr: "حقوقك",
    titleEn: "Your Rights",
    icon: AlertTriangle,
    contentAr: [
      "الوصول إلى بياناتك أو طلب نسخة قابلة للنقل.",
      "تصحيح البيانات غير الدقيقة.",
      "طلب حذف البيانات عند الإمكان قانونياً.",
      "سحب الموافقة أو الاعتراض على التسويق."
    ],
    contentEn: [
      "Access or port your personal data.",
      "Correct inaccurate information.",
      "Request deletion when legally permitted.",
      "Withdraw consent or opt-out of marketing."
    ],
  },
]

export default function PrivacyPolicyPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 text-sm">
          {isArabic ? "سياسة خصوصية" : "Privacy Notice"}
        </Badge>
        <div className="space-y-3">
          <h1 className={cn("text-3xl font-bold tracking-tight", isArabic && "font-[Cairo]")}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {isArabic ? "سياسة الخصوصية - Mirvory" : "Mirvory Privacy Policy"}
          </h1>
          <p className="text-muted-foreground" dir={isArabic ? "rtl" : "ltr"}>
            {isArabic ? "آخر تحديث: 25 نوفمبر 2025" : "Last updated: 25 November 2025"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle dir={isArabic ? "rtl" : "ltr"}>
            {isArabic ? "نظرة عامة" : "At a Glance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "مالك البيانات" : "Data Controller"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "Mirvory هي مالك/مشغّل المنصة والمسؤول عن معالجة البيانات."
                  : "Mirvory operates the platform and acts as the data controller."}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "التواصل" : "Contact"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "لأي طلب متعلق بالخصوصية، راسل: mohamedyousefle@gmail.com"
                  : "For privacy inquiries email: mohamedyousefle@gmail.com"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon
          const title = isArabic ? section.titleAr : section.titleEn
          const content = isArabic ? section.contentAr : section.contentEn

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
                  {content.map((text, idx) => (
                    <li key={idx} className="text-muted-foreground leading-relaxed">
                      {text}
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
            {isArabic ? "الكوكيز وحماية البيانات" : "Cookies & Security"}
          </h3>
          <p className="text-muted-foreground">
            {isArabic
              ? "نستخدم الكوكيز الأساسية لتحسين جلسة الاستخدام وأخرى اختيارية للتحليلات. يمكنك تعديل تفضيلاتك من إعدادات المتصفح."
              : "We rely on essential cookies for session handling plus optional analytics cookies; manage preferences in your browser."}
          </p>
          <p className="text-muted-foreground">
            {isArabic
              ? "نطبق تدابير تقنية وإجرائية (تشفير، سياسات وصول، تدقيقات دورية). رغم ذلك، لا يوجد نظام آمن 100%، وسنبلّغ عن أي خرق كبير وفق القانون."
              : "We use technical and organizational safeguards (encryption, restricted access, audits). If a breach occurs, we will notify users per applicable law."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
