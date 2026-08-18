import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
}) => {
  const variantClasses = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "h-32 w-full rounded-2xl",
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variantClasses[variant]} ${className}`}
    />
  );
};
