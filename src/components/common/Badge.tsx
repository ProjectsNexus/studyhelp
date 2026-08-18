import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "university" | "department" | "publication" | "government" | "success" | "warning" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
  icon,
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md",
    md: "px-2.5 py-1 text-xs uppercase font-bold tracking-wider rounded-lg",
  };

  const variantClasses = {
    default: "bg-slate-100 text-slate-700 border border-slate-200/80",
    university: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
    department: "bg-purple-50 text-purple-700 border border-purple-200/80",
    publication: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    government: "bg-blue-50 text-blue-700 border border-blue-200/80",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/80",
    info: "bg-sky-50 text-sky-700 border border-sky-200/80",
    outline: "bg-white text-slate-600 border border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
