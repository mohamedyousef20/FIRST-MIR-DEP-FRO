"use client";

import { useEffect, useState } from "react";
import { complaintService } from "@/lib/api";
import { useLanguage } from "@/components/language-provider";
import { Loader2, Trash2 } from "lucide-react";
import PaginationControls from "@/components/pagination-controls";
import { toast } from "sonner";

interface Complaint {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export function ComplaintsTab() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await complaintService.getAllComplaintsAdmin({ page, limit });
      setComplaints(res.data?.data || []);
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setPage(res.data.pagination.currentPage || page);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || (isArabic ? "فشل جلب الشكاوى" : "Failed to fetch complaints");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const statuses: Array<{ value: 'open' | 'in_progress' | 'resolved'; labelAr: string; labelEn: string }> = [
    { value: 'open', labelAr: 'مفتوحة', labelEn: 'Open' },
    { value: 'in_progress', labelAr: 'قيد المعالجة', labelEn: 'In Progress' },
    { value: 'resolved', labelAr: 'مغلقة', labelEn: 'Resolved' },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? 'هل تريد حذف الشكوى؟' : 'Delete complaint?')) return;
    try {
      await complaintService.deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      toast.success(isArabic ? 'تم الحذف' : 'Deleted');
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isArabic ? 'فشل الحذف' : 'Delete failed');
      toast.error(msg);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    try {
      await complaintService.updateComplaintStatus(id, newStatus);
      setComplaints((prev) => prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)));
      toast.success(isArabic ? 'تم تحديث الحالة' : 'Status updated');
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isArabic ? 'فشل التحديث' : 'Update failed');
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-destructive text-center py-6">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-right">
                <th className="p-2">{isArabic ? "العنوان" : "Title"}</th>
                <th className="p-2">{isArabic ? "الحالة" : "Status"}</th>
                <th className="p-2">{isArabic ? "المستخدم" : "User"}</th>
                <th className="p-2">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="border-b text-right">
                  <td className="p-2 max-w-xs truncate" title={c.title}>{c.title}</td>
                  <td className="p-2">
                    <select
                      className="bg-transparent border rounded p-1 text-sm"
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value as any)}
                    >
                      {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {isArabic ? s.labelAr : s.labelEn}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    {c.user?.email || `${c.user?.firstName || ""} ${c.user?.lastName || ""}`}
                  </td>
                  <td className="p-2">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-destructive hover:opacity-80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {complaints.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="justify-end pt-4"
        />
      )}
    </div>
  );
}
