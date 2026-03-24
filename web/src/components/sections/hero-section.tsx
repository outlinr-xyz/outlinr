import type { FC } from "react";
import { Link } from "react-router";
import { Button } from "../common/button";

const APP_URL = import.meta.env.VITE_APP_URL ?? "";

export const HeroSection: FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-48 md:pb-64 px-6 lg:px-8 text-center relative z-10 w-full mx-auto max-w-5xl">
      <span className="mb-6 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-white/10 text-white/90 backdrop-blur-md border border-white/20 shadow-sm">
        Outlinr API coming soon
      </span>

      <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.08] font-garamond font-medium tracking-tight text-white mb-8 max-w-4xl">
        Secure Escrow for Serious Business.
      </h1>

      <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
        Secure escrow infrastructure built for high-trust global commerce.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
        <a href={`${APP_URL}/register`} className="w-full sm:w-auto">
          <Button
            size="lg"
            className="bg-[#0F172A] text-white transition-all text-base px-8 h-12 shadow-lg shadow-[#0F172A]/20 w-full"
          >
            Create Escrow
          </Button>
        </a>
        <Link to="/docs" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 active:bg-gray-200 border border-white/90 transition-all text-base px-8 h-12 w-full shadow-lg shadow-black/10"
          >
            Read Docs
          </Button>
        </Link>
      </div>
    </div>
  );
};
