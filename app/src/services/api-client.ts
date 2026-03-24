const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_URL = `${API_BASE}/api/v1`;

interface ApiOptions extends RequestInit {
    skipRefresh?: boolean;
}

class ApiError extends Error {
    status: number;
    constructor(
        status: number,
        message: string,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function refreshAccessToken(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function api<T>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    const { skipRefresh = false, ...fetchOptions } = options;

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
        },
    });

    if (res.status === 401 && !skipRefresh) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
                ...fetchOptions,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...fetchOptions.headers,
                },
            });

            if (retryRes.ok) {
                if (retryRes.status === 204 || retryRes.status === 205) {
                    return null as any as T;
                }
                const text = await retryRes.text();
                return text ? JSON.parse(text) : null as any as T;
            }
        }

        // Refresh failed — redirect to login
        window.location.href = "/login";
        throw new ApiError(401, "Session expired");
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Request failed" }));
        throw new ApiError(res.status, body.message || "Request failed");
    }

    if (res.status === 204 || res.status === 205) {
        return null as any as T;
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null as any as T;
}
