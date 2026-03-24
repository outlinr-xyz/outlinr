import type { FC } from "react";

export const EscrowStatusCard: FC = () => {
  return (
    <div className="relative z-20 w-full max-w-4xl px-4 sm:px-6 mx-auto -mt-36 md:-mt-48">
      <div className="rounded-4xl bg-white border border-gray-200/60 shadow-[0_24px_80px_-12px_rgba(10,22,56,0.18)] p-6 sm:p-10 overflow-hidden relative">
        {/* Decorative blurs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl pointer-events-none hidden sm:block" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none hidden sm:block" />

        <div className="relative z-10 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8 items-start">
          {/* Left: Security */}
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Bank-level Security
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Funds held in verified trust accounts until all obligations are
              met.
            </p>
          </div>

          {/* Separator */}
          <div className="hidden md:flex items-center justify-center h-full pt-1">
            <div className="w-px h-16 bg-gray-200/60" />
          </div>

          {/* Center: Live Transaction */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Live Transaction
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700">
                  Secured
                </span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-3xl font-bold tracking-tight text-gray-900">
                ₦24,500
              </span>
              <span className="text-sm font-semibold text-gray-400 ml-0.5">
                .00
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-gray-500">
                  Awaiting buyer approval
                </span>
                <span className="text-[11px] font-medium text-gray-400">
                  75%
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[75%] rounded-full" />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="hidden md:flex items-center justify-center h-full pt-1">
            <div className="w-px h-16 bg-gray-200/60" />
          </div>

          {/* Right: Instant Release */}
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8l4 4-4 4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Instant Release
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Once approved, funds are instantly settled to the recipient's
              bank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
