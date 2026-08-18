import React, { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-200/80 max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-250">
        {/* Drag handle pill */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {(title || subtitle) && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div>
              {title && <h2 className="text-base font-bold text-slate-900">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
