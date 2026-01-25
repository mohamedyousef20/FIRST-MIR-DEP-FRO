"use client";

import axios from "axios";

interface ErrorInfo {
  componentStack?: string;
}

/**
 * Send captured error to a monitoring endpoint.
 * Replace the endpoint or extend with Sentry/LogRocket as needed.
 */
export default function logError(error: Error, info?: ErrorInfo) {
  try {
    const payload = {
      message: error.message,
      stack: error.stack,
      componentStack: info?.componentStack,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };

    // Send to backend log endpoint (implement on server)
    axios.post("/api/logs/error", payload).catch(() => {
      /* silent fail */
    });
  } catch (_) {
    // Ignore logging failures to avoid infinite loops
  }
}
