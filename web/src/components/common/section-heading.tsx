import type { FC } from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = "center",
}) => {
  return (
    <div
      className={`mb-12 ${align === "center" ? "text-center" : "text-left"} max-w-2xl ${align === "center" ? "mx-auto" : ""}`}
    >
      <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-gray-900 leading-snug">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-gray-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
