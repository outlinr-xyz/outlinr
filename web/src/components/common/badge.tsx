import type { FC, ReactNode } from "react";
import type { BadgeVariant } from "../../types";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-600",
  new: "bg-primary-500 text-white",
  success: "bg-emerald-100 text-emerald-700",
};

export const Badge: FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
