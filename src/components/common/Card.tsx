import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padded?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = false,
  padded = true,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl ${padded ? "p-4 sm:p-5" : ""} ${
        bordered ? "border border-slate-200/80 shadow-xs" : ""
      } ${
        hoverable
          ? "transition-all duration-200 hover:border-slate-300 hover:shadow-md cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
