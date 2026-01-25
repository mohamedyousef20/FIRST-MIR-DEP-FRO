import * as React from 'react';

interface ToastBase {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastWithAction extends ToastBase {
  action: {
    label: string;
    onClick: () => void;
  };
}

type Toast = ToastBase | ToastWithAction;

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id } as Toast]);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({
      toasts,
      toast,
      dismissToast,
    }),
    [toasts, toast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-md shadow-lg ${
              toast.variant === 'destructive' ? 'bg-red-500' : 'bg-green-500'
            } text-white relative`}
          >
            <div className="font-medium">{toast.title}</div>
            {toast.description && (
              <div className="text-sm">{toast.description}</div>
            )}
            {'action' in toast && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  dismissToast(toast.id);
                }}
                className="mt-2 text-sm font-medium underline"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="absolute top-1 right-2 text-sm"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
