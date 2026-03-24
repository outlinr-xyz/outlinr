import type { FC } from "react";
import enyataLogo from "../../assets/enyata.svg";
import interswitchLogo from "../../assets/Interswitch.svg";

export const LogoStrip: FC = () => {
  return (
    <section className="pt-20 md:pt-28 pb-16 flex items-center">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 flex flex-col items-center">
        <h2 className="text-xs font-medium tracking-wide text-gray-400 uppercase mb-8">
          Powered by
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale overflow-hidden">
          <img
            src={interswitchLogo}
            alt="Interswitch"
            className="h-7 md:h-8 w-auto object-contain hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />
          <img
            src={enyataLogo}
            alt="Enyata"
            className="h-4 md:h-5 w-auto object-contain hover:grayscale-0 hover:opacity-100 transition-all duration-300 translate-y-1.5"
          />
        </div>
      </div>
    </section>
  );
};
