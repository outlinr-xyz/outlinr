import type { FC } from "react";
import { Link } from "react-router";

const FOOTER_LINKS: Array<{ title: string; links: string[] }> = [
    { title: "Customer", links: ["Learn More", "Benefits", "Fees"] },
    { title: "Broker", links: ["Learn More", "Become a Broker", "Fees"] },
    {
        title: "Business",
        links: [
            "Learn More",
            "Become a Partner",
            "Benefits",
            "Fees",
            "Escrow Pay",
            "Escrow Offer",
            "Escrow Buttons",
            "Escrow API",
        ],
    },
    {
        title: "Developers",
        links: [
            "API Integration",
            "API Documentation",
            "Escrow Pay",
            "Escrow Offer",
            "Escrow Buttons",
        ],
    },
];

interface SiteFooterProps {
    gradientFrom?: string;
}

export const SiteFooter: FC<SiteFooterProps> = ({ gradientFrom }) => {
    return (
        <footer className="relative pt-24 pb-12 overflow-hidden border-t-0">
            {/* Gradient fade-in from the section above */}
            {gradientFrom && (
                <div
                    className="absolute inset-x-0 top-0 h-32 pointer-events-none"
                    style={{
                        background: `linear-gradient(180deg, ${gradientFrom} 0%, transparent 100%)`,
                    }}
                />
            )}

            {/* Footer background */}
            <div
                className="absolute inset-0"
                style={{
                    background: gradientFrom
                        ? `linear-gradient(180deg, ${gradientFrom} 0%, #F4F7FB 30%, #F4F7FB 100%)`
                        : "linear-gradient(180deg, rgba(243,244,246,0.3) 0%, #F4F7FB 100%)",
                }}
            />

            {/* Background massive text */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-center items-end opacity-[0.03] select-none">
        <span className="text-[25vw] font-clash font-semibold leading-none tracking-tighter text-gray-900 whitespace-nowrap translate-y-[20%]">
          Outlinr
        </span>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 mb-24 md:mb-32">
                    {/* Left Col: Logo + Status (desktop only) */}
                    <div className="flex flex-col justify-between w-full lg:w-1/4 shrink-0 self-stretch">
                        <Link to="/" className="pt-2">
                            <img
                                src="/outlinr-logo(dark).svg"
                                alt="Outlinr"
                                className="w-24"
                            />
                        </Link>

                        {/* Status badge — desktop only */}
                        <div className="hidden lg:block mt-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200/50 border border-gray-300/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-sm font-medium text-gray-600">
                  All systems operational
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Cols: Links */}
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                        {FOOTER_LINKS.map(({ title, links }) => (
                            <div key={title} className="min-w-35">
                                <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center gap-2 w-max">
                                    {title}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/40 text-gray-500 backdrop-blur-sm border border-gray-200/40 shadow-xs">
                    Soon
                  </span>
                                </h3>
                                <ul className="space-y-4">
                                    {links.map((label) => (
                                        <li key={label}>
                                            <Link
                                                to="/coming-soon"
                                                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Status badge — mobile only, appears after links */}
                    <div className="lg:hidden">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200/50 border border-gray-300/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-sm font-medium text-gray-600">
                All systems operational
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
