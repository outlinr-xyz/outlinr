import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { escrowService } from "../services/escrow-service";
import { formatCurrency } from "../utils/format";
import { StatusBadge } from "../components/common/status-badge";
import { Button } from "../components/common/button";
import {
  IconArrowLeft,
  IconCheck,
  IconTruck,
  IconShield,
  IconAlertTriangle,
  IconDollarSign,
  IconLock,
  IconTrash,
} from "../components/common/icons";
import { useInterswitchInline } from "../hooks/use-interswitch-inline";
import { DeleteEscrowModal } from "../components/common/delete-escrow-modal";
import { useAuthStore } from "../store/auth-store";
import type { EscrowResponse } from "../types/index";

const FUNDED_STATUSES = new Set(["FUNDED", "PENDING_ACCEPTANCE", "ACTIVE",
  "DELIVERY_IN_PROGRESS", "DELIVERED", "INSPECTION", "COMPLETED",
  "DISPUTED", "RESOLVED", "REFUNDED", "CANCELLED", "DELETED"]);

/* ── helpers ── */
function getCounterparty(escrow: EscrowResponse, userEmail: string): { name: string; email: string } {
  const other = escrow.participants.find((p) => p.email !== userEmail);
  return { name: other?.name || other?.email || "—", email: other?.email || "" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/* ────────────────────────────────────────────────
   BUYER VIEW – focused on tracking & confirming
───────────────────────────────────────────────── */
function BuyerWorkspace({ escrow, userEmail }: { escrow: EscrowResponse; userEmail: string }) {
  const navigate = useNavigate();
  const counterparty = getCounterparty(escrow, userEmail);

  const { initiatePayment, loading: paymentLoading, error: paymentError } = useInterswitchInline(escrow.id, () => {
    // on success wait a moment and reload the page to see FUNDED status
    setTimeout(() => window.location.reload(), 1500);
  });

  // Only show fund CTA when explicitly waiting for funding — suppress once funded
  const canFund = escrow.status === "AWAITING_FUNDING" && !FUNDED_STATUSES.has(escrow.status);
  const canConfirm = escrow.status === "DELIVERED";
  const canDispute =
    escrow.status === "DELIVERED" || escrow.status === "DELIVERY_IN_PROGRESS";
  const isDisputed = escrow.status === "DISPUTED";
  const isFinal =
    escrow.status === "COMPLETED" ||
    escrow.status === "REFUNDED" ||
    escrow.status === "CANCELLED";

  const statusMessages: Record<string, string> = {
    PENDING_INVITE: "Waiting for the seller to accept your escrow invitation.",
    AWAITING_FUNDING: "Fund this escrow to get things moving.",
    FUNDED: "Escrow funded. Waiting for the seller to begin delivery.",
    DELIVERY_IN_PROGRESS: "Seller is working on delivery.",
    DELIVERED: "Item has arrived. Inspect it and confirm receipt.",
    INSPECTION: "You are inspecting the delivery.",
    DISPUTED: "Your dispute has been submitted. The platform is investigating.",
    COMPLETED: "Funds released. This escrow is closed.",
    CANCELLED: "This escrow has been cancelled.",
    REFUNDED: "You've been refunded.",
    RESOLVED: "This dispute has been resolved.",
    DELETED: "This escrow has been deleted.",
  };

  if (escrow.status === "DELETED") {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconShield className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escrow Deleted</h2>
        <p className="text-gray-500">This escrow transaction has been deleted and is no longer active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Status Band */}
      <div
        className={`rounded-[2rem] p-8 mb-8 border-2 shadow-sm drop-shadow-sm transition-colors ${isDisputed
          ? "bg-red-50 border-red-100"
          : isFinal && escrow.status === "COMPLETED"
            ? "bg-emerald-50 border-emerald-100"
            : isFinal
              ? "bg-gray-50 border-gray-200"
              : "bg-primary-50 border-primary-100"
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={escrow.status} />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                You are the Buyer
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 pt-3 tracking-tight">
              {escrow.title}
            </p>
            <p className="text-sm font-bold text-gray-500 mt-1">
              {statusMessages[escrow.status] || ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: main content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Action Card */}
          {(canConfirm || canDispute) && (
            <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card p-8 hover:border-primary-50 transition-colors">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-3">
                Action Required
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {canConfirm
                  ? "The item has been delivered. Once you're satisfied, confirm receipt to release the funds."
                  : "You can raise a dispute if there's a problem with delivery or the item."}
              </p>
              <div className="flex items-center gap-3">
                {canConfirm && (
                  <Button
                    icon={<IconCheck className="w-4 h-4" />}
                    onClick={() =>
                      escrowService.transitionStatus(escrow.id, "INSPECTION", "Buyer confirmed delivery")
                    }
                  >
                    Confirm Receipt
                  </Button>
                )}
                {canDispute && (
                  <Button
                    variant="secondary"
                    icon={<IconAlertTriangle className="w-4 h-4" />}
                    onClick={() => navigate("/disputes")}
                  >
                    Raise Dispute
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Funding Card */}
          {canFund && (
            <div className="bg-white rounded-[2rem] border-2 border-primary-500/20 shadow-card p-8 bg-gradient-to-br from-white to-primary-50/30">
              <h3 className="text-xs font-extrabold text-primary-600 tracking-widest uppercase mb-3">
                Fund Escrow
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Securely lock the funds for this transaction. The seller will be notified to begin delivery.
              </p>
              {paymentError && <p className="text-sm text-red-600 mb-4">{paymentError}</p>}
              <Button
                icon={<IconDollarSign className="w-4 h-4" />}
                onClick={initiatePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : `Fund ${formatCurrency(escrow.amount, escrow.currency)}`}
              </Button>
            </div>
          )}

          {/* Agreement Details */}
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card overflow-hidden hover:border-primary-50 transition-colors">
            <div className="flex items-center justify-between px-8 py-6 border-b-2 border-gray-50 bg-gray-50/50">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase">
                Agreement Details
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <IconLock className="w-3 h-3" />
                Locked & Verified
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Seller</p>
                  <p className="text-sm font-medium text-gray-900">
                    {counterparty.name}
                  </p>
                  <p className="text-xs text-gray-400">{counterparty.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Amount in Escrow</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">
                    {formatCurrency(escrow.amount, escrow.currency)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700">{escrow.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Delivery type</p>
                  <p className="text-sm text-gray-600">{escrow.deliveryType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Inspection period</p>
                  <p className="text-sm text-gray-600">
                    {escrow.inspectionPeriodDays} day{escrow.inspectionPeriodDays > 1 ? "s" : ""} after delivery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card overflow-hidden hover:border-primary-50 transition-colors">
            <div className="px-8 py-6 border-b-2 border-gray-50 bg-gray-50/50">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-1">Participants</h3>
            </div>
            <div className="p-6 space-y-3">
              {escrow.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1rem] bg-white border border-gray-200 text-gray-900 flex items-center justify-center text-lg font-black shadow-sm drop-shadow-sm">
                      {(p.name || p.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-900 mb-1">
                        {p.name || p.email}
                        {p.email === userEmail && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md ml-2 drop-shadow-sm">You</span>
                        )}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{p.role}</p>
                    </div>
                  </div>
                  {p.inviteAccepted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <IconCheck className="w-3.5 h-3.5" /> Accepted
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Funds locked */}
          <div className="bg-primary-50 rounded-[2rem] border-2 border-primary-200 p-8 shadow-sm group hover:bg-primary-100/50 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <IconLock className="w-4 h-4 text-primary-500" />
              <p className="text-xs font-extrabold text-primary-700 tracking-widest uppercase">
                FUNDS LOCKED
              </p>
            </div>
            <p className="text-3xl font-black text-primary-700 tracking-tight mt-1">
              {formatCurrency(escrow.amount, escrow.currency)}
            </p>
            <p className="text-xs text-primary-500 mt-1">
              Held securely. Only released when you confirm receipt.
            </p>
          </div>

          {/* Protection */}
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card p-8 hover:border-primary-50 transition-colors">
            <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6">
              YOUR PROTECTION
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Inspection period</span>
                <span className="text-sm font-medium text-gray-900">
                  {escrow.inspectionPeriodDays} day{escrow.inspectionPeriodDays > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Escrow ID</span>
                <span className="text-xs font-mono text-gray-600">
                  {escrow.id.slice(0, 8)}…
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-600">
                  {formatDate(escrow.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Counterparty */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-card p-5">
            <p className="text-xs font-medium text-gray-400 tracking-wide mb-3">
              SELLER
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-xs font-semibold text-primary-700">
                {counterparty.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{counterparty.name}</p>
                <p className="text-xs text-gray-400">{counterparty.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <IconShield className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                You are protected. Funds are only released if you confirm
                receipt or admin rules in favour of the seller after a dispute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   SELLER VIEW – focused on fulfillment & payout
───────────────────────────────────────────────── */
function SellerWorkspace({ escrow, userEmail }: { escrow: EscrowResponse; userEmail: string }) {
  const counterparty = getCounterparty(escrow, userEmail);

  const needsAction =
    escrow.status === "PENDING_INVITE" ||
    escrow.status === "DELIVERY_IN_PROGRESS";
  const isDisputed = escrow.status === "DISPUTED";
  const isComplete = escrow.status === "COMPLETED";
  const isFailed = escrow.status === "CANCELLED" || escrow.status === "REFUNDED";

  const statusMessages: Record<string, string> = {
    PENDING_INVITE: "A buyer has locked funds for your item. Accept to proceed.",
    AWAITING_FUNDING: "Waiting for the buyer to fund the escrow.",
    FUNDED: "Buyer funded. Begin delivery.",
    DELIVERY_IN_PROGRESS: "Accepted. Ship the item and mark it as delivered.",
    DELIVERED: "Delivered. Waiting for the buyer to confirm receipt.",
    INSPECTION: "Buyer is inspecting the delivery.",
    DISPUTED: "The buyer raised a dispute. The platform will review the evidence.",
    COMPLETED: "Buyer confirmed receipt. Funds settled to your account.",
    CANCELLED: "This escrow has been cancelled.",
    REFUNDED: "Funds were refunded to the buyer.",
    RESOLVED: "This dispute has been resolved.",
    DELETED: "This escrow has been deleted.",
  };

  if (escrow.status === "DELETED") {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconShield className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escrow Deleted</h2>
        <p className="text-gray-500">This escrow transaction was deleted by the creator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Status Band */}
      <div
        className={`rounded-[2rem] p-8 mb-8 border-2 shadow-sm drop-shadow-sm transition-colors ${isDisputed
          ? "bg-red-50 border-red-100"
          : isComplete
            ? "bg-emerald-50 border-emerald-100"
            : isFailed
              ? "bg-gray-50 border-gray-200"
              : "bg-surface-2 border-primary-100/60"
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={escrow.status} />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-white/80 px-3 py-1.5 rounded-lg border border-primary-100 backdrop-blur-md">
                You are the Seller
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 pt-3 tracking-tight">
              {escrow.title}
            </p>
            <p className="text-sm font-bold text-gray-500 mt-1">
              {statusMessages[escrow.status] || ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: main content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Seller Action Card */}
          {needsAction && (
            <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card p-8 hover:border-primary-50 transition-colors">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-3">
                {escrow.status === "PENDING_INVITE"
                  ? "Accept this Escrow"
                  : "Fulfil this Order"}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {escrow.status === "PENDING_INVITE"
                  ? `The buyer has locked ${formatCurrency(escrow.amount, escrow.currency)} for your item. Accept to confirm the deal.`
                  : "Ship the item and add a tracking reference so the buyer can follow its progress."}
              </p>
              {escrow.status === "PENDING_INVITE" && (
                <div className="flex items-center gap-3">
                  <Button
                    icon={<IconCheck className="w-4 h-4" />}
                    onClick={() =>
                      escrowService.transitionStatus(escrow.id, "AWAITING_FUNDING", "Seller accepted invite")
                    }
                  >
                    Accept Escrow
                  </Button>
                  <Button variant="secondary">Decline</Button>
                </div>
              )}
              {escrow.status === "DELIVERY_IN_PROGRESS" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tracking reference (e.g. DHL-NG-000000)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-surface-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                  />
                  <Button
                    icon={<IconTruck className="w-4 h-4" />}
                    onClick={() =>
                      escrowService.transitionStatus(escrow.id, "DELIVERED", "Seller marked as delivered")
                    }
                  >
                    Mark as Delivered
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Delivered confirmation */}
          {escrow.status === "DELIVERED" && (
            <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card p-8 hover:border-primary-50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[1rem] bg-primary-50 flex items-center justify-center border border-primary-100">
                  <IconTruck className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900 mb-1">
                    Item delivered
                  </p>
                  {escrow.deliveryEvidence && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                      {escrow.deliveryEvidence}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500">
                Waiting for the buyer to confirm receipt. Funds will release
                automatically after the inspection window if the buyer is silent.
              </p>
            </div>
          )}

          {/* Deal Terms */}
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card overflow-hidden hover:border-primary-50 transition-colors">
            <div className="flex items-center justify-between px-8 py-6 border-b-2 border-gray-50 bg-gray-50/50">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase">
                Deal Terms
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-gray-400">
                <IconLock className="w-3.5 h-3.5" />
                Sealed
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Buyer</p>
                  <p className="text-sm font-medium text-gray-900">
                    {counterparty.name}
                  </p>
                  <p className="text-xs text-gray-400">{counterparty.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">You'll receive</p>
                  <p className="text-3xl font-black text-emerald-700 tracking-tight mt-1">
                    {formatCurrency(escrow.amount, escrow.currency)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    on buyer confirmation
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700">{escrow.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Delivery type</p>
                  <p className="text-sm text-gray-600">{escrow.deliveryType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Buyer's inspection period</p>
                  <p className="text-sm text-gray-600">
                    {escrow.inspectionPeriodDays} day{escrow.inspectionPeriodDays > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card overflow-hidden hover:border-primary-50 transition-colors">
            <div className="px-8 py-6 border-b-2 border-gray-50 bg-gray-50/50">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-1">Participants</h3>
            </div>
            <div className="p-6 space-y-3">
              {escrow.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1rem] bg-white border border-gray-200 text-gray-900 flex items-center justify-center text-lg font-black shadow-sm drop-shadow-sm">
                      {(p.name || p.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-900 mb-1">
                        {p.name || p.email}
                        {p.email === userEmail && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md ml-2 drop-shadow-sm">You</span>
                        )}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{p.role}</p>
                    </div>
                  </div>
                  {p.inviteAccepted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <IconCheck className="w-3.5 h-3.5" /> Accepted
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Payout card */}
          <div
            className={`rounded-[2rem] border-2 p-8 shadow-sm transition-colors ${isComplete
              ? "bg-emerald-50 border-emerald-200"
              : "bg-surface-1 border-gray-200 shadow-card"
              }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <IconDollarSign className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-extrabold tracking-widest uppercase text-emerald-700">
                {isComplete ? "SETTLED" : "PENDING PAYOUT"}
              </p>
            </div>
            <p
              className={`text-3xl font-black mt-1 tracking-tight ${isComplete ? "text-emerald-700" : "text-gray-900"}`}
            >
              {formatCurrency(escrow.amount, escrow.currency)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isComplete
                ? "Transferred to your bank account"
                : "Released upon buyer's confirmation"}
            </p>
          </div>

          {/* Fulfilment checklist */}
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card p-8 hover:border-primary-50 transition-colors">
            <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6">
              FULFILMENT STEPS
            </p>
            <div className="space-y-2.5">
              {[
                {
                  label: "Accept escrow",
                  done: escrow.status !== "PENDING_INVITE",
                },
                {
                  label: "Deliver the item",
                  done: [
                    "DELIVERED",
                    "INSPECTION",
                    "COMPLETED",
                    "DISPUTED",
                    "REFUNDED",
                  ].includes(escrow.status),
                },
                {
                  label: "Buyer confirms receipt",
                  done: escrow.status === "COMPLETED",
                },
                {
                  label: "Funds released to you",
                  done: escrow.status === "COMPLETED",
                },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-100" : "bg-gray-100"
                      }`}
                  >
                    <IconCheck
                      className={`w-3 h-3 ${done ? "text-emerald-600" : "text-gray-300"}`}
                    />
                  </div>
                  <span
                    className={`text-sm ${done ? "text-gray-900 font-medium" : "text-gray-400"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buyer info */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-card p-5">
            <p className="text-xs font-medium text-gray-400 tracking-wide mb-3">
              BUYER
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-600">
                {counterparty.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {counterparty.name}
                </p>
                <p className="text-xs text-gray-400">
                  {counterparty.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   AGENT VIEW – overview of both buyer and seller
───────────────────────────────────────────────── */
function AgentWorkspace({ escrow, userEmail: _userEmail }: { escrow: EscrowResponse; userEmail: string }) {
  const buyer = escrow.participants.find((p) => p.role === "BUYER");
  const seller = escrow.participants.find((p) => p.role === "SELLER");

  const isFinal = ["COMPLETED", "REFUNDED", "CANCELLED", "DELETED"].includes(escrow.status);
  const isDisputed = escrow.status === "DISPUTED";

  return (
    <div className="space-y-6">
      {/* Agent Status Band */}
      <div className={`rounded-[2rem] p-8 mb-8 border-2 shadow-sm drop-shadow-sm transition-colors ${isDisputed ? "bg-red-50 border-red-100" : isFinal ? "bg-gray-50 border-gray-200" : "bg-violet-50 border-violet-200"}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <StatusBadge status={escrow.status} />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-700 bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200">
                🏛️ Agent View
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 pt-3 tracking-tight">{escrow.title}</p>
            <p className="text-sm font-bold text-gray-500 mt-1">{escrow.description}</p>
          </div>
          <p className="text-3xl font-black text-gray-800 tracking-tight shrink-0 ml-4">
            {formatCurrency(escrow.amount, escrow.currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Buyer card */}
        <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card p-8 hover:border-violet-50 transition-colors">
          <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6">BUYER</p>
          {buyer ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-blue-50 flex items-center justify-center text-lg border border-blue-100 font-black text-blue-700 shadow-sm drop-shadow-sm">
                {(buyer.name || buyer.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900 mb-1">{buyer.name || buyer.email}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{buyer.email}</p>
                <div className="mt-2">
                  {buyer.inviteAccepted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">✓ Accepted</span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Pending invite</span>
                  )}
                </div>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400 font-medium">No buyer assigned</p>}
        </div>

        {/* Seller card */}
        <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card p-8 hover:border-violet-50 transition-colors">
          <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6">SELLER</p>
          {seller ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-emerald-50 flex items-center justify-center text-lg border border-emerald-100 font-black text-emerald-700 shadow-sm drop-shadow-sm">
                {(seller.name || seller.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900 mb-1">{seller.name || seller.email}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{seller.email}</p>
                <div className="mt-2">
                  {seller.inviteAccepted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">✓ Accepted</span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Pending invite</span>
                  )}
                </div>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400 font-medium">No seller assigned</p>}
        </div>
      </div>

      {/* Transaction details */}
      <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-card overflow-hidden hover:border-violet-50 transition-colors">
        <div className="flex items-center justify-between px-8 py-6 border-b-2 border-gray-50 bg-gray-50/50">
          <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase">Transaction Details</h3>
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-gray-400">
            <IconLock className="w-3.5 h-3.5" /> Locked & Verified
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Delivery type</p>
              <p className="text-sm text-gray-600">{escrow.deliveryType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Inspection period</p>
              <p className="text-sm text-gray-600">{escrow.inspectionPeriodDays} day{escrow.inspectionPeriodDays > 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <StatusBadge status={escrow.status} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Escrow ID</p>
              <p className="text-xs font-mono text-gray-600">{escrow.id.slice(0, 8)}…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Root ── */
export default function EscrowWorkspacePage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [escrow, setEscrow] = useState<EscrowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    escrowService
      .getEscrow(id)
      .then(setEscrow)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load escrow"))
      .finally(() => setLoading(false));
  }, [id]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (password: string) => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await escrowService.deleteEscrow(id, password);
      setIsDeleteModalOpen(false);
      navigate("/");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-red-600">{error || "Escrow not found."}</p>
        <Button variant="ghost" onClick={() => navigate("/")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentUserRole = escrow.participants.find((p) => p.email === currentUser?.email)?.role;
  const isBuyer = currentUserRole === "BUYER";
  const isCreator = escrow.createdByEmail === currentUser?.email;
  return (
    <>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer bg-white px-5 py-3 rounded-xl border-2 border-gray-100 shadow-sm drop-shadow-sm hover:border-gray-200"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {isCreator && (
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(true)}
              icon={<IconTrash className="w-4 h-4" />}
              className="text-red-500 hover:text-red-700 hover:p-1 bg-red-50/0 hover:bg-red-50 transition-all"
            >
              Delete Escrow
            </Button>
          )}
        </div>

        {escrow.participationMode === "AGENT" ? (
          <AgentWorkspace escrow={escrow} userEmail={currentUser?.email || ""} />
        ) : isBuyer ? (
          <BuyerWorkspace escrow={escrow} userEmail={currentUser?.email || ""} />
        ) : (
          <SellerWorkspace escrow={escrow} userEmail={currentUser?.email || ""} />
        )}

        {/* ── Danger Zone (creator only) ── */}
        {isCreator && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Danger Zone</h3>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-red-900 mb-1">Delete this escrow</p>
              <p className="text-sm text-red-700 opacity-80">
                Permanently remove this transaction. This cannot be undone. Funds must be handled before deletion.
              </p>
            </div>
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              className="!bg-red-600 hover:!bg-red-700 text-white shrink-0 shadow-sm"
              icon={<IconTrash className="w-4 h-4" />}
            >
              Delete Escrow
            </Button>
          </div>
        </div>
        )}
      </div>

      <DeleteEscrowModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </>
  );
}
