// frontend/components/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // You can also send to error reporting service here
        // logErrorToService(error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            // Use custom fallback or default
            return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

// Default error fallback component
const DefaultErrorFallback = ({ error }: { error?: Error }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600 text-lg font-semibold mb-2">
            Something went wrong
        </div>
        <p className="text-gray-600 text-sm mb-4 text-center">
            We apologize for the inconvenience. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
            <details className="text-xs text-gray-500 bg-white p-3 rounded border max-w-full overflow-auto">
                <summary className="cursor-pointer mb-2">Error Details (Development)</summary>
                <pre>{error.stack}</pre>
            </details>
        )}
        <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
            Reload Page
        </button>
    </div>
);