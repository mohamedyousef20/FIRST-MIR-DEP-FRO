"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { OverviewTab } from "./OverviewTab";
import { OrdersTab } from "./OrdersTab";
import { ProductsTab } from "./ProductsTab";
import { CategoriesTab } from "./CategoriesTab";
import { VendorsTab } from "./VendorsTab";
import { BrandsTab } from "./BrandsTab";
import { UsersTab } from "./UsersTab";
import { AnnouncementsTab } from "./AnnouncementsTab";
import { PickupPointsTab } from "./PickupPointsTab";
import { ReturnsTab } from "./ReturnsTab";
import { ComplaintsTab } from "./ComplaintsTab";
import { CouponsTab } from "./CouponsTab";
import { TransactionsTab } from "./TransactionsTab";
import { AnalyticsTab } from "./AnalyticsTab";
import Link from "next/link";

export function AdminDashboard() {
  const {
    // State
    activeTab,
    setActiveTab,
    updatingUser,
    handleDeleteUser,
    handleSoftDeleteUser,
    handleRestoreUser,
    handleToggleTrustSeller,
    products,
    productsPage,
    productsPages,
    setProductsPage,
    coupons,
    loadingProducts,
    errorProducts,
    categories,
    brands,
    loadingBrands,
    errorBrands,
    loading,
    error,
    announcementImage,
    imageUrl,
    setImageUrl,
    isAuthenticated,
    isAdmin,
    sellers,
    sellersPage,
    sellersPages,
    setSellersPage,
    orders,
    ordersPage,
    ordersPages,
    setOrdersPage,
    loadingOrders,
    errorOrders,
    pickupPoints,
    users,
    usersPage,
    usersPages,
    setUsersPage,
    returnsPage,
    returnsPages,
    setReturnsPage,
    loadingPickupPoints,
    announcements,
    loadingAnnouncements,
    errorAnnouncements,
    returnRequests,
    loadingReturns,
    errorReturns,
    platformEarnings,
    loadingEarnings,
    errorEarnings,
    dashboardCounters,
    transactions,
    transactionsLoading,
    transactionFilters,
    setTransactionFilters,
    transactionsPage,
    setTransactionsPage,
    transactionsPages,
    analytics,
    analyticsLoading,
    analyticsError,

    // Coupon states
    showAddCoupon,
    setShowAddCoupon,
    editingCoupon,
    setEditingCoupon,
    newCoupon,
    setNewCoupon,

    // Form states
    newCategory,
    setNewCategory,
    isCreating,
    setIsCreating,
    showSpinner,
    editingCategory,
    setEditingCategory,
    showAddPickupPoint,
    setShowAddPickupPoint,
    selectedPickupPoint,
    setSelectedPickupPoint,
    showAddAnnouncement,
    setShowAddAnnouncement,
    selectedAnnouncement,
    setSelectedAnnouncement,
    newAnnouncement,
    setNewAnnouncement,

    // Functions
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleApproveProduct,
    handleRejectProduct,
    handleSaveAnnouncement,
    handleDeleteAnnouncement,
    handleSubmitPickupPoint,
    handleDeletePickupPoint,
    handleImageUpload,
    handleRemoveImage,
    handleDeleteBrand,
    handleApproveReturn,
    handleDeleteReturn,
    handleRejectReturn,
    handleProcessReturn,
    handleFinishedReturn,
    handleToggleCouponStatus,
    updateDeliveryStatus,
    updatePaymentStatus,
    orderComplete,

    // Coupon functions
    handleCreateCoupon,
    handleUpdateCoupon,
    handleGetCoupon,
    handleGetCouponStats,
    handleCouponInputChange,
    handleEditCoupon,
    handleAddCoupon,
    handleCloseCouponForm,
    handleDeleteCoupon,

    // Data fetching functions
    fetchProducts,
    fetchCategories,
    fetchBrands,
    fetchCoupons,
    fetchOrders,
    fetchPickupPoints,
    fetchAnnouncements,
    fetchReturnRequests,
    fetchPlatformEarnings,
    fetchDashboardCounters,
    fetchAdminTransactions,
    fetchAdminAnalytics,

    // Language
    language,
    t,
    isArabic
  } = useAdminDashboard();

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive mb-4">
            {isArabic ? "غير مصرح بالوصول" : "Access Denied"}
          </div>
          <p className="text-muted-foreground mb-4">
            {isArabic
              ? "ليس لديك الصلاحيات اللازمة للوصول إلى لوحة التحكم الإدارية."
              : "You don't have permission to access the admin dashboard."}
          </p>
          <Button onClick={() => window.history.back()}>
            {isArabic ? "العودة" : "Go Back"}
          </Button>
        </div>
      </div>
    );
  }
    
  return (
    <div className="max-w-screen-2xl w-full px-4 py-6 md:py-12 mx-auto" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("adminDashboard")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? "مرحبًا بك في لوحة تحكم المدير، يمكنك إدارة المنصة من هنا."
              : "Welcome to the admin dashboard, manage your platform from here."}
          </p>
        </div>
        <Link href="/admin/notifications">
          <Button>
            {isArabic ? "إرسال إشعارات" : "Send Notifications"}
          </Button>
        </Link>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="flex overflow-x-auto whitespace-nowrap space-x-2 p-1">
          <TabsTrigger value="overview">{isArabic ? "نظرة عامة" : "Overview"}</TabsTrigger>
          <TabsTrigger value="vendors">{isArabic ? "البائعين" : "Vendors"}</TabsTrigger>
          <TabsTrigger value="users">{isArabic ? "المستخدمين" : "Users"}</TabsTrigger>
          <TabsTrigger value="products">{t("products")}</TabsTrigger>
          <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
          <TabsTrigger value="brands">{isArabic ? "الماركات" : "Brands"}</TabsTrigger>
          <TabsTrigger value="categories">{isArabic ? "التصنيفات" : "Categories"}</TabsTrigger>
          <TabsTrigger value="coupons">{isArabic ? "الكوبونات" : "Coupons"}</TabsTrigger>
          <TabsTrigger value="announcements">{isArabic ? "الإعلانات" : "Announcements"}</TabsTrigger>
          <TabsTrigger value="pickup">{isArabic ? "نقاط الاستلام" : "Pickup"}</TabsTrigger>
          <TabsTrigger value="complaints">{isArabic ? "الشكاوى" : "Complaints"}</TabsTrigger>
          <TabsTrigger value="returns">{isArabic ? "طلبات الإرجاع" : "Returns"}</TabsTrigger>
          <TabsTrigger value="analytics">{isArabic ? "التحليلات" : "Analytics"}</TabsTrigger>
          <TabsTrigger value="transactions">{isArabic ? "المعاملات" : "Transactions"}</TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="overview">
          <OverviewTab
            orders={orders}
            products={products}
            sellers={sellers}
            users={users}
            platformEarnings={platformEarnings}
            loadingEarnings={loadingEarnings}
            errorEarnings={errorEarnings}
            isArabic={isArabic}
            dashboardCounters={dashboardCounters || undefined}
            fetchPlatformEarnings={fetchPlatformEarnings}
            fetchDashboardCounters={fetchDashboardCounters}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab
            orders={orders}
            loadingOrders={loadingOrders}
            errorOrders={errorOrders}
            isArabic={isArabic}
            pagination={{ currentPage: ordersPage, totalPages: ordersPages }}
            onPageChange={setOrdersPage}
            updateDeliveryStatus={updateDeliveryStatus}
            updatePaymentStatus={updatePaymentStatus}
            orderComplete={orderComplete}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab
            products={products}
            loadingProducts={loadingProducts}
            errorProducts={errorProducts}
            isArabic={isArabic}
            pagination={{ currentPage: productsPage, totalPages: productsPages }}
            onPageChange={setProductsPage}
            handleApproveProduct={handleApproveProduct}
            handleRejectProduct={handleRejectProduct}
          />
        </TabsContent>

        <TabsContent value="brands">
          <BrandsTab
            brands={brands}
            loading={loadingBrands}
            error={errorBrands}
            isArabic={isArabic}
            handleDeleteBrand={handleDeleteBrand}
            refreshBrands={fetchBrands}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab
            categories={categories}
            loading={loading}
            error={error}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            handleCreateCategory={handleCreateCategory}
            handleEditCategory={handleEditCategory}
            handleDeleteCategory={handleDeleteCategory}
            isArabic={isArabic}
            showSpinner={showSpinner}
            fetchCategories={fetchCategories}
          />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsTab
            sellers={sellers}
            isArabic={isArabic}
            updatingUserId={updatingUser}
            pagination={{ currentPage: sellersPage, totalPages: sellersPages }}
            onPageChange={setSellersPage}
            onDelete={handleDeleteUser}
            onSoftDelete={handleSoftDeleteUser}
            onRestore={handleRestoreUser}
            onToggleTrust={handleToggleTrustSeller}
          />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab
            users={users}
            isArabic={isArabic}
            updatingUserId={updatingUser}
            pagination={{ currentPage: usersPage, totalPages: usersPages }}
            onPageChange={setUsersPage}
            onDelete={handleDeleteUser}
            onSoftDelete={handleSoftDeleteUser}
            onRestore={handleRestoreUser}
          />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponsTab
            coupons={coupons}
            isArabic={isArabic}
            handleDeleteCoupon={handleDeleteCoupon}
            onToggleStatus={handleToggleCouponStatus}
            showAddCoupon={showAddCoupon}
            setShowAddCoupon={setShowAddCoupon}
            editingCoupon={editingCoupon}
            setEditingCoupon={setEditingCoupon}
            newCoupon={newCoupon}
            setNewCoupon={setNewCoupon}
            handleCreateCoupon={handleCreateCoupon}
            handleUpdateCoupon={handleUpdateCoupon}
            handleCouponInputChange={handleCouponInputChange}
            handleEditCoupon={handleEditCoupon}
            handleAddCoupon={handleAddCoupon}
            handleCloseCouponForm={handleCloseCouponForm}
            fetchCoupons={fetchCoupons}
          />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsTab
            announcements={announcements}
            loadingAnnouncements={loadingAnnouncements}
            errorAnnouncements={errorAnnouncements}
            showAddAnnouncement={showAddAnnouncement}
            setShowAddAnnouncement={setShowAddAnnouncement}
            selectedAnnouncement={selectedAnnouncement}
            setSelectedAnnouncement={setSelectedAnnouncement}
            newAnnouncement={newAnnouncement}
            setNewAnnouncement={setNewAnnouncement}
            announcementImage={announcementImage}
            handleSaveAnnouncement={handleSaveAnnouncement}
            handleDeleteAnnouncement={handleDeleteAnnouncement}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            isArabic={isArabic}
            fetchAnnouncements={fetchAnnouncements}
          />
        </TabsContent>

        <TabsContent value="pickup">
          <PickupPointsTab
            sellers={sellers}
            pickupPoints={pickupPoints}
            loadingPickupPoints={loadingPickupPoints}
            showAddPickupPoint={showAddPickupPoint}
            setShowAddPickupPoint={setShowAddPickupPoint}
            selectedPickupPoint={selectedPickupPoint}
            setSelectedPickupPoint={setSelectedPickupPoint}
            handleSubmitPickupPoint={handleSubmitPickupPoint}
            handleDeletePickupPoint={handleDeletePickupPoint}
            isArabic={isArabic}
            fetchPickupPoints={fetchPickupPoints}
          />
        </TabsContent>

        <TabsContent value="complaints">
          <ComplaintsTab />
        </TabsContent>

        <TabsContent value="returns">
          <ReturnsTab
            returnRequests={returnRequests}
            loadingReturns={loadingReturns}
            errorReturns={errorReturns}
            pagination={{ currentPage: returnsPage, totalPages: returnsPages }}
            onPageChange={setReturnsPage}
            isArabic={isArabic}
            handleApproveReturn={handleApproveReturn}
            handleDeleteReturn={handleDeleteReturn}
            handleRejectReturn={handleRejectReturn}
            handleProcessReturn={handleProcessReturn}
            handleFinishedReturn={handleFinishedReturn}
            fetchReturnRequests={fetchReturnRequests}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
            fetchAdminAnalytics={fetchAdminAnalytics}
            isArabic={isArabic}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab
            transactions={transactions}
            sellers={sellers}
            isArabic={isArabic}
            transactionsLoading={transactionsLoading}
            transactionFilters={transactionFilters}
            setTransactionFilters={setTransactionFilters}
            transactionsPage={transactionsPage}
            setTransactionsPage={setTransactionsPage}
            transactionsPages={transactionsPages}
            fetchAdminTransactions={fetchAdminTransactions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}