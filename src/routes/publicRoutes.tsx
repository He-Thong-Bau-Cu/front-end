import LoginScreen from "../pages/user/Login";
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
import ForgotPasswordScreen from "@/pages/user/ForgotPasswordScreen";
import VerifyEmailScreen from "@/pages/user/VerifyEmailScreen";
import BallotList from "@/pages/voter/BallotList";
import CumulativeVoting from "@/pages/voter/CumulativeVoting";
import ResolutionVoting from "@/pages/voter/ResolutionVoting";
import VoteSuccess from "@/pages/voter/VoteSuccess";

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
    path: "/forgotPassword",
    element: (
      <PublicRoute>
        <ForgotPasswordScreen />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <PublicRoute>
        <VerifyEmailScreen />
      </PublicRoute>
    ),
  },
  
  {
    path: "/",
    element: <VoterLayout />,
    children: [
      { index: true, element: <DashboardVoter /> },
      { path: "authorization", element: <DashboardVoter /> },
      { path: "ballots", element: <BallotList/>},
      { path: "ballot_cumulative_voting", element: <CumulativeVoting/>},
      { path: "ballot_resolution_voting", element: <ResolutionVoting/>},
      

      // { path: "statistics", element: <Statisctics /> },
      // { path: "roles", element: <ManagementRole /> },

    ],
  },
  {
    path: "/vote-success",
    element: (
      <PublicRoute>
        <VoteSuccess />
      </PublicRoute>
    ),
  },
 
];
