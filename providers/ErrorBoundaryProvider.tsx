"use client";

import { ErrorBoundary } from "react-error-boundary";
import React from "react";
import logError from "@/utils/logError";

interface Props {
  children: React.ReactNode;
}

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">حدث خطأ غير متوقع</h2>
      <p className="text-sm text-muted-foreground mb-4">
        نعتذر عن الإزعاج. تم تسجيل الخطأ وسيتم النظر فيه.
      </p>
      <button
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
        onClick={() => window.location.reload()}
      >
        إعادة تحميل الصفحة
      </button>
    </div>
  );
}

export default function ErrorBoundaryProvider({ children }: Props) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      {children}
    </ErrorBoundary>
  );
}
