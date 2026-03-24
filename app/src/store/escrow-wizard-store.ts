import { create } from "zustand";
import { ESCROW_DEFAULTS } from "../utils/escrow-defaults";
import type {
    ParticipationMode,
    DeliveryType,
    ShippingResponsibility,
    ConfirmationMethod,
} from "../types/index";

export interface WizardState {
    step: number;

    // Step 1 — Role
    participationMode: ParticipationMode | null;

    // Step 2 — Counterparty
    counterpartyEmail: string;
    counterpartyName: string;
    buyerEmail: string;
    buyerName: string;
    sellerEmail: string;
    sellerName: string;

    // Step 3 — Deal
    title: string;
    description: string;
    amount: string; // kept as string for input formatting
    currency: string;
    inspectionPeriodDays: number;
    autoRelease: boolean;
    disputeWindowHours: number;

    // Step 4 — Delivery
    deliveryType: DeliveryType | null;
    shippingResponsibility: ShippingResponsibility | null;
    expectedDeliveryDays: string;
    confirmationMethod: ConfirmationMethod;
    requireProofOfDelivery: boolean;
    milestoneEnabled: boolean;
    customDeliveryNotes: string;

    // Step 5 — Review
    agreedToTerms: boolean;

    // UI state
    isSubmitting: boolean;
    error: string | null;
}

interface WizardActions {
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
    reset: () => void;
    setSubmitting: (v: boolean) => void;
    setError: (e: string | null) => void;
}

const initialState: WizardState = {
    step: 0,
    participationMode: null,
    counterpartyEmail: "",
    counterpartyName: "",
    buyerEmail: "",
    buyerName: "",
    sellerEmail: "",
    sellerName: "",
    title: "",
    description: "",
    amount: "",
    currency: ESCROW_DEFAULTS.CURRENCY,
    inspectionPeriodDays: ESCROW_DEFAULTS.INSPECTION_PERIOD_DAYS,
    autoRelease: ESCROW_DEFAULTS.AUTO_RELEASE,
    disputeWindowHours: ESCROW_DEFAULTS.DISPUTE_WINDOW_HOURS,
    deliveryType: null,
    shippingResponsibility: null,
    expectedDeliveryDays: "",
    confirmationMethod: "BUYER_APPROVAL",
    requireProofOfDelivery: ESCROW_DEFAULTS.REQUIRE_PROOF_OF_DELIVERY,
    milestoneEnabled: ESCROW_DEFAULTS.MILESTONE_ENABLED,
    customDeliveryNotes: "",
    agreedToTerms: false,
    isSubmitting: false,
    error: null,
};

export const useEscrowWizardStore = create<WizardState & WizardActions>(
    (set) => ({
        ...initialState,

        setStep: (step) => set({ step }),
        nextStep: () => set((s) => ({ step: s.step + 1 })),
        prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
        setField: (key, value) => set({ [key]: value }),
        reset: () => set(initialState),
        setSubmitting: (isSubmitting) => set({ isSubmitting }),
        setError: (error) => set({ error }),
    }),
);
