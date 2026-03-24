import { useState, useEffect } from "react";
import { disputeService } from "../services/dispute-service";
import { StatusBadge } from "../components/common/status-badge";
import { Button } from "../components/common/button";
import {
  IconGavel,
  IconCheck,
  IconRefresh,
  IconArrowLeft,
  IconClock,
  IconAlertTriangle,
} from "../components/common/icons";
import AdminGate from "../components/common/admin-gate";
import type { Dispute } from "../types/index";

/** Compute how many days a dispute has been open */
function daysOpen(dispute: Dispute): number {
  const created = new Date(dispute.createdAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((now - created) / (1000 * 60 * 60 * 24)));
}

export default function AdminDisputePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const data = await disputeService.listAllDisputes();
      setDisputes(data);
    } catch (e) {
      console.error("Failed to fetch disputes", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) fetchDisputes();
  }, [authenticated]);

  if (!authenticated) {
    return <AdminGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (selectedDispute) {
    return (
      <DisputeDetail
        dispute={selectedDispute}
        onBack={() => setSelectedDispute(null)}
        onResolved={() => {
          setSelectedDispute(null);
          fetchDisputes();
        }}
      />
    );
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dispute Resolution Board
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {disputes.length} disputes requiring attention
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium">
            <IconAlertTriangle className="w-3.5 h-3.5" />
            {disputes.filter((d) => d.status === "OPEN").length} Open
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium">
            <IconClock className="w-3.5 h-3.5" />
            {disputes.filter((d) => d.status === "UNDER_REVIEW").length}{" "}
            Under Review
          </div>
        </div>
      </div>

      {/* ── Dispute Table ── */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-500 text-sm">Loading disputes...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-surface-1/50">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 tracking-wide">
                    ESCROW ID
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 tracking-wide">
                    RAISED BY
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 tracking-wide">
                    REASON
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 tracking-wide">
                    STATUS
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 tracking-wide">
                    CREATED
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 tracking-wide">
                    DAYS OPEN
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputes.map((dispute) => (
                  <tr
                    key={dispute.id}
                    onClick={() => setSelectedDispute(dispute)}
                    className="hover:bg-surface-1/50 cursor-pointer transition-colors duration-100"
                  >
                    <td className="px-5 py-4 font-mono text-gray-600">
                      {dispute.escrowId.substring(0, 8)}...
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {dispute.raisedBy}
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">
                      {dispute.reason}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          dispute.status === "RESOLVED"
                            ? "COMPLETED"
                            : "DISPUTED"
                        }
                      />
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-medium ${daysOpen(dispute) > 14 ? "text-red-600" : "text-gray-600"}`}
                      >
                        {daysOpen(dispute)}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Dispute Detail View ── */
function DisputeDetail({
  dispute,
  onBack,
  onResolved,
}: {
  dispute: Dispute;
  onBack: () => void;
  onResolved: () => void;
}) {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async (resolution: "REFUNDED" | "RELEASED") => {
    setIsResolving(true);
    try {
      await disputeService.resolveDispute(dispute.id, resolution, "");
      onResolved();
    } catch (e) {
      console.error("Failed to resolve dispute", e);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
      >
        <IconArrowLeft className="w-4 h-4" />
        Back to Disputes
      </button>

      {/* ── Dispute Header ── */}
      <div className="bg-red-50 rounded-2xl p-6 border border-red-100 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <IconGavel className="w-5 h-5 text-red-600" />
          <StatusBadge
            status={
              dispute.status === "RESOLVED" ? "COMPLETED" : "DISPUTED"
            }
          />
          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
            {daysOpen(dispute)} days open
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {dispute.reason}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Escrow: {dispute.escrowId} · Raised by {dispute.raisedBy}
        </p>
      </div>

      {/* ── Evidence Section ── */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-card mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Evidence Submitted
          </h3>
        </div>
        <div className="p-6">
          {dispute.evidence.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No evidence uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {dispute.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between bg-surface-1 rounded-xl p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ev.originalFileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded by {ev.uploadedBy} ·{" "}
                      {new Date(ev.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={
                      (import.meta.env.VITE_API_URL || "http://localhost:8080") +
                      ev.fileUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Actions ── */}
      {dispute.status !== "RESOLVED" && (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Resolution</h3>
          <p className="text-xs text-gray-500 mb-4">
            Choose an action to resolve this dispute. This action is final and
            will trigger the corresponding financial outcome.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<IconRefresh className="w-4 h-4" />}
              onClick={() => handleResolve("REFUNDED")}
              disabled={isResolving}
            >
              Refund Buyer
            </Button>
            <Button
              icon={<IconCheck className="w-4 h-4" />}
              onClick={() => handleResolve("RELEASED")}
              disabled={isResolving}
            >
              Release to Seller
            </Button>
          </div>
        </div>
      )}

      {dispute.status === "RESOLVED" && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-2">
            <IconCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-emerald-800">Resolved</h3>
          </div>
          <p className="text-sm text-emerald-700">
            {dispute.resolution === "REFUNDED"
              ? "Funds have been refunded to the buyer."
              : "Funds have been released to the seller."}
          </p>
          {dispute.adminNotes && (
            <p className="text-xs text-emerald-600 mt-2 italic">
              Admin note: {dispute.adminNotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
