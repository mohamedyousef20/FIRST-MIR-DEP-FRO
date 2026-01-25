"use client"

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { complaintService } from "@/lib/api";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    Image as ImageIcon,
    Loader2,
    UploadCloud,
    Trash2,
} from "lucide-react";

type UploadStatus = "idle" | "error";

const MAX_FILES = 5;

export default function NewComplaintPage() {
    const router = useRouter();
    const [orderId, setOrderId] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setOrderId("");
        setTitle("");
        setMessage("");
        setImageUrls([]);
        setStatus("idle");
        setError(null);
    };

    const handleAddImage = (url: string) => {
        if (imageUrls.length >= MAX_FILES) {
            setStatus("error");
            setError(`يمكن رفع ${MAX_FILES} صور كحد أقصى`);
            return;
        }
        setImageUrls((prev) => [...prev, url]);
        setStatus("idle");
        setError(null);
    };

    const removeImage = (idx: number) => {
        setImageUrls((prev) => prev.filter((_, i) => i !== idx));
    };
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!title.trim() || !message.trim()) {
            setStatus("error");
            setError("الرجاء إدخال عنوان الشكوى وتفاصيلها");
            return;
        }

        const payload = {
            title: title.trim(),
            message: message.trim(),
            ...(orderId.trim() && { orderId: orderId.trim() }),
            images: imageUrls ?? [],
        };

        try {
            setSubmitting(true);
            setError(null);
            setStatus("idle");

            await complaintService.createComplaint(payload);

            toast.success("تم إرسال الشكوى بنجاح", { icon: "✅" });

            resetForm();
            router.push("/complaints");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message || "حدث خطأ أثناء إرسال الشكوى";
            setStatus("error");
            setError(msg);
            toast.error(msg, { icon: "⚠️" });
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10" dir="rtl">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <FileText className="h-4 w-4" />
                            نموذج الشكوى
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            تقديم شكوى جديدة
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                            شاركنا تفاصيل المشكلة التي تواجهها مع ذكر أي معلومات إضافية مثل رقم الطلب أو صور توضيحية، وسيتواصل معك فريق الدعم في أقرب وقت.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/complaints")}
                        className="self-start inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 border border-blue-200 rounded-xl shadow-sm hover:bg-blue-50 transition"
                    >
                        <ArrowRight className="h-4 w-4" />
                        العودة لقائمة الشكاوى
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">عنوان الشكوى *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="مثال: مشكلة في استلام الطلب أو وجود ضرر في المنتج"
                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">رقم الطلب (اختياري)</label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(event) => setOrderId(event.target.value)}
                                placeholder="أدخل رقم الطلب المرتبط بالمشكلة إن وجد"
                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">تفاصيل الشكوى *</label>
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="يرجى شرح المشكلة بالتفصيل مع ذكر أي ملاحظات تساعد فريق الدعم على معالجتها"
                            rows={6}
                            className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition resize-none"
                            required
                        />
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            سيتم إرسال نسخة من الشكوى إلى بريدك الإلكتروني عند نجاح العملية.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <UploadCloud className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">مرفقات داعمة (اختياري)</p>
                                <p className="text-sm text-gray-500">يمكن رفع حتى {MAX_FILES} صور بصيغ JPG أو PNG أو WEBP</p>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                                <ImageUploader onUpload={handleAddImage} className="h-full" />
                            </div>

                            {imageUrls.length > 0 && (
                                <div className="flex-1 bg-white border border-blue-100 rounded-2xl p-4 space-y-3 max-h-56 overflow-y-auto">
                                    <p className="text-sm font-semibold text-gray-700">
                                        الصور ({imageUrls.length}/{MAX_FILES})
                                    </p>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        {imageUrls.map((url, idx) => (
                                            <li
                                                key={url}
                                                className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ImageIcon className="h-4 w-4 text-blue-500" />
                                                    <div className="truncate max-w-[160px]">
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-blue-600 hover:underline truncate"
                                                        >
                                                            {url.split("/").pop()}
                                                        </a>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="text-xs text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    إرسال الشكوى
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}