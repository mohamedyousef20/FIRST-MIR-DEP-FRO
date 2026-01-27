"use client"

import { useState, useRef, useCallback } from "react"
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onUpload: (url: string) => void
  maxSizeMb?: number
  className?: string
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", ,"image/png", "image/webp"]

export default function ImageUploader({ onUpload, maxSizeMb = 5, className }: ImageUploaderProps) {
  const { language } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const copy = language === "ar"
    ? {
      title: "اسحب وأفلت الصورة هنا",
      subtitle: "أو اضغط لاختيار صورة بدقة عالية",
      note: `الصيغ المسموح بها JPG و PNG و WEBP بحد أقصى ${maxSizeMb} ميجابايت`,
      uploading: "جاري الرفع",
      success: "تم الرفع بنجاح",
      errorType: "يُسمح فقط بصيغ JPG أو PNG أو WEBP",
      errorSize: `حجم الصورة يجب ألا يتجاوز ${maxSizeMb} ميجابايت`,
      errorGeneric: "فشل الرفع. يرجى المحاولة مرة أخرى",
      previewLabel: "معاينة آخر صورة مرفوعة",
    }
    : {
      title: "Drag & drop image",
      subtitle: "or click to choose a high-resolution file",
      note: `Allowed types: JPG, PNG, WEBP up to ${maxSizeMb}MB`,
      uploading: "Uploading",
      success: "Uploaded successfully",
      errorType: "Only JPG, PNG or WEBP files are allowed",
      errorSize: `Image size must not exceed ${maxSizeMb}MB`,
      errorGeneric: "Upload failed. Please try again",
      previewLabel: "Preview of the latest upload",
    }

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      throw new Error("type")
    }
    const maxBytes = maxSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      throw new Error("size")
    }
  }

  const uploadToCloudinary = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "mirvory_upload")
      formData.append("folder", "mirvory")

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dkmrrisek/image/upload")

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded * 100) / event.total))
        }
      })

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          //console.log(response,'rss')
          resolve(response?.secure_url as string)
        } else {
          reject(new Error("upload-error"))
        }
      }

      xhr.onerror = () => reject(new Error("upload-error"))
      xhr.send(formData)
    })
  }

  const handleFile = useCallback(
    async (file?: File) => {
      if (!file) return
      try {
        validateFile(file)
        setError(null)
        setStatus("idle")
        setLoading(true)
        setProgress(0)

        const uploadedUrl = await uploadToCloudinary(file)
        onUpload(uploadedUrl)
        setPreview(uploadedUrl)
        setStatus("success")
      } catch (err) {
        const message = err instanceof Error ? err.message : "upload-error"
        setStatus("error")
        if (message === "type") {
          setError(copy.errorType)
        } else if (message === "size") {
          setError(copy.errorSize)
        } else {
          setError(copy.errorGeneric)
        }
        // Reset file input on error
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } finally {
        setLoading(false)
        setProgress(0)
      }
    },
    [copy.errorGeneric, copy.errorSize, copy.errorType, onUpload]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    handleFile(file)
    event.target.value = ""
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleFile(file)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    // Only deactivate if leaving the container, not entering a child
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setDragActive(false)
  }

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className={cn("space-y-3", className)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={loading}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label={copy.title}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        onDragEnter={() => setDragActive(true)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30",
          loading && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {status === "success" ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : status === "error" ? (
            <AlertCircle className="h-7 w-7 text-destructive" />
          ) : loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <UploadCloud className="h-7 w-7" />
          )}
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-base font-semibold text-foreground">{copy.title}</p>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 rounded-full border border-primary/50 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-primary/5"
          disabled={loading}
        >
          {language === "ar" ? "اختيار ملف" : "Choose file"}
        </button>
        <p className="mt-3 text-xs text-muted-foreground">{copy.note}</p>
        {loading && (
          <div className="mt-4 w-full max-w-md">
            <p className="text-xs font-medium text-primary">{copy.uploading} {progress}%</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {preview && (
        <div className="rounded-2xl border bg-white p-4">
          <p className="mb-3 text-sm font-medium text-foreground">{copy.previewLabel}</p>
          <img
            src={preview}
            alt={copy.previewLabel}
            className="h-48 w-full rounded-xl object-cover"
          />
        </div>
      )}
    </div>
  )
}