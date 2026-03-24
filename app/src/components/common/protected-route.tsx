import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../../store/auth-store";

export function ProtectedRoute() {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }

    return <Outlet />;
}
