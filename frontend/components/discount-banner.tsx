"use client"

// Temporary placeholder banner: currently Arabic-only, update design later
export function DiscountBanner() {
  return null;
}

// import Link from "next/link"
// import { useLanguage } from "@/components/language-provider";
// import { Button } from "@/components/ui/button"

// export function DiscountBanner() {
//   const { language } = useLanguage()

//   return (
//     <section className="py-8">
//       <div className="rounded-lg overflow-hidden">
//         <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12">
//           <div className="container mx-auto">
//             <div className="max-w-lg space-y-4">
//               <h2 className="text-2xl md:text-3xl font-bold">
//                 {language === "ar" ? "خصم 30% على جميع الكوتشيات الميرور" : "30% Off All Mirror Sneakers"}
//               </h2>
//               <p className="text-primary-foreground/90">
//                 {language === "ar"
//                   ? "استخدم كود الخصم MIRROR30 عند الدفع واحصل على خصم 30% على جميع الكوتشيات الميرور. العرض ساري حتى نفاذ الكمية."
//                   : "Use coupon code MIRROR30 at checkout and get 30% off all mirror sneakers. Offer valid while supplies last."}
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Button size="lg" variant="secondary" asChild>
//                   <Link href="/products?category=shoes">{language === "ar" ? "تسوق الآن" : "Shop Now"}</Link>
//                 </Button>
//                 <Button
//                   size="lg"
//                   variant="outline"
//                   className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
//                 >
//                   {language === "ar" ? "معرفة المزيد" : "Learn More"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }
