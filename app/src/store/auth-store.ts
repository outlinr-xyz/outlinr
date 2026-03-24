import { create } from "zustand";
import type { User, LoginCredentials, RegisterCredentials } from "../types/auth";
import { authService } from "../services/auth-service";
import type { AuthResult } from "../types/index";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    initialize: () => Promise<void>;
    login: (credentials: LoginCredentials) => Promise<void>;
    loginWithResult: (result: AuthResult) => void;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    initialize: async () => {
        try {
            set({ isLoading: true });
            const user = (await authService.getCurrentUser()) as any;
            set({ user, isAuthenticated: true, isLoading: false });
        } catch {
            // Try refreshing the token
            try {
                const response = await authService.refreshToken();
                set({ user: response.user as any, isAuthenticated: true, isLoading: false });
            } catch {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        }
    },

    login: async (credentials) => {
        try {
            set({ error: null, isLoading: true });
            const response = await authService.login(credentials);
            set({ user: response.user as any, isAuthenticated: true, isLoading: false });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Login failed";
            set({ error: message, isLoading: false });
            throw e;
        }
    },

    loginWithResult: (result: AuthResult) => {
        set({
            user: result.response.user as any,
            isAuthenticated: true,
            isLoading: false,
            error: null
        });
    },

    register: async (credentials) => {
        try {
            set({ error: null, isLoading: true });
            const response = await authService.register(credentials);
            set({ user: response.user as any, isAuthenticated: true, isLoading: false });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Registration failed";
            set({ error: message, isLoading: false });
            throw e;
        }
    },

    logout: async () => {
        try {
            await authService.logout();
        } finally {
            set({ user: null, isAuthenticated: false, error: null });
        }
    },

    clearError: () => set({ error: null }),

    setUser: (user: User) => set({ user }),
}));
