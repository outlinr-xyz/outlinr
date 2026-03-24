import { api } from "./api-client";

export interface IdentityVerificationRequest {
  kycType: string;
  kycId: string;
  bankAccountNumber: string;
  bankCode: string;
}

export interface IdentityVerificationResponse {
  verified: boolean;
  message: string;
  matchScore: string;
}

export const identityService = {
  async verifyIdentity(
    request: IdentityVerificationRequest,
  ): Promise<IdentityVerificationResponse> {
    return api<IdentityVerificationResponse>("/identity/verify", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};
