import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { useToast, ToastMessage } from "../../context/ToastContext";

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const { dismissToast } = useToast();

  const getStyle = () => {
    switch (toast.type) {
      case "error":
        return {
          border: "border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-100",
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          accent: "bg-rose-600",
          badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
        };
      case "success":
        return {
          border: "border-emerald-200 bg-emerald-50/95 text-emerald-950 shadow-emerald-100",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          accent: "bg-emerald-600",
          badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "warning":
        return {
          border: "border-amber-200 bg-amber-50/95 text-amber-950 shadow-amber-100",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          accent: "bg-amber-600",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "info":
      default:
        return {
          border: "border-indigo-200 bg-indigo-50/95 text-indigo-950 shadow-indigo-100",
          icon: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
          accent: "bg-indigo-600",
          badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="alert"
      className={`relative w-full max-w-sm sm:max-w-md rounded-2xl border ${style.border} shadow-lg backdrop-blur-md p-4 space-y-2 pointer-events-auto overflow-hidden`}
    >
      {/* Top indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.accent}`} />

      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5">{style.icon}</div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight leading-tight">
                {toast.title}
              </h4>
            </div>
            <p className="text-xs leading-relaxed opacity-90 break-words">
              {toast.message}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => dismissToast(toast.id)}
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-700 hover:bg-black/5 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2.5 max-w-full sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
