import { createBrowserRouter } from "react-router";
import AppLayout from "../components/layout/app-layout";
import DashboardPage from "../pages/dashboard-page";
import CreateEscrowPage from "../pages/create-escrow-page";
import EscrowWorkspacePage from "../pages/escrow-workspace-page";
import EscrowDashboardPage from "../pages/escrow-dashboard-page";
import SellerAcceptPage from "../pages/seller-accept-page";
import AdminDisputePage from "../pages/admin-dispute-page";
import DisputeTrackingPage from "../pages/dispute-tracking-page";
import AccountPage from "../pages/account-page";
import LoginPage from "../pages/login-page";
import RegisterPage from "../pages/register-page";
import KycPage from "../pages/kyc-page";
import VerifyPaymentPage from "../pages/verify-payment-page";
import SetupAccountPage from "../pages/setup-account-page";
import { ProtectedRoute } from "../components/common/protected-route";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        path: "/escrow/:id/accept",
        element: <SellerAcceptPage />
    },
    {
        // New canonical invite URL — uses invite token not escrow ID
        path: "/invite/:token",
        element: <SellerAcceptPage />
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "escrow/new", element: <CreateEscrowPage /> },
                    { path: "escrow/:id", element: <EscrowWorkspacePage /> },
                    { path: "escrow/:id/dashboard", element: <EscrowDashboardPage /> },

                    { path: "escrow/:id/verify-payment", element: <VerifyPaymentPage /> },
                    { path: "disputes", element: <DisputeTrackingPage /> },
                    { path: "account", element: <AccountPage /> },
                    { path: "kyc", element: <KycPage /> },
                    { path: "admin", element: <AdminDisputePage /> },
                    { path: "setup-account", element: <SetupAccountPage /> },
                    { path: "*", element: <DashboardPage /> }
                ]
            }
        ]
    }
]);
