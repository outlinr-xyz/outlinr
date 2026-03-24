import { api } from "./api-client";
import type { Dispute, DisputeEvidence } from "../types";

export const disputeService = {
  // Get all disputes for the current user
  async listUserDisputes(): Promise<Dispute[]> {
    return api<Dispute[]>("/disputes");
  },

  // Get a specific dispute
  async getDispute(id: string): Promise<Dispute> {
    return api<Dispute>(`/disputes/${id}`);
  },

  // Raise a new dispute
  async raiseDispute(escrowId: string, reason: string): Promise<Dispute> {
    return api<Dispute>(`/disputes/escrow/${escrowId}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Upload evidence (requires FormData, so we fetch directly to bypass default application/json headers)
  async uploadEvidence(disputeId: string, file: File): Promise<DisputeEvidence> {
    const formData = new FormData();
    formData.append("file", file);

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const res = await fetch(`${API_BASE}/api/v1/disputes/${disputeId}/evidence`, {
      method: "POST",
      body: formData,
      // browser automatically sets multipart/form-data with boundaries
      credentials: "include", 
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Failed to upload evidence" }));
      throw new Error(err.message || "Upload failed");
    }

    return res.json();
  },

  // List ALL disputes (admin)
  async listAllDisputes(): Promise<Dispute[]> {
    return api<Dispute[]>("/disputes/all");
  },

  // Resolve a dispute (admin)
  async resolveDispute(id: string, resolution: string, adminNotes: string): Promise<Dispute> {
    return api<Dispute>(`/disputes/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution, adminNotes }),
    });
  },
};
