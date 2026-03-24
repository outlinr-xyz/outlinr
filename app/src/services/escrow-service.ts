import { api } from "./api-client";
import type {
    CreateEscrowRequest,
    EscrowResponse,
    EscrowStatus,
    InvitePreviewResponse,
    AuthResult,
} from "../types/index";

export const escrowService = {
    async createEscrow(request: CreateEscrowRequest): Promise<EscrowResponse> {
        return api<EscrowResponse>("/escrows", {
            method: "POST",
            body: JSON.stringify(request),
        });
    },

    async getEscrow(id: string): Promise<EscrowResponse> {
        return api<EscrowResponse>(`/escrows/${id}`);
    },

    async listEscrows(status?: EscrowStatus): Promise<EscrowResponse[]> {
        const query = status ? `?status=${status}` : "";
        return api<EscrowResponse[]>(`/escrows${query}`);
    },

    async transitionStatus(
        id: string,
        toStatus: EscrowStatus,
        reason?: string,
    ): Promise<EscrowResponse> {
        return api<EscrowResponse>(`/escrows/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ toStatus, reason }),
        });
    },

    async acceptInvite(inviteToken: string): Promise<AuthResult> {
        return api<AuthResult>("/escrows/invite/accept", {
            method: "POST",
            body: JSON.stringify({ inviteToken }),
            skipRefresh: true,
        });
    },

    async getInvitePreview(token: string): Promise<InvitePreviewResponse> {
        return api<InvitePreviewResponse>(
            `/escrows/invite/preview?token=${token}`,
            { skipRefresh: true },
        );
    },

    async deleteEscrow(id: string, password: string): Promise<void> {
        return api<void>(`/escrows/${id}`, {
            method: "DELETE",
            body: JSON.stringify({ password }),
        });
    },

    async initNewPayment(request: CreateEscrowRequest): Promise<any> {
        return api<any>("/payments/init-new", {
            method: "POST",
            body: JSON.stringify(request),
        });
    },

    async verifyAndCreate(data: {
        txnRef: string;
        amount: number;
        escrowData: CreateEscrowRequest;
    }): Promise<EscrowResponse> {
        return api<EscrowResponse>("/escrows/verify-and-create", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};
