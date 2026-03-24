import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer rounded-xl select-none";

const variants: Record<string, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-card hover:shadow-card-hover",
  secondary:
    "bg-white text-gray-900 border border-gray-200 hover:bg-surface-1 active:bg-gray-100 shadow-card",
  ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-surface-1",
  outline: "bg-transparent text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
