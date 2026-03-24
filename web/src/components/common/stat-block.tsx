import type { FC } from "react";

interface StatBlockProps {
  value: string;
  unit?: string;
  label: string;
  description: string;
}

export const StatBlock: FC<StatBlockProps> = ({
  value,
  unit,
  label,
  description,
}) => {
  return (
    <div className="flex items-start gap-6">
      <div className="shrink-0 min-w-20">
        <span className="text-5xl font-bold tracking-tight text-gray-900">
          {value}
        </span>
        {unit && (
          <span className="text-xl font-medium text-gray-400">{unit}</span>
        )}
      </div>
      <div>
        <h4 className="text-xl font-semibold text-gray-900">{label}</h4>
        <p className="mt-1 text-sm text-gray-600 leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
};
