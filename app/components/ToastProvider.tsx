"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return ctx;
}

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4500;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    ({ message, variant }: Omit<Toast, "id">) => {
      setToasts((prev) => {
        const id = crypto.randomUUID();
        const next = [...prev, { id, message, variant }].slice(-MAX_TOASTS);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    toasts.forEach((toast) => {
      if (timers.current[toast.id]) {
        return;
      }
      const timeout = setTimeout(() => {
        dismissToast(toast.id);
      }, AUTO_DISMISS_MS);
      timers.current[toast.id] = timeout;
    });
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, [dismissToast, toasts]);

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [dismissToast, showToast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

type ViewportProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

function ToastViewport({ toasts, onDismiss }: ViewportProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-4 z-[1000] flex flex-col gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

type ToastItemProps = {
  toast: Toast;
  onDismiss: (id: string) => void;
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const variantStyles: Record<ToastVariant, string> = {
    success: "bg-[var(--color-forest)]/90 border-[var(--color-forest)]",
    error: "bg-red-600/90 border-red-400",
    info: "bg-[var(--color-sky)]/90 border-[var(--color-sky)]",
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-[26px] border-2 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-all animate-toast-slide ${variantStyles[toast.variant]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        className="rounded-full border border-white/40 px-2 py-1 text-xs uppercase tracking-[0.2em]"
        onClick={() => onDismiss(toast.id)}
      >
        Cerrar
      </button>
    </div>
  );
}
