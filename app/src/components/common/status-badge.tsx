import type { EscrowStatus } from "../../types";

const statusConfig: Record<EscrowStatus, { label: string; className: string }> =
{
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PENDING_INVITE: { label: "Pending Invite", className: "bg-amber-50 text-amber-700" },
  AWAITING_FUNDING: { label: "Awaiting Funding", className: "bg-blue-50 text-blue-600" },
  PENDING_ACCEPTANCE: { label: "Pending Acceptance", className: "bg-purple-50 text-purple-600" },
  ACTIVE: { label: "Active", className: "bg-emerald-50 text-emerald-600" },
  FUNDED: { label: "Funded", className: "bg-emerald-50 text-emerald-600" },
  DELIVERY_IN_PROGRESS: { label: "In Delivery", className: "bg-indigo-50 text-indigo-600" },
  DELIVERED: { label: "Delivered", className: "bg-teal-50 text-teal-600" },
  INSPECTION: { label: "Inspection", className: "bg-orange-50 text-orange-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-600" },
  DISPUTED: { label: "Disputed", className: "bg-red-50 text-red-600" },
  RESOLVED: { label: "Resolved", className: "bg-gray-100 text-gray-700" },
  REFUNDED: { label: "Refunded", className: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500" },
  DELETED: { label: "Deleted", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status: EscrowStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: EscrowStatus): string {
  return statusConfig[status].label;
}
