import type { FC } from "react";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  image?: string;
}

export const StepCard: FC<StepCardProps> = ({
  number,
  title,
  description,
  image,
}) => {
  return (
    <div className="flex flex-col items-start w-full max-w-70 mx-auto md:max-w-none group">
      <div className="w-full aspect-4/3 rounded-3xl bg-white mb-6 flex items-center justify-center overflow-hidden relative">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-[85%] h-[85%] object-contain"
          />
        ) : (
          <span className="text-gray-400 text-sm font-medium">
            Image placeholder
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-2xl font-semibold text-gray-300">{number}</span>
        <h3 className="text-xl font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed pl-7">
        {description}
      </p>
    </div>
  );
};
