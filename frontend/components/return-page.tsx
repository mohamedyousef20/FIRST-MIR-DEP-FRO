"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Info,
  Loader2,
  Package,
  ShieldCheck,
} from "lucide-react"
import { returnService } from "@/lib/api"

export function ReturnPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"
  const searchParams = useSearchParams()
  const orderIdFromParams = searchParams?.get("orderId") || ""

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    orderId: "",
    itemId: "",
    reason: "",
    customerName: "",
    customerPhone: "",
    productName: "",
    productCode: "",
    termsAccepted: false,
  })

  useEffect(() => {
    if (orderIdFromParams && orderIdFromParams !== formData.orderId) {
      setFormData((prev) => ({ ...prev, orderId: orderIdFromParams }))
    }
  }, [orderIdFromParams])

  const steps = useMemo(
    () => [
      { title: isArabic ? "معلومات الطلب" : "Order Info", fields: ["orderId", "itemId"], icon: Package },
      { title: isArabic ? "سبب الإرجاع" : "Return Reason", fields: ["reason"], icon: ClipboardList },
      { title: isArabic ? "الشروط والأحكام" : "Terms & Conditions", fields: ["termsAccepted"], icon: ShieldCheck },
    ],
    [isArabic]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, termsAccepted: !prev.termsAccepted }))
  }

  const validateCurrentStep = () => {
    const currentFields = steps[currentStep - 1].fields
    for (const field of currentFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(isArabic ? "الرجاء ملء جميع الحقول المطلوبة" : "Please fill all required fields")
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.termsAccepted) {
      toast.error(isArabic ? "الرجاء قبول الشروط والأحكام" : "Please accept the terms and conditions")
      return
    }

    setIsSubmitting(true)
    try {
      const returnData = {
        orderId: formData.orderId,
        reason: formData.reason,
        itemId: formData.itemId,


      }

      await returnService.createReturnRequest(returnData);
      toast.success(isArabic ? "تم إرسال طلب الإرجاع بنجاح" : "Return request submitted successfully")
      resetForm()
    } catch (error) {

      const errorMessage = error.response?.data?.message ||
        (isArabic ? "حدث خطأ أثناء إرسال طلب" : "Failed to send notification");
      toast.error(errorMessage);
    }
  }

  const resetForm = () => {
    setFormData({
      orderId: "",
      itemId: "",
      reason: "",
      customerName: "",
      customerPhone: "",
      productName: "",
      productCode: "",
      termsAccepted: false,
    })
    setCurrentStep(1)
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-10">
        <div className="relative z-10 space-y-4 text-center md:text-left">

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {isArabic ? "نساعدك في إرجاع مشترياتك بكل سهولة" : "We make returns effortless"}
          </h1>
          <p className="text-muted-foreground md:text-lg">
            {isArabic
              ? "ادخل تفاصيل طلبك، صف المشكلة، وراجع السياسة قبل الإرسال."
              : "Provide your order details, describe the issue, and review the policy before submitting."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            {formData.orderId && (
              <BadgePill label={`${isArabic ? "رقم الطلب" : "Order"}: ${formData.orderId}`} />
            )}
          </div>
        </div>

        <div className="absolute -right-12 -top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="space-y-6">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-primary" />
                {isArabic ? "مراحل الطلب" : "Request stages"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "تابع مسار الطلب لتعرف مكانك في العملية."
                  : "Track where you are in the return journey."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {steps.map((step, index) => {
                const Icon = step.icon
                const state = currentStep === index + 1 ? "current" : currentStep > index + 1 ? "done" : "pending"
                return (
                  <StepCard
                    key={step.title}
                    icon={<Icon className="h-4 w-4" />}
                    label={step.title}
                    index={index + 1}
                    state={state}
                  />
                )
              })}
              <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isArabic ? "تذكير بسياسة الإرجاع" : "Quick policy reminder"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>{isArabic ? "14 يوم من تاريخ الاستلام للإرجاع" : "Return within 14 days of delivery"}</li>
                <li>
                  {isArabic ? "يجب أن يكون المنتج بحالته الأصلية" : "Items must stay in their original condition"}
                </li>
                <li>{isArabic ? "نغطي تكلفة استرجاع العيوب المصنعية" : "Defects are fully covered"}</li>
              </ul>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle>{isArabic ? "نموذج الإرجاع" : "Return form"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "أكمل البيانات التالية لنتمكن من مراجعة طلبك"
                  : "Complete the fields below so we can process your request"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orderId">{isArabic ? "رقم الطلب" : "Order ID"} *</Label>
                      <Input
                        id="orderId"
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleInputChange}
                        placeholder={isArabic ? "أدخل رقم الطلب" : "Enter your order ID"}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemId">{isArabic ? "رقم المنتج" : "Item ID"} *</Label>
                      <Input
                        id="itemId"
                        name="itemId"
                        value={formData.itemId}
                        onChange={handleInputChange}
                        placeholder={isArabic ? "SKU / رقم المنتج" : "Product SKU / item ID"}
                        required
                      />
                    </div>
                  </div>

                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="reason">{isArabic ? "سبب الإرجاع" : "Return reason"} *</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      className="min-h-[140px]"
                      placeholder={
                        isArabic
                          ? "أخبرنا بالتفاصيل......  "
                          : "Tell us what went wrong or share defect codes"
                      }
                      required
                    />
                  </div>

                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <Card className="border border-dashed">
                    <CardHeader>
                      <CardTitle>{isArabic ? "سياسة الإرجاع" : "Return policy"}</CardTitle>
                      <CardDescription>
                        {isArabic
                          ? "نلتزم بإبلاغك بنتيجة الطلب خلال 72 ساعة"
                          : "We’ll get back to you within 72 hours"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          {isArabic
                            ? "قد نطلب صورًا أو فيديو يوضح حالة المنتج قبل الموافقة"
                            : "We might request photos or videos before approving the return."}
                        </p>
                        <p>
                          {isArabic
                            ? "تأكد أن جميع الملحقات متوفرة لضمان سرعة الاسترجاع"
                            : "Ensure every accessory is included for a faster refund."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4">
                    <Checkbox
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <div className="space-y-1 text-sm">
                      <Label htmlFor="termsAccepted" className="font-medium">
                        {isArabic ? "أوافق على الشروط والأحكام" : "I agree to the terms"}
                      </Label>
                      <p className="text-muted-foreground">
                        {isArabic
                          ? "بتأكيدك، فأنت توافق على سياسة الإرجاع الخاصة بالمتجر"
                          : "By checking this you confirm our return & refund policy"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`flex flex-col gap-3 border-t pt-4 sm:flex-row ${isArabic ? "sm:flex-row-reverse" : ""}`}>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`${isArabic ? "flex-row-reverse" : ""} gap-1`}
                >
                  {isArabic ? (
                    <>
                      <span>السابق</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Back</span>
                    </>
                  )}
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={handleNext} className={`${isArabic ? "flex-row-reverse" : ""} gap-1`}>
                    {isArabic ? (
                      <>
                        <span>التالي</span>
                        <ChevronLeft className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!formData.termsAccepted || isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isArabic ? "جاري الإرسال" : "Submitting"}
                      </>
                    ) : (
                      <span>{isArabic ? "إرسال الطلب" : "Submit request"}</span>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

type StepCardProps = {
  icon: React.ReactNode
  label: string
  index: number
  state: "pending" | "current" | "done"
}

function StepCard({ icon, label, index, state }: StepCardProps) {
  const palette = {
    done: "bg-primary text-primary-foreground",
    current: "border border-primary/50 bg-primary/10 text-primary",
    pending: "border border-muted bg-background text-muted-foreground",
  }

  const stateClasses = palette[state]

  return (
    <div className={`rounded-2xl p-3 ${state === "pending" ? "bg-muted/40" : ""}`}>
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${stateClasses}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background/20 text-base font-semibold">
          {index}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
      </div>
    </div>
  )
}

const BadgePill = ({ label }: { label: string }) => (
  <span className="rounded-full border border-primary/30 bg-background/80 px-4 py-1 text-xs font-semibold">
    {label}
  </span>
)