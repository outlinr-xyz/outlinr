import type { FC } from "react";
import { NavBar } from "../components/layout/nav-bar";
import { HeroSection } from "../components/sections/hero-section";
import { EscrowStatusCard } from "../components/sections/escrow-status-card";
import { LogoStrip } from "../components/sections/logo-strip";
import { StepsSection } from "../components/sections/steps-section";
import { SiteFooter } from "../components/layout/site-footer";

export const LandingPage: FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      {/* Hero wrapper with gradient sky */}
      <div
        className="relative min-h-[80vh]"
        style={{
          background:
            "linear-gradient(180deg, #5B9BF2 0%, #7BB3F7 25%, #A0CBF9 50%, #C8DFFA 70%, #E8F0FE 85%, #FFFFFF 100%)",
        }}
      >
        <NavBar />
        <HeroSection />
      </div>
      <main>
        <EscrowStatusCard />
        <LogoStrip />
        <StepsSection />
      </main>
      <SiteFooter />
    </div>
  );
};
