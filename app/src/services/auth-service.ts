import { api } from "./api-client";
import type { LoginCredentials, RegisterCredentials, User } from "../types/auth";
import type { AuthResponse, AuthResult } from "../types/index";

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return api<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
            skipRefresh: true,
        });
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        return api<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(credentials),
            skipRefresh: true,
        });
    },

    async logout(): Promise<void> {
        await api("/auth/logout", {
            method: "POST",
            skipRefresh: true,
        });
    },

    async getCurrentUser(): Promise<User> {
        return api<User>("/auth/me", {
            skipRefresh: true,
        });
    },

    async refreshToken(): Promise<AuthResponse> {
        return api<AuthResponse>("/auth/refresh", {
            method: "POST",
            skipRefresh: true,
        });
    },

    async completeSetup(data: { password: string; name: string; accountType: string }): Promise<AuthResult> {
        return api<AuthResult>("/auth/complete-setup", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};
