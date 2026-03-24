import type { FC, ReactNode } from "react";
import type { FeatureCardVariant } from "../../types";

interface FeatureCardProps {
  variant?: FeatureCardVariant;
  title: string;
  description: string;
  children?: ReactNode;
}

export const FeatureCard: FC<FeatureCardProps> = ({
  variant = "standard",
  title,
  description,
  children,
}) => {
  const isSpotlight = variant === "spotlight";

  return (
    <div
      className={`rounded-2xl overflow-hidden ${isSpotlight
          ? "bg-linear-to-br from-surface-dark to-slate-700 text-white p-8"
          : "bg-white border border-gray-200 p-6 shadow-card"
        }`}
    >
      {children && <div className="mb-4">{children}</div>}
      <h3
        className={`text-xl font-semibold ${isSpotlight ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 text-sm leading-normal ${isSpotlight ? "text-gray-300" : "text-gray-600"}`}
      >
        {description}
      </p>
    </div>
  );
};
