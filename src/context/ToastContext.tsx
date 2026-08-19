import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { parseFirebaseError, ParsedFirebaseError } from "../utils/firebaseErrors";

export type ToastType = "error" | "success" | "warning" | "info";

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  details?: string;
  code?: string;
  isPermissionError?: boolean;
  isQuotaError?: boolean;
}

export interface ToastMessage extends ToastOptions {
  id: string;
  type: ToastType;
  createdAt: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (options: ToastOptions) => string;
  error: (messageOrOptions: string | ToastOptions, fallbackTitle?: string) => string;
  success: (messageOrOptions: string | ToastOptions, fallbackTitle?: string) => string;
  warning: (messageOrOptions: string | ToastOptions, fallbackTitle?: string) => string;
  info: (messageOrOptions: string | ToastOptions, fallbackTitle?: string) => string;
  firebaseError: (error: unknown, fallbackMessage?: string) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const toastType: ToastType = options.type || "info";
    const duration = options.duration !== undefined ? options.duration : toastType === "error" ? 6500 : 4000;

    const newToast: ToastMessage = {
      ...options,
      id,
      type: toastType,
      title: options.title || (toastType === "error" ? "Action Failed" : toastType === "success" ? "Success" : toastType === "warning" ? "Warning" : "Notice"),
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep maximum 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [dismissToast]);

  const error = useCallback(
    (messageOrOptions: string | ToastOptions, fallbackTitle: string = "Error"): string => {
      if (typeof messageOrOptions === "string") {
        return showToast({
          title: fallbackTitle,
          message: messageOrOptions,
          type: "error",
        });
      }
      return showToast({ ...messageOrOptions, type: "error" });
    },
    [showToast]
  );

  const success = useCallback(
    (messageOrOptions: string | ToastOptions, fallbackTitle: string = "Success"): string => {
      if (typeof messageOrOptions === "string") {
        return showToast({
          title: fallbackTitle,
          message: messageOrOptions,
          type: "success",
        });
      }
      return showToast({ ...messageOrOptions, type: "success" });
    },
    [showToast]
  );

  const warning = useCallback(
    (messageOrOptions: string | ToastOptions, fallbackTitle: string = "Warning"): string => {
      if (typeof messageOrOptions === "string") {
        return showToast({
          title: fallbackTitle,
          message: messageOrOptions,
          type: "warning",
        });
      }
      return showToast({ ...messageOrOptions, type: "warning" });
    },
    [showToast]
  );

  const info = useCallback(
    (messageOrOptions: string | ToastOptions, fallbackTitle: string = "Notice"): string => {
      if (typeof messageOrOptions === "string") {
        return showToast({
          title: fallbackTitle,
          message: messageOrOptions,
          type: "info",
        });
      }
      return showToast({ ...messageOrOptions, type: "info" });
    },
    [showToast]
  );

  const firebaseError = useCallback(
    (err: unknown, fallbackMessage?: string): string => {
      const parsed = parseFirebaseError(err, fallbackMessage);
      return showToast({
        title: parsed.title,
        message: parsed.message,
        type: "error",
        details: parsed.details,
        code: parsed.code,
        isPermissionError: parsed.isPermissionError,
        isQuotaError: parsed.isQuotaError,
        duration: 7500,
      });
    },
    [showToast]
  );

  // Global event listener to automatically catch any dispatched Firebase errors across the app
  useEffect(() => {
    const handleGlobalError = (event: Event) => {
      const customEvt = event as CustomEvent<ParsedFirebaseError>;
      if (customEvt.detail) {
        const detail = customEvt.detail;
        showToast({
          title: detail.title,
          message: detail.message,
          type: "error",
          details: detail.details,
          code: detail.code,
          isPermissionError: detail.isPermissionError,
          isQuotaError: detail.isQuotaError,
          duration: 7500,
        });
      }
    };

    window.addEventListener("studyhelper:firebase-error-toast", handleGlobalError);
    return () => {
      window.removeEventListener("studyhelper:firebase-error-toast", handleGlobalError);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        error,
        success,
        warning,
        info,
        firebaseError,
        dismissToast,
        clearAll,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
