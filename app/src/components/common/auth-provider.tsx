import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../../store/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
    const { initialize, isLoading } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Loading…</p>
                </div>
            </div>
        );
    }

    return children;
}
