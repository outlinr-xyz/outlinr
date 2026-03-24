export interface User {
    id: string;
    name: string;
    email: string;
    accountType: string;
    accountStatus: "ACTIVE" | "PENDING_SETUP";
    userTier: "PARTIAL" | "FULL" | "AGENT";
    identityVerified: boolean;
    kycType?: string;
    kycId?: string;
    hasBankAccount: boolean;
    bankAccountNumberMasked: string | null;
    bankCode: string | null;
    bankName: string | null;
}


export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    accountType: "individual" | "company";
}

export interface AuthResponse {
    message: string;
    user: User;
}
