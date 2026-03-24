import { useState, useEffect } from "react";
import { disputeService } from "../services/dispute-service";
import { StatusBadge } from "../components/common/status-badge";
import { Button } from "../components/common/button";
import { useDetailPanel } from "../components/common/detail-panel";
import {
  IconAlertTriangle,
  IconClock,
  IconUpload,
  IconCheck,
  IconChevronRight,
} from "../components/common/icons";
import type { Dispute } from "../types/index";

/* ── Evidence Upload Modal (UI-only) ── */
function EvidenceForm({ disputeId, onClose, onSuccess }: { disputeId: string; onClose: () => void, onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    try {
      await disputeService.uploadEvidence(disputeId, file);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to upload evidence");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Submit Evidence</h3>
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          Cancel
        </button>
      </div>
      
      {error && <p className="text-xs text-red-500">{error}</p>}
      
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors relative h-full">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <IconUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          {file ? file.name : "Drop files here or click to upload"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Images, PDFs, or documents — max 10MB
        </p>
      </div>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Uploading..." : "Submit Evidence"}
      </Button>
    </div>
  );
}

/* ── Dispute Detail (shown in right panel) ── */
function DisputeDetail({ dispute }: { dispute: Dispute }) {
  const isResolved = dispute.status === "RESOLVED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge
            status={
              dispute.status === "RESOLVED" ? "COMPLETED" : "DISPUTED"
            }
          />
          <span className="text-xs text-gray-400">{dispute.escrowId.substring(0, 8)}...</span>
        </div>
        <p className="text-lg font-semibold text-gray-900">
          {dispute.reason}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Raised by {dispute.raisedBy} · Filed{" "}
          {new Date(dispute.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-1 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Raised By</p>
          <p className="text-sm font-medium text-gray-900">{dispute.raisedBy || "Participant"}</p>
        </div>
        <div className="bg-surface-1 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Created At</p>
          <p className="text-sm font-medium text-gray-900">{new Date(dispute.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Evidence */}
      <div>
        <p className="text-xs font-medium text-gray-400 tracking-wide mb-3">
          EVIDENCE SUBMITTED
        </p>
        {dispute.evidence.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No evidence uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {dispute.evidence.map((ev, i) => (
              <div key={ev.id || i} className="bg-white rounded-xl border border-gray-200/60 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 font-medium">{ev.originalFileName}</p>
                  <p className="text-xs text-gray-500">Uploaded by {ev.uploadedBy}</p>
                </div>
                <a href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + ev.fileUrl : 'http://localhost:8080' + ev.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Decision */}
      {isResolved && (
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconCheck className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">Resolution</p>
          </div>
          <p className="text-sm text-emerald-700 leading-relaxed">
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

      {!isResolved && (
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconClock className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">Under Review</p>
          </div>
          <p className="text-sm text-amber-700 leading-relaxed mb-4">
            The platform is reviewing the evidence submitted by both parties.
            You will be notified when a decision is made.
          </p>
        </div>
      )}

      {/* Timeline Placeholder */}
    </div>
  );
}

export default function DisputeTrackingPage() {
  const { openPanel } = useDetailPanel();
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const data = await disputeService.listUserDisputes();
      setDisputes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Your Disputes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track dispute progress and submit evidence
          </p>
        </div>
      </div>

      {/* Evidence Upload */}
      {showEvidenceForm && activeDisputeId && (
        <EvidenceForm 
          disputeId={activeDisputeId} 
          onClose={() => setShowEvidenceForm(false)} 
          onSuccess={fetchDisputes}
        />
      )}

      {/* Dispute Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-500 text-sm">Loading disputes...</div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="w-full text-left bg-white rounded-2xl border border-gray-200/60 shadow-card transition-all overflow-hidden flex flex-col">
              <button
                onClick={() => openPanel(<DisputeDetail dispute={dispute} />)}
                className="w-full p-5 text-left hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${dispute.status === "RESOLVED"
                        ? "bg-emerald-100"
                        : "bg-red-100"
                        }`}
                    >
                      {dispute.status === "RESOLVED" ? (
                        <IconCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <IconAlertTriangle
                          className="w-5 h-5 text-red-600"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {dispute.reason}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Escrow: {dispute.escrowId.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <StatusBadge
                    status={
                      dispute.status === "RESOLVED" ? "COMPLETED" : "DISPUTED"
                    }
                  />
                  <span className="text-xs text-gray-400">
                    Raised by {dispute.raisedBy}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
              
              {/* Actions Footer */}
              {dispute.status !== 'RESOLVED' && (
                <div className="bg-gray-50 p-3 px-5 border-t border-gray-100">
                  <Button 
                    variant="secondary" 
                    className="w-full text-sm py-2 bg-white border border-gray-200" 
                    onClick={() => {
                        setActiveDisputeId(dispute.id);
                        setShowEvidenceForm(true);
                    }}
                  >
                    Upload Evidence
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && disputes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-surface-1 flex items-center justify-center mx-auto mb-4">
            <IconAlertTriangle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No disputes to show</p>
          <p className="text-xs text-gray-400 mt-1">
            Disputes appear here when you or your counterparty raises an issue
          </p>
        </div>
      )}
    </div>
  );
}
