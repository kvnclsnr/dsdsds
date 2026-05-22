import { createBrowserRouter } from "react-router";
import { MobileLayout } from "./layout/MobileLayout";
import { Dashboard } from "./pages/Dashboard";
import { DrawingRoute } from "./pages/DrawingRoute";
import { DefineChange } from "./pages/DefineChange";
import { Analysis } from "./pages/Analysis";
import { History } from "./pages/History";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MobileLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "new-route", Component: DrawingRoute },
      { path: "define-change", Component: DefineChange },
      { path: "analysis", Component: Analysis },
      { path: "history", Component: History },
      { path: "profile", Component: Profile },
      { path: "*", Component: History }
    ],
  },
]);