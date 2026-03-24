// ── Escrow Status ──
export type EscrowStatus =
  | "DRAFT"
  | "PENDING_INVITE"
  | "AWAITING_FUNDING"
  | "PENDING_ACCEPTANCE"
  | "ACTIVE"
  | "FUNDED"
  | "DELIVERY_IN_PROGRESS"
  | "DELIVERED"
  | "INSPECTION"
  | "COMPLETED"
  | "DISPUTED"
  | "RESOLVED"
  | "REFUNDED"
  | "CANCELLED"
  | "DELETED";

export type ParticipationMode = "SELF_AS_BUYER" | "SELF_AS_SELLER" | "AGENT";
export type DeliveryType = "DIGITAL" | "PHYSICAL" | "SERVICE";
export type ShippingResponsibility = "SELLER" | "BUYER";
export type ConfirmationMethod = "BUYER_APPROVAL" | "MILESTONE";
export type ParticipantRole = "BUYER" | "SELLER" | "AGENT";
export type EscrowRole = "buyer" | "seller";
export type AccountType = "individual" | "company";
export type AccountStatus = "ACTIVE" | "PENDING_SETUP";

export interface EscrowParticipant {
  id: string;
  email: string;
  name: string | null;
  role: ParticipantRole;
  inviteAccepted: boolean;
  inviteAcceptedAt: string | null;
}

export interface EscrowResponse {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  participationMode: ParticipationMode;
  deliveryType: DeliveryType;
  inspectionPeriodDays: number;
  autoRelease: boolean;
  disputeWindowHours: number;
  requireProofOfDelivery: boolean;
  milestoneEnabled: boolean;
  customDeliveryNotes: string | null;
  shippingResponsibility: ShippingResponsibility | null;
  expectedDeliveryDays: number | null;
  confirmationMethod: ConfirmationMethod | null;
  deliveryEvidence: string | null;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  createdByEmail: string;
  participants: EscrowParticipant[];
}

export interface CreateEscrowRequest {
  participationMode: ParticipationMode;
  counterpartyEmail?: string;
  counterpartyName?: string;
  buyerEmail?: string;
  buyerName?: string;
  sellerEmail?: string;
  sellerName?: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  deliveryType: DeliveryType;
  inspectionPeriodDays: number;
  autoRelease: boolean;
  disputeWindowHours: number;
  requireProofOfDelivery: boolean;
  milestoneEnabled: boolean;
  customDeliveryNotes?: string;
  shippingResponsibility?: ShippingResponsibility;
  expectedDeliveryDays?: number;
  confirmationMethod?: ConfirmationMethod;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  actor: "buyer" | "seller" | "system" | "admin";
}

export interface Escrow {
  id: string;
  counterparty: string;
  counterpartyEmail: string;
  role: EscrowRole;
  amount: number;
  currency: string;
  status: EscrowStatus;
  description: string;
  deliveryTerms: string;
  inspectionWindow: number;
  timeRemaining: string | null;
  lastActivity: string;
  createdAt: string;
  timeline: TimelineEvent[];
  shippingRef?: string;
}

export interface DashboardStats {
  totalVolume: number;
  activeEscrowValue: number;
  fundsPending: number;
  disputesOpen: number;
  expiringSoon: number;
}

export interface DisputeEvidence {
  id: string;
  uploadedBy: string;
  fileUrl: string;
  fileType: string;
  originalFileName: string;
  uploadedAt: string;
}

export type DisputeStatus = "OPEN" | "RESOLVED" | "UNDER_REVIEW";
export type DisputeResolution = "REFUNDED" | "RELEASED";

export interface Dispute {
  id: string;
  escrowId: string;
  raisedBy: string;
  reason: string;
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  adminNotes: string | null;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  evidence: DisputeEvidence[];
}

export interface InvitePreviewResponse {
  title: string;
  description: string;
  amount: number;
  currency: string;
  deliveryType: DeliveryType;
  createdByName: string;
  invitedRole: "BUYER" | "SELLER" | "AGENT";
}

export interface AuthResponse {
  message: string;
  user: UserResponse;
  escrowId?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  accountType: string;
  accountStatus: AccountStatus;
  userTier: "PARTIAL" | "FULL" | "AGENT";
  identityVerified: boolean;
  hasBankAccount: boolean;
  bankAccountNumberMasked: string | null;
  bankCode: string | null;
  bankName: string | null;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  response: AuthResponse;
}
