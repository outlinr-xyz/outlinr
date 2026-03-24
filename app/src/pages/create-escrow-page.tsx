import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useEscrowWizardStore } from "../store/escrow-wizard-store";
import { ESCROW_DEFAULTS } from "../utils/escrow-defaults";
import { Button } from "../components/common/button";
import {
  IconArrowLeft,
  IconChevronRight,
  IconCheck,
  IconLock,
  IconSettings,
  IconChevronDown,
  IconShield,
} from "../components/common/icons";
import { formatCurrency } from "../utils/format";
import type { CreateEscrowRequest } from "../types/index";
import { useInterswitchInline } from "../hooks/use-interswitch-inline";
import { escrowService } from "../services/escrow-service";
import { useAuthStore } from "../store/auth-store";

const STEPS = ["Role", "Counterparty", "Deal", "Delivery", "Review"];

// ── Accent color map ──
const accentColors: Record<string, { bg: string; text: string; ring: string; light: string }> = {
  SELF_AS_BUYER: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    ring: "ring-blue-500/30",
    light: "bg-blue-50",
  },
  SELF_AS_SELLER: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    ring: "ring-emerald-500/30",
    light: "bg-emerald-50",
  },
  AGENT: {
    bg: "bg-violet-500",
    text: "text-violet-600",
    ring: "ring-violet-500/30",
    light: "bg-violet-50",
  },
};

export default function CreateEscrowPage() {
  const navigate = useNavigate();
  const store = useEscrowWizardStore();
  const { user } = useAuthStore();
  const currentUserEmail = user?.email || "";
  const accent = store.participationMode
    ? accentColors[store.participationMode]
    : accentColors.SELF_AS_BUYER;

  const { initiateNewPayment, loading: paymentLoading } = useInterswitchInline<{ id: string }>(
    undefined,
    (result) => {
      if (result?.id) {
        navigate(`/escrow/${result.id}/dashboard`);
      }
    }
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't reset — keep state for session resumability
    };
  }, []);

  if (user?.userTier === "PARTIAL") {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 mb-6 font-bold text-amber-500">
          <IconShield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Upgrade Required</h1>
        <p className="text-gray-500 mb-8">
          Partial accounts cannot create escrows. Please complete your registration to a full account to start a transaction.
        </p>
        <Button onClick={() => navigate("/account")}>Go to Account</Button>
      </div>
    );
  }

  if (user?.userTier === "FULL" && !user?.identityVerified) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 mb-6 font-bold text-primary-500">
          <IconLock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification Required</h1>
        <p className="text-gray-500 mb-8 text-sm">
          To ensure security for all parties, you must verify your identity before creating an escrow transaction.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate("/kyc")}>Verify Identity Now</Button>
          <Button variant="secondary" onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  function canAdvance(): boolean {
    switch (store.step) {
      case 0:
        return store.participationMode !== null;
      case 1:
        if (store.participationMode === "AGENT") {
          return (
            store.buyerEmail.includes("@") && 
            store.sellerEmail.includes("@") &&
            store.buyerEmail !== currentUserEmail &&
            store.sellerEmail !== currentUserEmail &&
            store.buyerEmail !== store.sellerEmail
          );
        }
        return store.counterpartyEmail.includes("@") && store.counterpartyEmail !== currentUserEmail;
      case 2:
        return (
          store.title.trim().length > 0 &&
          store.description.trim().length > 0 &&
          Number(store.amount) >= ESCROW_DEFAULTS.AMOUNT_MIN &&
          Number(store.amount) <= ESCROW_DEFAULTS.AMOUNT_MAX
        );
      case 3:
        return store.deliveryType !== null;
      case 4:
        return store.agreedToTerms;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    store.setError(null);

    const request: CreateEscrowRequest = {
      participationMode: store.participationMode!,
      title: store.title,
      description: store.description,
      amount: Number(store.amount),
      currency: store.currency,
      deliveryType: store.deliveryType!,
      inspectionPeriodDays: store.inspectionPeriodDays,
      autoRelease: store.autoRelease,
      disputeWindowHours: store.disputeWindowHours,
      requireProofOfDelivery: store.requireProofOfDelivery,
      milestoneEnabled: store.milestoneEnabled,
      customDeliveryNotes: store.customDeliveryNotes || undefined,
      shippingResponsibility: store.shippingResponsibility || undefined,
      expectedDeliveryDays: store.expectedDeliveryDays
        ? Number(store.expectedDeliveryDays)
        : undefined,
      confirmationMethod: store.deliveryType === "SERVICE" ? store.confirmationMethod : undefined,
    };

    if (store.participationMode === "AGENT") {
      request.buyerEmail = store.buyerEmail;
      request.buyerName = store.buyerName || undefined;
      request.sellerEmail = store.sellerEmail;
      request.sellerName = store.sellerName || undefined;
    } else {
      request.counterpartyEmail = store.counterpartyEmail;
      request.counterpartyName = store.counterpartyName || undefined;
    }

    try {
      if (store.participationMode === "SELF_AS_BUYER") {
        await initiateNewPayment(request);
      } else {
        store.setField("isSubmitting", true);
        const result = await escrowService.createEscrow(request);
        navigate(`/escrow/${result.id}/dashboard`);
      }
    } catch (e) {
      console.error("Escrow creation error:", e);
      const msg = e instanceof Error ? e.message : "Failed to create escrow";
      store.setError(msg);
      alert("Error: " + msg);
    } finally {
      store.setField("isSubmitting", false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fade-in relative z-10 pb-20">
      {/* ── Back ── */}
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-10 cursor-pointer bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50"
      >
        <IconArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* ── Step Indicator ── */}
      <div className="flex items-center gap-2 md:gap-3 mb-12 overflow-x-auto pb-2 scrollbar-none">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={() => i < store.step && store.setStep(i)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${i === store.step
                ? `${accent.bg} text-white border-transparent shadow-md`
                : i < store.step
                  ? `${accent.light} ${accent.text} border-transparent hover:opacity-80`
                  : "bg-white text-gray-400 border-gray-100"
                }`}
            >
              {i < store.step ? (
                <IconCheck className="w-4 h-4" />
              ) : (
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i === store.step ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {i + 1}
                </span>
              )}
              {label}
            </button>
            {i < STEPS.length - 1 && (
              <IconChevronRight className="w-5 h-5 text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* ── Error Banner ── */}
      {store.error && (
        <div className="mb-8 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-700 flex items-center gap-3">
          <span className="text-xl">⚠</span> {store.error}
        </div>
      )}

      {/* ── Step Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left — Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 p-8 md:p-12 mb-8 relative overflow-hidden">
             {/* Subtle decorative blob */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
             
             <div className="relative z-10">
                {store.step === 0 && <StepRole />}
                {store.step === 1 && <StepCounterparty />}
                {store.step === 2 && <StepDeal />}
                {store.step === 3 && <StepDelivery />}
                {store.step === 4 && <StepReview />}
             </div>
          </div>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm px-6 py-3 rounded-xl"
              onClick={() => store.step > 0 ? store.prevStep() : navigate("/")}
            >
              {store.step > 0 ? "Back" : "Cancel Creation"}
            </Button>
            {store.step < 4 ? (
              <Button
                disabled={!canAdvance()}
                onClick={() => store.nextStep()}
                icon={<IconChevronRight className="w-4 h-4" />}
                className="px-8 py-3 rounded-xl shadow-md text-base"
              >
                Continue to Next Step
              </Button>
            ) : (
              <Button
                disabled={!canAdvance() || store.isSubmitting || paymentLoading}
                onClick={handleSubmit}
                icon={<IconLock className="w-5 h-5" />}
                className="px-10 py-3 rounded-xl shadow-lg shadow-primary-500/20 text-base"
              >
                {store.isSubmitting ? "Creating transaction securely…" : paymentLoading ? "Initializing Checkout…" : 
                  store.participationMode === "SELF_AS_BUYER" ? "Create & Pay Securely" : "Create Escrow & Invite"}
              </Button>
            )}
          </div>
        </div>

        {/* Right — Live Preview */}
        <div className="lg:col-span-5 xl:col-span-4">
          <LivePreview />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//   STEP 1 — Role Selection
// ────────────────────────────────────────────────

function StepRole() {
  const { participationMode, setField } = useEscrowWizardStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          What's your role?
        </h2>
        <p className="text-base font-medium text-gray-500 mt-2">
          Choose how you're participating in this escrow transaction.
        </p>
      </div>

      <div className="space-y-4">
         {/* Party Card */}
         <div
            role="button"
            tabIndex={0}
            onClick={() => {
               if (participationMode === "SELF_AS_BUYER" || participationMode === "SELF_AS_SELLER") {
               setField("participationMode", null);
               } else {
               setField("participationMode", "SELF_AS_BUYER");
               }
            }}
            onKeyDown={(e) => {
               if (e.key === "Enter" || e.key === " ") {
               e.preventDefault();
               if (participationMode === "SELF_AS_BUYER" || participationMode === "SELF_AS_SELLER") {
                  setField("participationMode", null);
               } else {
                  setField("participationMode", "SELF_AS_BUYER");
               }
               }
            }}
            className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${participationMode === "SELF_AS_BUYER" || participationMode === "SELF_AS_SELLER"
               ? "border-primary-500 bg-primary-50/30 shadow-lg shadow-primary-500/10"
               : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm"
               }`}
         >
            <div className="flex items-center gap-5 mb-5">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl shrink-0 shadow-inner">
               🤝
               </div>
               <div>
               <p className="text-lg font-bold text-gray-900">I'm a party in this deal</p>
               <p className="text-sm font-medium text-gray-500 mt-0.5">
                  I'm either buying something or selling something directly.
               </p>
               </div>
            </div>

            {/* Sub-choice */}
            {(participationMode === "SELF_AS_BUYER" || participationMode === "SELF_AS_SELLER") && (
               <div className="grid grid-cols-2 gap-4 mt-2 mb-2">
               <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                     e.stopPropagation();
                     setField("participationMode", "SELF_AS_BUYER");
                  }}
                  onKeyDown={(e) => {
                     if (e.key === "Enter" || e.key === " ") {
                     e.stopPropagation();
                     setField("participationMode", "SELF_AS_BUYER");
                     }
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${participationMode === "SELF_AS_BUYER"
                     ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10 ring-4 ring-blue-500/20"
                     : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                     }`}
               >
                  <span className="text-3xl mb-2 block drop-shadow-sm">💳</span>
                  <p className="text-base font-bold text-gray-900 mt-1">Buyer</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">I'm Paying</p>
               </div>
               <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                     e.stopPropagation();
                     setField("participationMode", "SELF_AS_SELLER");
                  }}
                  onKeyDown={(e) => {
                     if (e.key === "Enter" || e.key === " ") {
                     e.stopPropagation();
                     setField("participationMode", "SELF_AS_SELLER");
                     }
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${participationMode === "SELF_AS_SELLER"
                     ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10 ring-4 ring-emerald-500/20"
                     : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                     }`}
               >
                  <span className="text-3xl mb-2 block drop-shadow-sm">📦</span>
                  <p className="text-base font-bold text-gray-900 mt-1">Seller</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">I'm Receiving</p>
               </div>
               </div>
            )}
         </div>

         {/* Agent Card */}
         <button
            onClick={() => setField("participationMode", "AGENT")}
            className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${participationMode === "AGENT"
               ? "border-violet-500 bg-violet-50/50 shadow-lg shadow-violet-500/10"
               : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm"
               }`}
         >
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-2xl shrink-0 shadow-inner">
               🏛️
               </div>
               <div>
               <p className="text-lg font-bold text-gray-900">
                  I'm acting as a broker
               </p>
               <p className="text-sm font-medium text-gray-500 mt-0.5">
                  I'm setting up this escrow transaction for two entirely different parties.
               </p>
               </div>
            </div>
         </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//   STEP 2 — Counterparty Details
// ────────────────────────────────────────────────

function StepCounterparty() {
  const { participationMode, counterpartyEmail, counterpartyName, buyerEmail, buyerName, sellerEmail, sellerName, setField } =
    useEscrowWizardStore();

  const inputClass =
    "w-full px-5 py-4 rounded-[1rem] border border-gray-200/80 bg-gray-50/50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium appearance-none";

  if (participationMode === "AGENT") {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Who are the parties?
          </h2>
          <p className="text-base font-medium text-gray-500 mt-2">
            Enter the details for both the buyer and seller. We will notify them.
          </p>
        </div>

        {/* Buyer */}
        <div className="p-6 md:p-8 rounded-[2rem] border-2 border-blue-100 bg-blue-50/30 space-y-5">
          <div className="flex items-center gap-3 border-b border-blue-100/50 pb-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">1</div>
             <p className="text-sm font-bold text-blue-900 tracking-widest uppercase">The Buyer</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setField("buyerEmail", e.target.value)}
                placeholder="buyer@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Full Name (Optional)</label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setField("buyerName", e.target.value)}
              placeholder="e.g John Doe"
              className={inputClass}
            />
          </div>
        </div>

        {/* Seller */}
        <div className="p-6 md:p-8 rounded-[2rem] border-2 border-emerald-100 bg-emerald-50/30 space-y-5">
          <div className="flex items-center gap-3 border-b border-emerald-100/50 pb-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">2</div>
             <p className="text-sm font-bold text-emerald-900 tracking-widest uppercase">The Seller</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={sellerEmail}
                onChange={(e) => setField("sellerEmail", e.target.value)}
                placeholder="seller@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Full Name (Optional)</label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setField("sellerName", e.target.value)}
              placeholder="e.g Jane Smith"
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 justify-center text-gray-500 font-medium text-sm pt-2">
           <IconShield className="w-4 h-4 text-emerald-500" /> Secure invitations will be sent out instantly.
        </div>
      </div>
    );
  }

  const isBuyer = participationMode === "SELF_AS_BUYER";
  const heading = isBuyer ? "Who are you buying from?" : "Who's paying you?";
  const accentBorder = isBuyer ? "border-emerald-200" : "border-blue-200";
  const accentBg = isBuyer ? "bg-emerald-50/30" : "bg-blue-50/30";
  const iconBg = isBuyer ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {heading}
        </h2>
        <p className="text-base font-medium text-gray-500 mt-2">
          They'll receive a secure invitation to review and join this escrow transaction.
        </p>
      </div>
      
      <div className={`p-8 rounded-[2rem] border-2 space-y-6 ${accentBorder} ${accentBg}`}>
         <div className="flex items-center gap-3 border-b border-gray-200/50 pb-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${iconBg}`}>
               {isBuyer ? "📦" : "💳"}
            </div>
            <p className="text-sm font-bold text-gray-900 tracking-widest uppercase">
               {isBuyer ? "Target Seller Details" : "Target Buyer Details"}
            </p>
         </div>

         <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
               {isBuyer ? "Seller's Email Address" : "Buyer's Email Address"} *
            </label>
            <div className="flex items-center gap-3">
               <input
               type="email"
               value={counterpartyEmail}
               onChange={(e) => setField("counterpartyEmail", e.target.value)}
               placeholder={isBuyer ? "seller@example.com" : "buyer@example.com"}
               className={inputClass}
               />
            </div>
         </div>
         
         <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
               Full Name (Optional)
            </label>
            <input
               type="text"
               value={counterpartyName}
               onChange={(e) => setField("counterpartyName", e.target.value)}
               placeholder="e.g John Doe"
               className={inputClass}
            />
            <p className="text-sm font-medium text-gray-500 mt-2 px-1">
               If they don't have an Outlinr Escrow account yet, they'll be invited to quickly create one.
            </p>
         </div>
      </div>

      <div className="flex items-center gap-3 justify-center text-gray-500 font-medium text-sm pt-2">
         <IconShield className="w-4 h-4 text-emerald-500" /> A heavily encrypted invitation will be sent to this address.
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//   STEP 3 — Deal Definition
// ────────────────────────────────────────────────

function StepDeal() {
  const store = useEscrowWizardStore();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const inputClass =
    "w-full px-5 py-4 rounded-[1rem] border border-gray-200/80 bg-gray-50/50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all appearance-none";

  // Format amount with Naira symbol
  const displayAmount = store.amount
    ? `₦${Number(store.amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Define the deal
        </h2>
        <p className="text-base font-medium text-gray-500 mt-2">
          Describe what's being transacted and set the terms.
        </p>
      </div>

      <div className="space-y-6">
         <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Title *</label>
            <input
               type="text"
               value={store.title}
               onChange={(e) => store.setField("title", e.target.value)}
               placeholder="e.g. Logo Design for Acme Corp"
               className={inputClass}
            />
         </div>

         <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Description *</label>
            <textarea
               value={store.description}
               onChange={(e) => store.setField("description", e.target.value)}
               rows={4}
               placeholder="Describe the item, service, or deliverable in absolute detail…"
               className={`${inputClass} resize-none`}
            />
         </div>
      </div>

      <div className="bg-gray-50/80 p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-6">
         <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Amount *</label>
            <div className="relative">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg select-none">₦</span>
               <input
               type="number"
               value={store.amount}
               onChange={(e) => store.setField("amount", e.target.value)}
               placeholder="0.00"
               min="0"
               step="0.01"
               className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all pl-10 text-xl tracking-tight`}
               />
            </div>
            {Number(store.amount) > 0 && (
               <p className="text-xs font-semibold text-primary-600 mt-2 ml-1">
               {displayAmount}
               </p>
            )}
            {Number(store.amount) > 0 && Number(store.amount) < ESCROW_DEFAULTS.AMOUNT_MIN && (
               <p className="text-xs font-bold text-red-500 mt-2 ml-1">
               Minimum amount is {formatCurrency(ESCROW_DEFAULTS.AMOUNT_MIN, store.currency)}
               </p>
            )}
            {Number(store.amount) > ESCROW_DEFAULTS.AMOUNT_MAX && (
               <p className="text-xs font-bold text-red-500 mt-2 ml-1">
               Maximum amount is {formatCurrency(ESCROW_DEFAULTS.AMOUNT_MAX, store.currency)}
               </p>
            )}
            {Number(store.amount) >= ESCROW_DEFAULTS.AMOUNT_MIN && Number(store.amount) <= ESCROW_DEFAULTS.AMOUNT_MAX && (
               <div className="mt-4 p-5 rounded-[1.5rem] bg-white border border-gray-100 space-y-3 shadow-sm">
               <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Escrow fee ({ESCROW_DEFAULTS.FEE_PERCENT}%)</span>
                  <span className="text-gray-600">{formatCurrency(Number(store.amount) * ESCROW_DEFAULTS.FEE_PERCENT / 100, store.currency)}</span>
               </div>
               <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100">
                  <span className="text-gray-900">Total due from buyer</span>
                  <span className="text-primary-600">{formatCurrency(Number(store.amount) * (1 + ESCROW_DEFAULTS.FEE_PERCENT / 100), store.currency)}</span>
               </div>
               </div>
            )}
         </div>

         <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Currency</label>
            <div className="relative">
               <select
               value={store.currency}
               onChange={(e) => store.setField("currency", e.target.value)}
               className={`${inputClass} pr-10 appearance-none bg-white border-gray-200 focus:ring-4 cursor-pointer`}
               >
               <option value="NGN">NGN — Nigerian Naira</option>
               <option value="USD">USD — US Dollar</option>
               <option value="GBP">GBP — British Pound</option>
               <option value="EUR">EUR — Euro</option>
               </select>
               <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Advanced Settings Accordion */}
      <div className="pt-2">
         <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-gray-100 hover:bg-gray-50"
         >
            <IconSettings className="w-4 h-4" />
            Advanced Contract Settings
            <IconChevronDown className={`w-4 h-4 transition-transform ml-1 ${advancedOpen ? "rotate-180" : ""}`} />
         </button>

         {advancedOpen && (
            <div className="mt-4 space-y-5 p-6 rounded-[2xl] border-2 border-gray-100 bg-gray-50/50 animate-fade-in text-sm font-medium">
               <div className="space-y-1.5">
                  <label className="block text-gray-700 text-sm font-bold">Inspection period</label>
                  <div className="relative">
                     <select
                     value={store.inspectionPeriodDays}
                     onChange={(e) => store.setField("inspectionPeriodDays", Number(e.target.value))}
                     className={`${inputClass} bg-white cursor-pointer`}
                     >
                     <option value={1}>1 day</option>
                     <option value={3}>3 days</option>
                     <option value={7}>7 days (Standard)</option>
                     <option value={14}>14 days</option>
                     </select>
                     <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div>
                     <p className="font-bold text-gray-900">Auto-release funds after inspection?</p>
                     <p className="text-xs text-gray-500 mt-1">Funds release automatically if buyer doesn't explicitly respond or object.</p>
                  </div>
                  <button
                     onClick={() => store.setField("autoRelease", !store.autoRelease)}
                     className={`w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${store.autoRelease ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                     <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${store.autoRelease ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
               </div>

               <div className="space-y-1.5">
                  <label className="block text-gray-700 text-sm font-bold">Dispute window</label>
                  <div className="relative">
                     <select
                     value={store.disputeWindowHours}
                     onChange={(e) => store.setField("disputeWindowHours", Number(e.target.value))}
                     className={`${inputClass} bg-white cursor-pointer`}
                     >
                     <option value={24}>24 hours</option>
                     <option value={48}>48 hours (Standard)</option>
                     <option value={72}>72 hours</option>
                     </select>
                     <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//   STEP 4 — Delivery Method
// ────────────────────────────────────────────────

function StepDelivery() {
  const store = useEscrowWizardStore();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const inputClass =
    "w-full px-5 py-4 rounded-[1rem] border border-gray-200/80 bg-gray-50/50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium appearance-none";

  const deliveryCards = [
    { type: "DIGITAL" as const, icon: "📁", label: "Digital Product", desc: "File or link delivery" },
    { type: "PHYSICAL" as const, icon: "📦", label: "Physical Shipment", desc: "Courier or tracking" },
    { type: "SERVICE" as const, icon: "🛠", label: "Service", desc: "Task-based delivery" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          How will delivery work?
        </h2>
        <p className="text-base font-medium text-gray-500 mt-2">
          Choose the type of delivery to set up the validation framework.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deliveryCards.map((card) => (
          <button
            key={card.type}
            onClick={() => store.setField("deliveryType", card.type)}
            className={`p-6 rounded-[1.5rem] border-2 text-center transition-all cursor-pointer ${store.deliveryType === card.type
              ? "border-primary-500 bg-primary-50/20 shadow-lg shadow-primary-500/10 ring-4 ring-primary-500/10"
              : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
              }`}
          >
            <span className="text-4xl mb-3 block drop-shadow-sm">{card.icon}</span>
            <p className="text-base font-bold text-gray-900 mt-2">{card.label}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{card.desc}</p>
          </button>
        ))}
      </div>

      {/* Adaptive sub-fields */}
      {store.deliveryType === "DIGITAL" && (
        <div className="p-5 rounded-[1.5rem] border-2 border-blue-100 bg-blue-50/30 flex gap-4 animate-fade-in">
          <span className="text-2xl pt-1">📎</span>
          <div>
            <p className="font-bold text-blue-900 text-sm">Digital Delivery Selected</p>
            <p className="text-sm font-medium text-blue-800/80 mt-1">
               You'll provide the final file, access credentials, or link directly into the platform when you mark delivery as complete.
            </p>
          </div>
        </div>
      )}

      {store.deliveryType === "PHYSICAL" && (
        <div className="space-y-5 p-6 rounded-[1.5rem] border-2 border-gray-100 bg-gray-50/30 animate-fade-in">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Shipping is arranged by:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["SELLER", "BUYER"] as const).map((who) => (
                <button
                  key={who}
                  onClick={() => store.setField("shippingResponsibility", who)}
                  className={`p-4 rounded-2xl border-2 text-center text-sm font-bold transition-all cursor-pointer ${store.shippingResponsibility === who
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                >
                  {who === "SELLER" ? "The Seller" : "The Buyer"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Expected delivery window (days)
            </label>
            <input
              type="number"
              value={store.expectedDeliveryDays}
              onChange={(e) => store.setField("expectedDeliveryDays", e.target.value)}
              placeholder="e.g. 7"
              min="1"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {store.deliveryType === "SERVICE" && (
        <div className="space-y-4 p-6 rounded-[1.5rem] border-2 border-gray-100 bg-gray-50/30 animate-fade-in">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            How is completion confirmed?
          </label>
          <div className="space-y-3">
            <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${store.confirmationMethod === "BUYER_APPROVAL" ? "border-primary-500 bg-primary-50/30 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 bg-white shrink-0">
                 {store.confirmationMethod === "BUYER_APPROVAL" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
              <input
                type="radio"
                name="confirmation"
                className="hidden"
                checked={store.confirmationMethod === "BUYER_APPROVAL"}
                onChange={() => store.setField("confirmationMethod", "BUYER_APPROVAL")}
              />
              <div>
                <p className="text-sm font-bold text-gray-900">Buyer manually approves</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Buyer reviews the final service and approves completion</p>
              </div>
            </label>
            <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${store.confirmationMethod === "MILESTONE" ? "border-primary-500 bg-primary-50/30 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
               <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 bg-white shrink-0">
                 {store.confirmationMethod === "MILESTONE" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
              <input
                type="radio"
                name="confirmation"
                className="hidden"
                checked={store.confirmationMethod === "MILESTONE"}
                onChange={() => store.setField("confirmationMethod", "MILESTONE")}
              />
              <div>
                <p className="text-sm font-bold text-gray-900">Milestone-based sign-off</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Split into milestones for incremental funding approval</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Advanced Delivery Settings */}
      <div className="pt-2">
         <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-gray-100 hover:bg-gray-50"
         >
            <IconSettings className="w-4 h-4" />
            Advanced Delivery Settings
            <IconChevronDown className={`w-4 h-4 transition-transform ml-1 ${advancedOpen ? "rotate-180" : ""}`} />
         </button>

         {advancedOpen && (
            <div className="mt-4 space-y-4 p-6 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-sm font-medium animate-fade-in">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div>
                     <p className="font-bold text-gray-900">Require proof of delivery?</p>
                     <p className="text-xs text-gray-500 mt-1">Seller must upload evidence documents/images to the vault.</p>
                  </div>
                  <button
                     onClick={() => store.setField("requireProofOfDelivery", !store.requireProofOfDelivery)}
                     className={`w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${store.requireProofOfDelivery ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                     <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${store.requireProofOfDelivery ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div>
                     <p className="font-bold text-gray-900">Split into milestones?</p>
                     <p className="text-xs text-gray-500 mt-1">Break the delivery schedule into incremental payable stages.</p>
                  </div>
                  <button
                     onClick={() => store.setField("milestoneEnabled", !store.milestoneEnabled)}
                     className={`w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${store.milestoneEnabled ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                     <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${store.milestoneEnabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
               </div>

               <div className="space-y-2 mt-4">
                  <label className="block text-sm font-bold text-gray-700">Custom delivery instructions</label>
                  <textarea
                     value={store.customDeliveryNotes}
                     onChange={(e) => store.setField("customDeliveryNotes", e.target.value)}
                     rows={3}
                     placeholder="Any special operational instructions…"
                     className={`${inputClass} resize-none`}
                  />
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//   STEP 5 — Review & Confirm
// ────────────────────────────────────────────────

function ReviewLine({
  label,
  value,
  step,
  setStep,
}: {
  label: string;
  value: string;
  step: number;
  setStep: (s: number) => void;
}) {
  return (
    <button
      onClick={() => setStep(step)}
      className="flex justify-between items-center px-5 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer w-full text-left"
    >
      <span className="text-sm font-bold text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </button>
  );
}

function StepReview() {
  const store = useEscrowWizardStore();

  const amount = Number(store.amount) || 0;

  const roleLabels: Record<string, string> = {
    SELF_AS_BUYER: "You are the Buyer",
    SELF_AS_SELLER: "You are the Seller",
    AGENT: "You are the Agent",
  };

  const deliveryLabels: Record<string, string> = {
    DIGITAL: "📁 Digital Product",
    PHYSICAL: "📦 Physical Shipment",
    SERVICE: "🛠 Service",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Review & confirm
        </h2>
        <p className="text-base font-medium text-gray-500 mt-2">
          Verify everything looks right. Click any line to edit.
        </p>
      </div>

      <div className="rounded-[1.5rem] border-2 border-gray-100 bg-white shadow-sm divide-y-2 divide-gray-50 overflow-hidden">
        <ReviewLine setStep={store.setStep} label="Title" value={store.title} step={2} />
        <ReviewLine setStep={store.setStep} label="Amount" value={formatCurrency(amount, store.currency)} step={2} />
        <ReviewLine setStep={store.setStep} label={`Escrow fee (${ESCROW_DEFAULTS.FEE_PERCENT}%)`} value={formatCurrency(amount * ESCROW_DEFAULTS.FEE_PERCENT / 100, store.currency)} step={2} />
        <div className="flex justify-between items-center px-5 py-4 bg-gray-50/50">
          <span className="text-sm font-extrabold text-gray-700 uppercase tracking-widest">Total due from buyer</span>
          <span className="text-base font-extrabold text-primary-600 tracking-tight">{formatCurrency(amount * (1 + ESCROW_DEFAULTS.FEE_PERCENT / 100), store.currency)}</span>
        </div>
        <ReviewLine setStep={store.setStep} label="Currency" value={store.currency} step={2} />
        <ReviewLine setStep={store.setStep} label="Your role" value={store.participationMode ? roleLabels[store.participationMode] : "—"} step={0} />
        {store.participationMode === "AGENT" ? (
          <>
            <ReviewLine setStep={store.setStep} label="Buyer" value={store.buyerEmail || "—"} step={1} />
            <ReviewLine setStep={store.setStep} label="Seller" value={store.sellerEmail || "—"} step={1} />
          </>
        ) : (
          <ReviewLine setStep={store.setStep}
            label={store.participationMode === "SELF_AS_BUYER" ? "Seller" : "Buyer"}
            value={`${store.counterpartyEmail}${store.counterpartyName ? ` (${store.counterpartyName})` : ""}`}
            step={1}
          />
        )}
        <ReviewLine setStep={store.setStep} label="Delivery type" value={store.deliveryType ? deliveryLabels[store.deliveryType] : "—"} step={3} />
        <ReviewLine setStep={store.setStep} label="Inspection period" value={`${store.inspectionPeriodDays} day${store.inspectionPeriodDays > 1 ? "s" : ""}`} step={2} />
        <ReviewLine setStep={store.setStep} label="Auto-release" value={store.autoRelease ? "Yes" : "No"} step={2} />
      </div>

      {/* Terms Checkbox */}
      <label className="flex items-start gap-4 cursor-pointer p-6 rounded-[1.5rem] border-2 border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all shadow-sm">
        <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-gray-300 bg-white shrink-0">
            {store.agreedToTerms && <div className="w-3 h-3 rounded-[2px] bg-primary-500" />}
        </div>
        <input
          type="checkbox"
          checked={store.agreedToTerms}
          onChange={(e) => store.setField("agreedToTerms", e.target.checked)}
          className="hidden"
        />
        <div>
          <p className="text-sm font-bold text-gray-900">
            I have reviewed and agree to the escrow terms
          </p>
          <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">
            This agreement will be locked into a smart vault once the counterparty accepts.
          </p>
        </div>
      </label>
      
      {store.participationMode !== "SELF_AS_BUYER" && (
        <div className="p-5 rounded-[1.5rem] border-2 border-blue-100 bg-blue-50/50 flex gap-4">
          <span className="text-2xl pt-0.5">ℹ️</span>
          <div>
            <p className="text-sm font-bold text-blue-900">Buyer will fund this escrow</p>
            <p className="text-xs font-medium text-blue-800/80 mt-1 leading-relaxed">
              Once created, the buyer receives an email invitation to review the terms and securely fund the escrow vault via Interswitch.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
//   LIVE PREVIEW SIDEBAR
// ────────────────────────────────────────────────

function LivePreview() {
  const store = useEscrowWizardStore();
  const amount = Number(store.amount) || 0;

  const roleMap: Record<string, string> = {
    SELF_AS_BUYER: "Buyer",
    SELF_AS_SELLER: "Seller",
    AGENT: "Agent",
  };

  const deliveryMap: Record<string, string> = {
    DIGITAL: "Digital Product",
    PHYSICAL: "Physical Shipment",
    SERVICE: "Service",
  };

  return (
    <div className="sticky top-24 bg-gray-900 text-white rounded-[2rem] border border-gray-800 shadow-2xl p-8 relative overflow-hidden">
      {/* Decorative receipt jagging */}
      <div className="absolute top-0 inset-x-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMicgaGVpZ2h0PScxMic+PHBhdGggZD0nTTYuMDAyLTEuMDk3TDExLjgxNyA0LjkydjZMLjE5IDQuOTJ6JyBmaWxsPSdibGFjaycgZmlsbC1ydWxlPSdldmVub2RkJy8+PC9zdmc+')] bg-repeat-x opacity-10 block" />

      <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-6">
        Agreement Preview
      </p>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</p>
          <p className="text-lg font-bold text-white tracking-tight mt-1">{store.title || "Untitled Deal"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your role</p>
          <p className="text-sm font-bold text-white mt-1">
            {store.participationMode ? roleMap[store.participationMode] : "—"}
          </p>
        </div>
        {store.participationMode === "AGENT" ? (
          <>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Buyer</p>
              <p className="text-sm font-medium text-gray-300 mt-1">{store.buyerEmail || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Seller</p>
              <p className="text-sm font-medium text-gray-300 mt-1">{store.sellerEmail || "—"}</p>
            </div>
          </>
        ) : (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {store.participationMode === "SELF_AS_BUYER" ? "Seller" : "Buyer"}
            </p>
            <p className="text-sm font-medium text-gray-300 mt-1">{store.counterpartyEmail || "—"}</p>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-800">
           <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Deal amount</p>
           <p className="text-2xl font-extrabold text-white tracking-tight mt-1">
             {amount > 0 ? formatCurrency(amount, store.currency) : "—"}
           </p>
        </div>

        {amount > 0 && (
          <div className="p-4 rounded-[1.5rem] bg-gray-800/50 border border-gray-700/50 space-y-2 mt-4">
            <div className="flex justify-between">
               <span className="text-xs font-bold text-gray-400">Escrow fee ({ESCROW_DEFAULTS.FEE_PERCENT}%)</span>
               <span className="text-xs font-bold text-gray-300">
                  +{formatCurrency(amount * ESCROW_DEFAULTS.FEE_PERCENT / 100, store.currency)}
               </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-700/50">
               <span className="text-sm font-bold text-white">Total</span>
               <span className="text-sm font-extrabold text-[#38D9BA] tracking-tight">
                  {formatCurrency(amount * (1 + ESCROW_DEFAULTS.FEE_PERCENT / 100), store.currency)}
               </span>
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery mode</p>
          <p className="text-sm font-bold text-white mt-1">
            {store.deliveryType ? deliveryMap[store.deliveryType] : "—"}
          </p>
        </div>
        
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Terms</p>
          <p className="text-sm font-medium text-gray-400 mt-1">
            {store.inspectionPeriodDays} day inspection period.
            {store.autoRelease ? " Funds auto-release enabled." : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
