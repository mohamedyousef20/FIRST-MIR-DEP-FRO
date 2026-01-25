import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import PaginationControls from "@/components/pagination-controls";

interface AnalyticsTabProps {
  analytics: {
    ordersPerDay: Array<{ _id: string; count: number }>;
    topSellingProducts: Array<{ _id: string; title: string; sold: number; ratingsAverage?: number; seller?: { firstName?: string; lastName?: string } }>;
    highestRatedProducts: Array<{ _id: string; title: string; ratingsAverage: number; sold?: number; seller?: { firstName?: string; lastName?: string } }>;
    avgPreparationTime: number;
    satisfactionScore: number;
  } | null;
  analyticsLoading: boolean;
  analyticsError: string | null;
  fetchAdminAnalytics: () => Promise<void>;
  isArabic: boolean;
}

const PAGE_LIMIT = 10;

export function AnalyticsTab({
  analytics,
  analyticsLoading,
  analyticsError,
  fetchAdminAnalytics,
  isArabic
}: AnalyticsTabProps) {
  // Local pagination state
  const [sellingPage, setSellingPage] = useState(1);
  const [sellingPages, setSellingPages] = useState(1);
  const [ratedPage, setRatedPage] = useState(1);
  const [ratedPages, setRatedPages] = useState(1);

  useEffect(() => {
    if (analytics) {
      setSellingPages(Math.max(1, Math.ceil((analytics.topSellingProducts?.length ?? 0) / PAGE_LIMIT)));
      setRatedPages(Math.max(1, Math.ceil((analytics.highestRatedProducts?.length ?? 0) / PAGE_LIMIT)));
      setSellingPage(1);
      setRatedPage(1);
    }
  }, [analytics]);

  const sellingSlice = analytics?.topSellingProducts?.slice((sellingPage - 1) * PAGE_LIMIT, sellingPage * PAGE_LIMIT) || [];
  const ratedSlice = analytics?.highestRatedProducts?.slice((ratedPage - 1) * PAGE_LIMIT, ratedPage * PAGE_LIMIT) || [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{isArabic ? "تحليلات الأداء" : "Performance Analytics"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "نظرة شاملة على الطلبات، أعلى المنتجات، رضا العملاء، ومتوسط التجهيز عبر المنصة كلها."
              : "Cross-platform insight into orders, top products, customer satisfaction, and preparation speed."}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAdminAnalytics} disabled={analyticsLoading}>
          {analyticsLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isArabic ? "تحديث البيانات" : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {analyticsLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isArabic ? "جاري تحميل بيانات التحليلات..." : "Loading analytics data..."}
          </div>
        )}

        {analyticsError && (
          <p className="text-sm text-destructive">{analyticsError}</p>
        )}

        {!analyticsLoading && !analytics && !analyticsError && (
          <p className="text-sm text-muted-foreground">
            {isArabic ? "لا يوجد بيانات متاحة حالياً." : "No analytics data available yet."}
          </p>
        )}

        {analytics && !analyticsLoading && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  key: "avgPrep",
                  label: isArabic ? "متوسط زمن التجهيز (ساعات)" : "Avg preparation (hrs)",
                  value: analytics.avgPreparationTime?.toFixed(1)
                },
                {
                  key: "satisfaction",
                  label: isArabic ? "رضا العملاء" : "Satisfaction score",
                  value: analytics.satisfactionScore?.toFixed(2)
                },
                {
                  key: "topSellers",
                  label: isArabic ? "عدد المنتجات الأعلى مبيعاً" : "Top sellers tracked",
                  value: (analytics.topSellingProducts?.length ?? 0)
                },
                {
                  key: "topRated",
                  label: isArabic ? "عدد المنتجات الأعلى تقييماً" : "Top rated tracked",
                  value: (analytics.highestRatedProducts?.length ?? 0)
                }
              ].map((metric) => (
                <Card key={metric.key} className="bg-muted/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">{metric.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{metric.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{isArabic ? "عدد الطلبات آخر 30 يوم" : "Orders in last 30 days"}</h3>
                <div className="space-y-1 max-h-72 overflow-y-auto pr-2">
                  {(analytics.ordersPerDay?.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">{isArabic ? "لا يوجد بيانات" : "No data"}</p>
                  ) : (
                    (analytics.ordersPerDay ?? []).map((day) => (
                      <div key={day._id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>{day._id}</span>
                        <span className="font-medium">{day.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">{isArabic ? "المنتجات الأعلى مبيعاً" : "Top selling products"}</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {(analytics.topSellingProducts?.length ?? 0) === 0 ? (
                      <p className="text-sm text-muted-foreground">{isArabic ? "لا يوجد بيانات" : "No data"}</p>
                    ) : (
                      sellingSlice.map((product) => (
                        <div key={product._id} className="rounded-md border p-3 text-sm">
                          <p className="font-semibold truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {isArabic ? "البائع" : "Seller"}: {product.seller ? `${product.seller.firstName ?? ""} ${product.seller.lastName ?? ""}`.trim() : (isArabic ? "غير معروف" : "Unknown")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isArabic ? "المبيعات" : "Sold"}: {product.sold}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">{isArabic ? "المنتجات الأعلى تقييماً" : "Top rated products"}</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {(analytics.highestRatedProducts?.length ?? 0) === 0 ? (
                      <p className="text-sm text-muted-foreground">{isArabic ? "لا يوجد بيانات" : "No data"}</p>
                    ) : (
                      ratedSlice.map((product) => (
                        <div key={product._id} className="rounded-md border p-3 text-sm">
                          <p className="font-semibold truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {isArabic ? "البائع" : "Seller"}: {product.seller ? `${product.seller.firstName ?? ""} ${product.seller.lastName ?? ""}`.trim() : (isArabic ? "غير معروف" : "Unknown")}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500" />
                            {product.ratingsAverage?.toFixed(2)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
