import type { FC } from "react";
import { SectionHeading } from "../common/section-heading";
import { StepCard } from "../common/step-card";

const STEPS_TOP = [
  {
    number: 1,
    title: "Agree terms",
    description: "Buyer and seller agree to terms.",
    image: "/step-1-agree.webp",
  },
  {
    number: 2,
    title: "Secure payment",
    description: "Buyer submits payment to Outlinr's secure escrow.",
    image: "/step-2-payment.webp",
  },
  {
    number: 3,
    title: "Deliver goods",
    description: "Seller delivers the goods or services.",
    image: "/step-3-deliver.webp",
  },
] as const;

const STEPS_BOTTOM = [
  {
    number: 4,
    title: "Approve delivery",
    description: "Buyer approves goods or services.",
    image: "/step-4-approve.webp",
  },
  {
    number: 5,
    title: "Funds released",
    description: "Outlinr releases the funds payment to seller.",
    image: "/step-5-release.webp",
  },
] as const;

export const StepsSection: FC = () => {
  return (
    <section className="py-16 md:py-24 bg-linear-to-b from-white to-surface-1/30">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          title="Bulletproof Payments for Confident Business"
          subtitle="Outlinr, a secure payment method that reduces counterparty risk by safeguarding both buyers & sellers. All escrow funds are held in trust."
        />

        <div className="mt-16 max-w-5xl mx-auto flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS_TOP.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-8 w-full">
            {STEPS_BOTTOM.map((step) => (
              <div
                key={step.number}
                className="w-full md:w-[calc(33.333%-1.33rem)]"
              >
                <StepCard {...step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
