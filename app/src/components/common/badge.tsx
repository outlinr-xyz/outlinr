import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "new" | "success";
}

const variants: Record<string, string> = {
  default: "bg-surface-1 text-gray-600",
  new: "bg-primary-50 text-primary-600",
  success: "bg-emerald-50 text-emerald-600",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
