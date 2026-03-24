import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  highlight?: boolean;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  highlight = false,
  onClick,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-150 text-left w-full cursor-pointer ${
        highlight
          ? "bg-primary-50 border-primary-200 hover:bg-primary-100"
          : "bg-white border-gray-200/60 hover:border-gray-300 hover:shadow-card-hover"
      } shadow-card`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          highlight
            ? "bg-primary-100 text-primary-600"
            : "bg-surface-1 text-gray-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      </div>
    </button>
  );
}
