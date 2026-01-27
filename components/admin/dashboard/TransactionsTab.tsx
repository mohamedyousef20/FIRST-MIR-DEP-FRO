import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/pagination-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Transaction {
  _id: string;
  amount: number;
  type: "credit" | "debit";
  balanceAfter: number;
  source: string;
  status: "pending" | "completed" | "failed";
  note?: string;
  createdAt: string;
  seller?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface TransactionsTabProps {
  transactions: Transaction[];
  sellers: any[];
  isArabic: boolean;
  transactionsLoading: boolean;
  transactionFilters: { type: "all" | "credit" | "debit"; sellerId: string };
  setTransactionFilters: (filters: { type: "all" | "credit" | "debit"; sellerId: string }) => void;
  transactionsPage: number;
  setTransactionsPage: (page: number) => void;
  transactionsPages: number;
  fetchAdminTransactions: () => Promise<void>;
}

export function TransactionsTab({
  transactions,
  sellers,
  isArabic,
  transactionsLoading,
  transactionFilters,
  setTransactionFilters,
  transactionsPage,
  setTransactionsPage,
  transactionsPages,
  fetchAdminTransactions,
}: TransactionsTabProps) {
  const handleTypeChange = (value: "all" | "credit" | "debit") => {
    setTransactionsPage(1);
    setTransactionFilters({
      ...transactionFilters,
      type: value,
    });
  };

  const handleSellerChange = (value: string) => {
    setTransactionsPage(1);
    setTransactionFilters({
      ...transactionFilters,
      sellerId: value,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{isArabic ? "معاملات البائعين" : "Seller Financial Transactions"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "راقب جميع عمليات الإيداع والسحب ومصادرها وحالتها."
              : "Monitor all credits, debits, and their sources in real time."}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={transactionFilters.type} onValueChange={value => handleTypeChange(value as "all" | "credit" | "debit")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={isArabic ? "نوع العملية" : "Type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
              <SelectItem value="credit">{isArabic ? "إيداعات" : "Credits"}</SelectItem>
              <SelectItem value="debit">{isArabic ? "سحوبات" : "Debits"}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={transactionFilters.sellerId} onValueChange={handleSellerChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={isArabic ? "البائع" : "Seller"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">{isArabic ? "جميع البائعين" : "All sellers"}</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller._id} value={seller._id}>
                  {(seller.firstName || seller.name) ?? seller.email} {seller.lastName ?? ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchAdminTransactions} disabled={transactionsLoading}>
            {transactionsLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isArabic ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{isArabic ? "البائع" : "Seller"}</TableHead>
                <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                <TableHead>{isArabic ? "المصدر" : "Source"}</TableHead>
                <TableHead>{isArabic ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{isArabic ? "الرصيد بعد العملية" : "Balance After"}</TableHead>
                <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isArabic ? "جاري تحميل البيانات..." : "Loading transactions..."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    {isArabic ? "لا توجد معاملات تطابق الفلاتر الحالية" : "No transactions match the current filters"}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn._id}>
                    <TableCell>#{txn._id.slice(-6)}</TableCell>
                    <TableCell>
                      {txn.seller
                        ? `${txn.seller.firstName ?? ""} ${txn.seller.lastName ?? ""}`.trim() || txn.seller.email
                        : isArabic ? "غير محدد" : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={txn.type === "credit" ? "secondary" : "outline"}>
                        {txn.type === "credit" ? (isArabic ? "إيداع" : "Credit") : (isArabic ? "سحب" : "Debit")}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{txn.source || (isArabic ? "غير معروف" : "Unknown")}</TableCell>
                    <TableCell className={`font-semibold ${txn.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                      {txn.type === "credit" ? "+" : "-"}
                      {txn.amount.toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                    </TableCell>
                    <TableCell>
                      {txn.balanceAfter?.toFixed(2)} {isArabic ? "ج.م" : "EGP"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          txn.status === "completed"
                            ? "default"
                            : txn.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {txn.status === "completed"
                          ? (isArabic ? "مكتملة" : "Completed")
                          : txn.status === "pending"
                            ? (isArabic ? "معلقة" : "Pending")
                            : (isArabic ? "فاشلة" : "Failed")}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(txn.createdAt).toLocaleString(isArabic ? "ar-EG" : "en-US")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {transactions.length > 0 && (
          <PaginationControls
            currentPage={transactionsPage}
            totalPages={transactionsPages}
            onPageChange={setTransactionsPage}
            className="justify-end pt-4"
          />
        )}
      </CardContent>
    </Card>
  );
}
