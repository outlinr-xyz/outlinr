import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { escrowService } from "../services/escrow-service";
import { formatCurrency } from "../utils/format";
import { StatCard } from "../components/common/stat-card";
import { StatusBadge } from "../components/common/status-badge";
import { Button } from "../components/common/button";
import {
  IconDollarSign,
  IconShield,
  IconActivity,
  IconAlertTriangle,
  IconClock,
  IconArrowRight,
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconEye,
  IconChevronRight,
} from "../components/common/icons";
import { useAuthStore } from "../store/auth-store";
import { KycPrompt } from "../components/common/kyc-prompt";
import { DeleteEscrowModal } from "../components/common/delete-escrow-modal";
import { useDetailPanel } from "../components/common/detail-panel";
import type { EscrowResponse } from "../types/index";

/* ── Helpers preserved ── */
function getUserRole(escrow: EscrowResponse, userEmail: string | null): string {
  if (!userEmail) return escrow.participationMode === "SELF_AS_BUYER" ? "Buyer" : "Seller";
  const self = escrow.participants.find((p) => p.email === userEmail);
  return self ? self.role.charAt(0) + self.role.slice(1).toLowerCase() : "—";
}

function getCounterparty(escrow: EscrowResponse, userEmail: string | null): { name: string; email: string } {
  const other = escrow.participants.find((p) => p.email !== userEmail);
  return {
    name: other?.name || other?.email || "—",
    email: other?.email || "",
  };
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const FINAL_STATUSES = new Set(["COMPLETED", "CANCELLED", "REFUNDED", "RESOLVED", "DELETED"]);

function EscrowQuickView({ escrow, userEmail }: { escrow: EscrowResponse; userEmail: string | null }) {
  const navigate = useNavigate();
  const { closePanel } = useDetailPanel();
  const role = getUserRole(escrow, userEmail);
  const counterparty = getCounterparty(escrow, userEmail);

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <StatusBadge status={escrow.status} />
          <span className={`text-xs font-semibold tracking-wide px-2.5 py-1 rounded-md ${role === "Buyer" ? "bg-primary-50 text-primary-700" : "bg-gray-100 text-gray-700"}`}>
            {role.toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">{escrow.title}</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">
          {formatCurrency(escrow.amount, escrow.currency)} · with {counterparty.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-1.5 uppercase">Counterparty</p>
          <p className="text-sm font-bold text-gray-900 truncate">{counterparty.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{counterparty.email}</p>
        </div>
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-1.5 uppercase">Amount</p>
          <p className="text-sm font-bold text-gray-900">{formatCurrency(escrow.amount, escrow.currency)}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-1 uppercase">Delivery Type</p>
          <p className="text-sm font-medium text-gray-900">{escrow.deliveryType}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-1 uppercase">Inspection limit</p>
            <p className="text-sm font-medium text-gray-900">{escrow.inspectionPeriodDays} day{escrow.inspectionPeriodDays > 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-1 uppercase">Created On</p>
            <p className="text-sm font-medium text-gray-900">{new Date(escrow.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-1 uppercase">Description</p>
          <p className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">{escrow.description}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <p className="text-xs font-semibold tracking-wider text-gray-400 mb-4 uppercase">Participants</p>
        <div className="space-y-3">
          {escrow.participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-100 to-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {(p.name || p.email)[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{p.name || p.email}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{p.role.toLowerCase()}</p>
                </div>
              </div>
              {p.inviteAccepted ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">✓ Accepted</span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700">Pending</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <Button
          onClick={() => { closePanel(); navigate(`/escrow/${escrow.id}/dashboard`); }}
          className="w-full justify-center bg-gray-900 text-white hover:bg-gray-800 shadow-md py-6 rounded-xl"
          icon={<IconChevronRight className="w-4 h-4" />}
        >
          Open Security Dashboard
        </Button>
        <Button variant="ghost" onClick={closePanel} className="w-full text-gray-500 hover:text-gray-900 justify-center">
          Dismiss Preview
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { openPanel } = useDetailPanel();
  const [escrows, setEscrows] = useState<EscrowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEscrows = () => {
    setLoading(true);
    escrowService.listEscrows()
      .then((data) => {
        const allEscrows = data.filter(e => e.status !== "DELETED");
        setEscrows(allEscrows);
        if (allEscrows.length > 0) setUserEmail(allEscrows[0].createdByEmail);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load escrows"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEscrows(); }, []);

  const handleDelete = async (password: string) => {
    if (!selectedEscrowId) return;
    setDeleteLoading(true);
    try {
      await escrowService.deleteEscrow(selectedEscrowId, password);
      setIsDeleteModalOpen(false);
      setSelectedEscrowId(null);
      fetchEscrows();
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeEscrows = escrows.filter((e) => !FINAL_STATUSES.has(e.status));
  const totalVolume = escrows.reduce((sum, e) => sum + e.amount, 0);
  const activeValue = activeEscrows.reduce((sum, e) => sum + e.amount, 0);
  const fundsPending = escrows.filter((e) => e.status === "DELIVERED" || e.status === "INSPECTION").reduce((sum, e) => sum + e.amount, 0);
  const disputesOpen = escrows.filter((e) => e.status === "DISPUTED").length;
  const pendingInvites = escrows.filter((e) => e.status === "PENDING_INVITE").length;

  const { user } = useAuthStore();
  const isPendingSetup = (user as any)?.accountStatus === "PENDING_SETUP";

  function SetupBanner() {
    if (!isPendingSetup) return null;
    return (
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/40 border border-amber-200/60 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 shadow-inner">
            <IconAlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-base font-bold text-amber-900 tracking-tight">Finish setting up your account</p>
            <p className="text-sm font-medium text-amber-700/80 mt-0.5">Secure your profile with a password to access all capabilities.</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate("/setup-account")}
          className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 shadow-sm shrink-0 w-full sm:w-auto justify-center"
          icon={<IconArrowRight className="w-4 h-4 ml-1" />}
        >
          Complete Setup
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin shadow-sm" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <IconAlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to connect</h3>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()} className="w-full justify-center">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      
      <div className="space-y-4">
        <SetupBanner />
        <KycPrompt />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Volume" value={formatCurrency(totalVolume)} icon={<IconDollarSign className="w-4 h-4" />} />
        <StatCard label="Active Escrow" value={formatCurrency(activeValue)} icon={<IconShield className="w-4 h-4" />} highlight />
        <StatCard label="Funds Pending" value={formatCurrency(fundsPending)} icon={<IconActivity className="w-4 h-4" />} />
        <StatCard label="Open Disputes" value={String(disputesOpen)} icon={<IconAlertTriangle className="w-4 h-4" />} highlight={disputesOpen > 0} />
        <StatCard label="Invites Sent" value={String(pendingInvites)} icon={<IconClock className="w-4 h-4" />} highlight={pendingInvites > 0} />
      </div>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Active Escrows</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Review and manage your securely held transactions.</p>
          </div>
          <Button icon={<IconPlus className="w-4 h-4" />} onClick={() => navigate("/escrow/new")} className="shadow-sm">
            New Transaction
          </Button>
        </div>

        {escrows.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-50/80 border border-gray-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <IconShield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No active transactions</h3>
            <p className="text-sm font-medium text-gray-500 mt-1.5 max-w-sm mx-auto">
              Initiate your first secure escrow transaction to hold funds safely until both parties are satisfied.
            </p>
            <Button icon={<IconPlus className="w-4 h-4" />} onClick={() => navigate("/escrow/new")} className="mt-6 shadow-sm">
              Start an Escrow
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200/70 bg-gray-50/50">
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Transaction</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Party</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Value</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">State</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Updated</th>
                    <th className="w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {escrows.filter(e => e.status !== "DELETED").map((escrow) => {
                    const role = getUserRole(escrow, userEmail);
                    const counterparty = getCounterparty(escrow, userEmail);

                    return (
                      <tr
                        key={escrow.id}
                        onClick={() => navigate(`/escrow/${escrow.id}/dashboard`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 tracking-tight">{escrow.title}</span>
                            <span className="text-xs font-medium text-gray-400 mt-0.5 font-mono">#{escrow.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-bold text-gray-700">{counterparty.name}</span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${role === "Buyer" ? "bg-primary-50 text-primary-700" : "bg-gray-100 text-gray-700"}`}>
                            {role}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap font-extrabold text-gray-900 tracking-tight">
                          {formatCurrency(escrow.amount, escrow.currency)}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <StatusBadge status={escrow.status} />
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-gray-500">
                          {relativeTime(escrow.updatedAt)}
                        </td>
                        <td className="px-4 py-4.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPanel(<EscrowQuickView escrow={escrow} userEmail={userEmail} />);
                              }}
                              className="p-2 rounded-lg bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-primary-600 hover:border-primary-100 transition-all cursor-pointer"
                            >
                              <IconEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEscrowId(escrow.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {escrows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6 flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1.5">Aggregate Total</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">{escrows.length}</p>
            <p className="text-sm font-medium text-gray-500 mt-2">{activeEscrows.length} active engagements</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6 flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1.5">Platform Dispute Rate</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
              {escrows.length > 0 ? `${((escrows.filter(e => e.status === "DISPUTED" || e.status === "RESOLVED").length / escrows.length) * 100).toFixed(1)}%` : "0%"}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-2">{escrows.filter(e => e.status === "DISPUTED" || e.status === "RESOLVED").length} of {escrows.length} total txns</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-md p-6 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-bold text-gray-400/80 tracking-widest uppercase mb-1.5 relative z-10">Settled Value</p>
            <p className="text-3xl font-extrabold text-white tracking-tight leading-none relative z-10">
              {formatCurrency(escrows.filter((e) => e.status === "COMPLETED").reduce((sum, e) => sum + e.amount, 0))}
            </p>
            <p className="text-sm font-medium text-emerald-400 mt-2 relative z-10">
              ✓ {escrows.filter((e) => e.status === "COMPLETED").length} successfully realized
            </p>
          </div>
        </div>
      )}

      <DeleteEscrowModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} loading={deleteLoading} />
    </div>
  );
}
