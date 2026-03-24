import type { FC } from "react";
import { Link } from "react-router";

const APP_URL = import.meta.env.VITE_APP_URL ?? "";

export const NavBar: FC = () => {
    return (
        <nav className="relative z-50">
            <div className="mx-auto max-w-6xl px-6 lg:px-8 flex items-center justify-between h-16">
                {/* Left: Logo + Nav Links */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img
                            src="/outlinr-icon.svg"
                            alt="Outlinr"
                            className="w-24 rounded-md brightness-0 invert"
                        />
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/coming-soon"
                            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors duration-150"
                        >
                            Developers
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20">
                Soon
              </span>
                        </Link>
                        <Link
                            to="/coming-soon"
                            className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-150"
                        >
                            Help
                        </Link>
                    </div>
                </div>

                {/* Right: Auth Buttons */}
                <div className="flex items-center gap-3">
                    <a
                        href={`${APP_URL}/login`}
                        className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors duration-150 cursor-pointer"
                    >
                        Login
                    </a>
                    <a
                        href={`${APP_URL}/register`}
                        className="px-5 py-2 text-sm font-medium rounded-xl bg-white/15 text-white backdrop-blur-sm border border-white/20 hover:bg-white/25 active:bg-white/30 transition-all duration-200 cursor-pointer"
                    >
                        Sign up
                    </a>
                </div>
            </div>
        </nav>
    );
};
