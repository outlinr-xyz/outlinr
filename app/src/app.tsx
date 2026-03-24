import { RouterProvider } from "react-router";
import { router } from "./routes/app-router";

export const App = () => {
  return <RouterProvider router={router} />;
};
