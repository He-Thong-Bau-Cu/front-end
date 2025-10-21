import LoginScreen from "../pages/Login";
import PublicRoute from "../components/auth/PublicRoute";
import NotFound404 from "../pages/NotFound404";
import Forbidden403 from "../pages/Forbidden403";
import { Navigate } from "react-router-dom";
import Dashboard from "@/pages/admin/Dashboard";
import ManagementUser from "@/pages/admin/ManagementUser";
import AdminLayout from "@/layout/AdimLayout";
import Statisctics from "@/pages/admin/Statistics";
import ManagementRole from "@/pages/admin/ManagementRole";
import VoterLayout from "@/layout/VoterLayout";
import DashboardVoter from "@/pages/voter/Dashboard";

export const publicRoutes = [
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginScreen />
      </PublicRoute>
    ),
  },
  { path: "/403", element: <Forbidden403 /> },
  { path: "/404", element: <NotFound404 /> },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/404" replace /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "user", element: <ManagementUser /> },
      { path: "statistics", element: <Statisctics /> },
      { path: "roles", element: <ManagementRole /> },

    ],
  },
  {
    path: "/",
    element: <VoterLayout />,
    children: [
      { index: true, element: <DashboardVoter /> },
      { path: "authorization", element: <DashboardVoter /> },
      // { path: "statistics", element: <Statisctics /> },
      // { path: "roles", element: <ManagementRole /> },

    ],
  },

];
