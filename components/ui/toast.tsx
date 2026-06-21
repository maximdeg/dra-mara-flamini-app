"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "./cn";
import styles from "./toast.module.css";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  variant: ToastVariant;
  message: ReactNode;
};

export type ToastApi = {
  success: (message: ReactNode) => void;
  error: (message: ReactNode) => void;
  info: (message: ReactNode) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** Access the toast API. Must be called within a ToastProvider. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

/**
 * Provides `toast.success/error/info` to its subtree and renders the toasts in a
 * live region. Each toast auto-dismisses after `duration` ms (0 disables it).
 */
export function ToastProvider({
  children,
  duration = 4000,
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: ReactNode) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, variant, message }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [duration, remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className={styles.container}
        role="region"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(styles.toast, styles[toast.variant])}
          >
            <span className={styles.message}>{toast.message}</span>
            <button
              type="button"
              className={styles.close}
              aria-label="Cerrar"
              onClick={() => remove(toast.id)}
            >
              {"×"}
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
