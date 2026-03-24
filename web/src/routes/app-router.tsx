import { createBrowserRouter } from "react-router";
import { LandingPage } from "../pages/landing-page";
import { ComingSoonPage } from "../pages/coming-soon-page";
import { NotFoundPage } from "../pages/not-found-page";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/docs",
        element: <ComingSoonPage />,
    },
    {
        path: "/coming-soon",
        element: <ComingSoonPage />,
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
