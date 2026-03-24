import type { FC, ReactNode, ButtonHTMLAttributes } from "react";
import type { ButtonVariant, ButtonSize } from "../../types";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm",
  secondary:
    "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:bg-gray-100",
  ghost:
    "bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
  md: "px-6 py-2.5 text-base rounded-xl gap-2",
  lg: "px-8 py-3 text-base rounded-xl gap-2",
};

export const Button: FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
