import { Link } from "react-router";
import { ArrowLeft, Apple, Download, ChevronRight } from "lucide-react";
import { Button } from "../components/common/button";
import { Badge } from "../components/common/badge";
import { SectionHeading } from "../components/common/section-heading";
import { StepCard } from "../components/common/step-card";
import { StatBlock } from "../components/common/stat-block";

/* ------------------------------------------------------------------ */
/*  Color Swatch                                                       */
/* ------------------------------------------------------------------ */
function ColorSwatch({
  name,
  value,
  className,
  textDark = true,
}: {
  name: string;
  value: string;
  className: string;
  textDark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-16 h-16 rounded-xl border border-gray-200/40 shadow-card ${className}`}
      />
      <span
        className={`text-xs font-medium ${textDark ? "text-gray-900" : "text-gray-500"}`}
      >
        {name}
      </span>
      <span className="text-xs text-gray-400 font-mono">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Spacing Block                                                      */
/* ------------------------------------------------------------------ */
function SpacingBlock({ label, size }: { label: string; size: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-gray-500 w-12 text-right shrink-0">
        {label}
      </span>
      <div className={`h-4 bg-primary-500/20 rounded ${size}`} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shadow Card                                                        */
/* ------------------------------------------------------------------ */
function ShadowCard({
  label,
  shadowClass,
}: {
  label: string;
  shadowClass: string;
}) {
  return (
    <div
      className={`w-full h-24 rounded-2xl bg-white flex items-center justify-center ${shadowClass}`}
    >
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Wrapper                                                    */
/* ------------------------------------------------------------------ */
function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 flex items-center justify-between h-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            Design System
          </span>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </nav>

      {/* ── Hero ── */}
      <Section id="hero" className="py-24!">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="new">v1.0</Badge>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Design System
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            A living reference for every token, component, and pattern. Built
            with React and TailwindCSS v4.
          </p>
        </div>
      </Section>

      {/* ── Table of Contents ── */}
      <div className="border-y border-gray-200 bg-surface-1">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-3">
            {[
              "Typography",
              "Colors",
              "Spacing",
              "Shadows & Radius",
              "Buttons",
              "Badges",
              "Cards",
              "Stats",
            ].map((item) => (
              <a
                key={item}
                href={`#${item
                  .toLowerCase()
                  .replace(/\s+&\s+/g, "-")
                  .replace(/\s+/g, "-")}`}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-150"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── 1. Typography ── */}
      <Section id="typography">
        <SectionHeading
          title="Typography"
          subtitle="Geist font across seven scale levels. Hierarchy through size contrast, not weight."
        />
        <div className="space-y-10 max-w-3xl mx-auto">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 mb-1">
              Display · 3rem · Bold · tracking-tight
            </span>
            <p className="text-5xl font-bold tracking-tight leading-tight text-gray-900">
              The quick brown fox
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 mb-1">
              H1 · 2.25rem · Bold · tracking-tight
            </span>
            <p className="text-4xl font-bold tracking-tight leading-snug text-gray-900">
              The quick brown fox jumps
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 mb-1">
              H2 · 1.875rem · Semibold · tracking-tight
            </span>
            <p className="text-3xl font-semibold tracking-tight leading-snug text-gray-900">
              The quick brown fox jumps over
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 mb-1">
              H3 · 1.25rem · Semibold
            </span>
            <p className="text-xl font-semibold leading-normal text-gray-900">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 mb-1">
              Body · 1rem · Regular
            </span>
            <p className="text-base font-normal leading-relaxed text-gray-600">
              The quick brown fox jumps over the lazy dog. Pack my box with five
              dozen liquor jugs.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 mb-1">
              Body SM · 0.875rem · Regular
            </span>
            <p className="text-sm font-normal leading-normal text-gray-600">
              The quick brown fox jumps over the lazy dog. How vexingly quick
              daft zebras jump.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 mb-1">
              Caption · 0.75rem · Medium · tracking-wide
            </span>
            <p className="text-xs font-medium tracking-wide text-gray-400">
              THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG
            </p>
          </div>
        </div>

        {/* Text color usage */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Text Color Usage
          </h3>
          <div className="space-y-3">
            <p className="text-gray-900 font-medium">
              Primary headings —{" "}
              <span className="text-xs text-gray-400 font-mono">
                gray-900 #111827
              </span>
            </p>
            <p className="text-gray-600">
              Body text —{" "}
              <span className="text-xs text-gray-400 font-mono">
                gray-600 #4B5563
              </span>
            </p>
            <p className="text-gray-400">
              Muted / secondary —{" "}
              <span className="text-xs text-gray-400 font-mono">
                gray-400 #9CA3AF
              </span>
            </p>
            <p className="text-primary-500">
              Links / accent —{" "}
              <span className="text-xs text-gray-400 font-mono">
                primary-500 #4F6EF7
              </span>
            </p>
          </div>
        </div>
      </Section>

      <div className="border-t border-gray-200" />

      {/* ── 2. Colors ── */}
      <Section id="colors">
        <SectionHeading
          title="Colors"
          subtitle="Single chromatic accent. Everything else is grayscale. Color is earned, not given."
        />

        {/* Primary */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Primary</h3>
          <div className="flex flex-wrap gap-6">
            <ColorSwatch name="50" value="#EEF1FE" className="bg-primary-50" />
            <ColorSwatch
              name="100"
              value="#DFE4FD"
              className="bg-primary-100"
            />
            <ColorSwatch
              name="200"
              value="#BFC9FB"
              className="bg-primary-200"
            />
            <ColorSwatch
              name="400"
              value="#7B93F7"
              className="bg-primary-400"
            />
            <ColorSwatch
              name="500"
              value="#4F6EF7"
              className="bg-primary-500"
              textDark
            />
            <ColorSwatch
              name="600"
              value="#3A56D4"
              className="bg-primary-600"
              textDark
            />
            <ColorSwatch
              name="700"
              value="#2D44A8"
              className="bg-primary-700"
              textDark
            />
          </div>
        </div>

        {/* Neutrals */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Neutrals</h3>
          <div className="flex flex-wrap gap-6">
            <ColorSwatch name="50" value="#F9FAFB" className="bg-gray-50" />
            <ColorSwatch name="100" value="#F3F4F6" className="bg-gray-100" />
            <ColorSwatch name="200" value="#E5E7EB" className="bg-gray-200" />
            <ColorSwatch name="300" value="#D1D5DB" className="bg-gray-300" />
            <ColorSwatch name="400" value="#9CA3AF" className="bg-gray-400" />
            <ColorSwatch name="500" value="#6B7280" className="bg-gray-500" />
            <ColorSwatch name="600" value="#4B5563" className="bg-gray-600" />
            <ColorSwatch name="900" value="#111827" className="bg-gray-900" />
          </div>
        </div>

        {/* Surfaces */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Surfaces</h3>
          <div className="flex flex-wrap gap-6">
            <ColorSwatch name="Base" value="#FFFFFF" className="bg-white" />
            <ColorSwatch
              name="Surface-1"
              value="#F3F4F6"
              className="bg-surface-1"
            />
            <ColorSwatch
              name="Surface-2"
              value="#E8ECF8"
              className="bg-surface-2"
            />
            <ColorSwatch
              name="Dark"
              value="#1E293B"
              className="bg-surface-dark"
            />
          </div>
        </div>

        {/* State */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            State Colors
          </h3>
          <div className="flex flex-wrap gap-6">
            <ColorSwatch
              name="Success"
              value="#10B981"
              className="bg-emerald-500"
            />
            <ColorSwatch
              name="Warning"
              value="#F59E0B"
              className="bg-amber-500"
            />
            <ColorSwatch name="Error" value="#EF4444" className="bg-red-500" />
          </div>
        </div>
      </Section>

      <div className="border-t border-gray-200" />

      {/* ── 3. Spacing ── */}
      <Section id="spacing">
        <SectionHeading
          title="Spacing"
          subtitle="8px base unit. All spacing is a multiple of 8. Binary rhythm: macro-silence between sections, micro-structure within."
        />
        <div className="max-w-xl mx-auto space-y-3">
          <SpacingBlock label="4px" size="w-1" />
          <SpacingBlock label="8px" size="w-2" />
          <SpacingBlock label="12px" size="w-3" />
          <SpacingBlock label="16px" size="w-4" />
          <SpacingBlock label="24px" size="w-6" />
          <SpacingBlock label="32px" size="w-8" />
          <SpacingBlock label="48px" size="w-12" />
          <SpacingBlock label="64px" size="w-16" />
          <SpacingBlock label="80px" size="w-20" />
          <SpacingBlock label="96px" size="w-24" />
        </div>
      </Section>

      <div className="border-t border-gray-200" />

      {/* ── 4. Shadows & Radius ── */}
      <Section id="shadows-radius">
        <SectionHeading
          title="Shadows & Radius"
          subtitle="Shadows whisper. Elevation is measured in millimeters. Corners are softened, never circular."
        />

        {/* Shadows */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Elevation Hierarchy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <ShadowCard label="Elevation 0" shadowClass="" />
          <ShadowCard
            label="Elevation 1 · shadow-card"
            shadowClass="shadow-card"
          />
          <ShadowCard
            label="Elevation 2 · shadow-card-hover"
            shadowClass="shadow-card-hover"
          />
          <ShadowCard
            label="Elevation 3 · shadow-float"
            shadowClass="shadow-float"
          />
        </div>

        {/* Border Radius */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Border Radius Scale
        </h3>
        <div className="flex flex-wrap items-end gap-6">
          {[
            { label: "rounded-md", cls: "rounded-md", size: "w-12 h-12" },
            { label: "rounded-lg", cls: "rounded-lg", size: "w-14 h-14" },
            { label: "rounded-xl", cls: "rounded-xl", size: "w-16 h-16" },
            { label: "rounded-2xl", cls: "rounded-2xl", size: "w-20 h-20" },
            { label: "rounded-3xl", cls: "rounded-3xl", size: "w-24 h-24" },
            { label: "rounded-full", cls: "rounded-full", size: "w-16 h-16" },
          ].map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <div
                className={`${r.size} ${r.cls} bg-primary-100 border border-primary-200`}
              />
              <span className="text-xs text-gray-500 font-medium">
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <div className="border-t border-gray-200" />

      {/* ── 5. Buttons ── */}
      <Section id="buttons">
        <SectionHeading
          title="Buttons"
          subtitle="Three variants, three sizes. The primary button is the only saturated element on any viewport."
        />

        {/* Primary */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Primary</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg" icon={<Apple className="w-4 h-4" />}>
              Get for Mac
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        {/* Secondary */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Secondary
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="secondary" size="sm">
              Small
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
            <Button variant="secondary" size="lg">
              Large
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Ghost */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Ghost</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="ghost" size="sm">
              Small
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Learn more
            </Button>
            <Button variant="ghost" size="lg">
              Large
            </Button>
            <Button variant="ghost" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </Section>

      <div className="border-t border-gray-200" />

      {/* ── 6. Badges ── */}
      <Section id="badges">
        <SectionHeading
          title="Badges"
          subtitle="Three variants for status, labels, and highlights."
        />
        <div className="flex flex-wrap items-center gap-4">
          <Badge>Default</Badge>
          <Badge variant="new">New</Badge>
          <Badge variant="success">Operational</Badge>
        </div>
      </Section>

      <div className="border-t border-gray-200" />

      {/* ── 7. Cards ── */}
      <Section id="cards">
        {/* Step Cards */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Step Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number={1}
            title="Start Outlinr"
            description="Simply click Start Outlinr before your meeting begins."
          />
          <StepCard
            number={2}
            title="End Outlinr"
            description="Click the Stop button to end recording. That's it."
          />
          <StepCard
            number={3}
            title="Get notes"
            description="Outlinr uses what it heard and what it saw on your screen to generate notes."
          />
        </div>
      </Section>

      <div className="border-t border-gray-200" />

      {/* ── 8. Stats ── */}
      <Section id="stats">
        <SectionHeading
          title="Stats"
          subtitle="Large values with supporting context. The number draws the eye, the label explains."
        />
        <div className="space-y-10 max-w-xl mx-auto">
          <StatBlock
            value="12+"
            label="Languages"
            description="We support over 12 different languages, including English, Chinese, Spanish, and more."
          />
          <StatBlock
            value="300"
            unit="ms"
            label="Response time"
            description="We have the fastest live transcription available. Test us against any other competitor."
          />
          <StatBlock
            value="95%"
            label="Transcription accuracy"
            description="Trusted by many teams for reliable transcription. All processed with industry-leading accuracy."
          />
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="bg-linear-to-b from-white to-surface-2 pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex items-center justify-between border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-400">
              Design System Reference · Built with React + TailwindCSS v4
            </p>
            <Link
              to="/"
              className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors duration-150"
            >
              Back to home →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
