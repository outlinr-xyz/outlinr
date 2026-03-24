import type { FC } from "react";
import { Link } from "react-router";
import { NavBar } from "../components/layout/nav-bar";
import { SiteFooter } from "../components/layout/site-footer";
import { Button } from "../components/common/button";

export const ComingSoonPage: FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 antialiased flex flex-col">
            <div className="relative flex-1 flex flex-col">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(180deg, #5B9BF2 0%, #7BB3F7 20%, #A0CBF9 45%, #B8D8FB 65%, #C8DFFA 80%, #D6E8FC 100%)",
                    }}
                />

                <div className="relative z-10 flex flex-col flex-1">
                    <NavBar />

                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-32 md:py-48 text-center">
                        <span className="mb-6 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-white/10 text-white/90 backdrop-blur-md border border-white/20 shadow-sm">
                            Under Construction
                        </span>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.08] font-garamond font-medium tracking-tight text-white mb-6 max-w-3xl">
                            Coming Soon
                        </h1>

                        <p className="text-base sm:text-lg text-white/85 max-w-lg mx-auto mb-10 leading-relaxed">
                            Apologies — we haven't gotten this far just yet. Stay tuned, great
                            things are on the way.
                        </p>

                        <Link to="/">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-gray-100 active:bg-gray-200 border border-white/90 transition-all text-base px-8 h-12 w-full shadow-lg shadow-black/10"
                            >
                                Back to Home
                            </Button>

                        </Link>
                    </div>
                </div>
            </div>

            <SiteFooter gradientFrom="#D6E8FC" />
        </div>
    );
};
