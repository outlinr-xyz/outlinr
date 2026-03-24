import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { escrowService } from "../services/escrow-service";
import { Button } from "../components/common/button";
import {
    IconArrowLeft,
    IconCheck,
    IconX,
    IconTrash,
} from "../components/common/icons";
import { formatCurrency } from "../utils/format";
import { DeleteEscrowModal } from "../components/common/delete-escrow-modal";
import { useAuthStore } from "../store/auth-store";
import type { EscrowResponse } from "../types/index";

export default function EscrowDashboardPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [escrow, setEscrow] = useState<EscrowResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const currentUser = useAuthStore((state) => state.user);

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

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        escrowService
            .getEscrow(id)
            .then(setEscrow)
            .catch(() => {
                // If escrow not found (404), redirect to dashboard
                navigate("/");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-primary-500 rounded-full animate-spin mb-6 shadow-sm" />
                <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Loading escrow…</p>
            </div>
        );
    }

    if (error || !escrow) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-red-50 border-2 border-red-100 mb-6 drop-shadow-sm">
                    <IconX className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Escrow Not Found</h2>
                <p className="text-base font-medium text-red-500">{error || "The requested escrow does not exist or you lack permission."}</p>
                <Button variant="ghost" onClick={() => navigate("/")} className="mt-8 rounded-xl font-bold border-2">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const currentUserRole = escrow.participants.find((p) => p.email === currentUser?.email)?.role;
    const buyerParticipant = escrow.participants.find((p) => p.role === "BUYER");

    // Banner content based on user's role and escrow status
    const bannerContent = (() => {
        if (escrow.status === "AWAITING_FUNDING") {
            if (currentUserRole === "BUYER") {
                return {
                    icon: "✅",
                    title: "Escrow accepted!",
                    description: `Fund it now to secure the transaction and notify the seller to begin delivery.`,
                    action: (
                        <Button className="mt-2 h-14 px-6 rounded-2xl text-base font-extrabold shadow-md hover:shadow-lg transition-transform active:scale-[0.98]" onClick={() => navigate(`/workspace/${escrow.id}`)}>
                            💳 Fund Escrow — {formatCurrency(escrow.amount, escrow.currency)}
                        </Button>
                    ),
                };
            } else if (currentUserRole === "SELLER") {
                return {
                    icon: "✅",
                    title: "Escrow created!",
                    description: `Waiting for ${buyerParticipant?.name || buyerParticipant?.email || "the buyer"} to fund it. An invite was sent to ${buyerParticipant?.email}. You'll be notified when funds are secured.`,
                    action: null,
                };
            }
        } else if (escrow.status === "PENDING_INVITE") {
            if (currentUserRole === "SELLER") {
                return {
                    icon: "✅",
                    title: "Escrow created!",
                    description: `The buyer has requested an escrow. Accept it to proceed.`,
                    action: (
                        <Button className="mt-2 h-14 px-6 rounded-2xl text-base font-extrabold shadow-md hover:shadow-lg transition-transform active:scale-[0.98]" onClick={() => navigate(`/workspace/${escrow.id}`)}>
                            View Agreement Details
                        </Button>
                    ),
                };
            } else if (currentUserRole === "BUYER") {
                return {
                    icon: "✅",
                    title: "Escrow created!",
                    description: `Waiting for the seller to accept your invitation to the escrow.`,
                    action: null,
                };
            }
        }
        
        switch (escrow.participationMode) {
            case "AGENT":
                return {
                    icon: "✅",
                    title: "Escrow created!",
                    description: `Invites sent to both parties. The escrow activates once the buyer funds it.`,
                    action: null,
                };
            default:
                return null;
        }
    })();

    const statusLabel: Record<string, { label: string; color: string }> = {
        PENDING_INVITE: { label: "Pending Invite", color: "bg-amber-100 text-amber-700" },
        AWAITING_FUNDING: { label: "Awaiting Funding", color: "bg-blue-100 text-blue-700" },
        FUNDED: { label: "Funded", color: "bg-emerald-100 text-emerald-700" },
        DELIVERY_IN_PROGRESS: { label: "Delivery In Progress", color: "bg-indigo-100 text-indigo-700" },
        DELIVERED: { label: "Delivered", color: "bg-teal-100 text-teal-700" },
        INSPECTION: { label: "Inspection", color: "bg-orange-100 text-orange-700" },
        COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
        DISPUTED: { label: "Disputed", color: "bg-red-100 text-red-700" },
        RESOLVED: { label: "Resolved", color: "bg-gray-100 text-gray-700" },
        REFUNDED: { label: "Refunded", color: "bg-purple-100 text-purple-700" },
        CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
    };

    const statusInfo = statusLabel[escrow.status] || { label: escrow.status, color: "bg-gray-100 text-gray-600" };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            {/* ── Back ── */}
            <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-8 cursor-pointer bg-white px-4 py-2.5 rounded-xl border-2 border-gray-100 shadow-sm drop-shadow-sm"
            >
                <IconArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            {/* ── What Happens Next Banner ── */}
            {!bannerDismissed && bannerContent && (
                <div className="relative mb-10 p-8 rounded-[2rem] border-2 border-emerald-500/20 bg-emerald-50 shadow-sm drop-shadow-sm overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <button
                        onClick={() => setBannerDismissed(true)}
                        className="absolute top-6 right-6 text-emerald-500 hover:text-emerald-700 bg-emerald-100/50 p-2 rounded-xl cursor-pointer transition-colors z-10"
                    >
                        <IconX className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col sm:flex-row items-start gap-5 relative z-10">
                        <div className="flex-shrink-0 w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-100">
                            {bannerContent.icon}
                        </div>
                        <div className="flex-1 mt-1">
                            <h2 className="text-xl font-extrabold text-emerald-900 tracking-tight">{bannerContent.title}</h2>
                            <p className="text-base font-medium text-emerald-800/80 mt-2 leading-relaxed max-w-2xl">{bannerContent.description}</p>
                            {bannerContent.action && (
                                <div className="mt-6">
                                    {bannerContent.action}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Escrow Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {escrow.title}
                    </h1>
                    <p className="text-base font-medium text-gray-500 mt-3 max-w-2xl leading-relaxed">{escrow.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${statusInfo.color.replace('bg-', 'bg-opacity-20 border-').replace('text-', 'text-opacity-90 text-')}`}>
                        <span className="inline-block w-2 h-2 rounded-full mr-2 opacity-70" style={{ backgroundColor: 'currentColor' }} />
                        {statusInfo.label}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="h-10 px-4 rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-bold transition-colors shadow-sm"
                        icon={<IconTrash className="w-4 h-4" />}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <DeleteEscrowModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />

            {/* ── Details Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Financials */}
                <div className="rounded-[2rem] border-2 border-gray-100 bg-white shadow-card p-8 hover:border-primary-100 transition-colors group">
                    <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                        Financial Details
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                            <span className="text-sm font-bold text-gray-500">Amount Secured</span>
                            <span className="text-2xl font-black text-gray-900 tracking-tight flex items-baseline gap-1">
                                {formatCurrency(escrow.amount, escrow.currency)}
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{escrow.currency}</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between pb-2">
                            <span className="text-sm font-bold text-gray-500">Auto-release active</span>
                            <span className={`text-sm font-bold px-3 py-1 rounded-lg ${escrow.autoRelease ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {escrow.autoRelease ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Parties */}
                <div className="rounded-[2rem] border-2 border-gray-100 bg-white shadow-card p-8 hover:border-primary-100 transition-colors">
                    <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6">Participating Parties</p>
                    <div className="space-y-4">
                        {escrow.participants.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-[1.25rem] bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-[1rem] bg-white border border-gray-200 text-gray-900 flex items-center justify-center text-lg font-black shadow-sm drop-shadow-sm">
                                        {(p.name || p.email)[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            {p.name || p.email}
                                            {p.email === escrow.createdByEmail && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">You</span>
                                            )}
                                        </p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{p.role}</p>
                                    </div>
                                </div>
                                <div>
                                    {p.inviteAccepted ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                                            <IconCheck className="w-3.5 h-3.5" /> Accepted
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">Pending</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery */}
                <div className="rounded-[2rem] border-2 border-gray-100 bg-white shadow-card p-8 hover:border-primary-100 transition-colors">
                    <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6">Logistics & Delivery</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-[1.25rem]">
                            <span className="text-sm font-bold text-gray-500">Method</span>
                            <span className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">{escrow.deliveryType}</span>
                        </div>
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-bold text-gray-500">Proof Required</span>
                            <span className="text-sm font-extrabold text-gray-900">{escrow.requireProofOfDelivery ? "Yes, strict verification" : "No"}</span>
                        </div>
                        {escrow.shippingResponsibility && (
                            <div className="flex justify-between items-center px-2">
                                <span className="text-sm font-bold text-gray-500">Shipping responsibility</span>
                                <span className="text-sm font-extrabold text-gray-900">{escrow.shippingResponsibility}</span>
                            </div>
                        )}
                        {escrow.expectedDeliveryDays && (
                            <div className="flex justify-between items-center px-2">
                                <span className="text-sm font-bold text-gray-500">Expected ETA</span>
                                <span className="text-sm font-extrabold text-gray-900">{escrow.expectedDeliveryDays} Days</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Terms */}
                <div className="rounded-[2rem] border-2 border-gray-100 bg-white shadow-card p-8 hover:border-primary-100 transition-colors bg-gradient-to-br from-white to-gray-50/50">
                    <p className="text-xs font-extrabold text-gray-400 tracking-widest uppercase mb-6">Agreed Terms</p>
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">Inspection Window</span>
                            <span className="text-sm font-extrabold text-gray-900 bg-white p-2 px-3 rounded-lg border shadow-sm">
                                {escrow.inspectionPeriodDays} Day{escrow.inspectionPeriodDays > 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">Dispute Escalation Period</span>
                            <span className="text-sm font-extrabold text-gray-900">{escrow.disputeWindowHours} Hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">Staged Milestones</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${escrow.milestoneEnabled ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                                {escrow.milestoneEnabled ? "Active" : "Disabled"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
