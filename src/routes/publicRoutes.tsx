import LoginScreen from "../pages/user/Login";
import PublicRoute from "../components/auth/PublicRoute";
import NotFound404 from "../pages/NotFound404";
import Forbidden403 from "../pages/Forbidden403";
import { Navigate } from "react-router-dom";
import Dashboard from "@/pages/admin/Dashboard";
import ManagementUser from "@/pages/admin/ManagementUser";
import AdminLayout from "@/layout/AdminLayout";
import ManagementRole from "@/pages/admin/ManagementRole";
import VoterLayout from "@/layout/VoterLayout";
import DashboardVoter from "@/pages/voter/Dashboard";
import ForgotPasswordScreen from "@/pages/user/ForgotPasswordScreen";
import VerifyEmailScreen from "@/pages/user/VerifyEmailScreen";
import BallotList from "@/pages/voter/BallotList";
import CumulativeVoting from "@/pages/voter/CumulativeVoting";
import ResolutionVoting from "@/pages/voter/ResolutionVoting";
import VoteSuccess from "@/pages/voter/VoteSuccess";
import VotingHistory from "@/pages/voter/VotingHistory";
import Authorization from "@/pages/voter/Authorization";
import PresideLayout from "@/layout/PresideLayout";
import Statistics from "@/pages/admin/Statistics";
import ManagementDecision from "@/pages/preside/ManagementDecision";
import DashboardPreside from "@/pages/preside/Dashboard";
import AuthorizationPreside from "@/pages/preside/Authorization";
import VotingResult from "@/pages/voter/VotingResult";
import ReportsPage from "@/pages/preside/manage_report/ReportsPage";
import ElectionResultsPage from "@/pages/preside/voting_process/ElectionResultsPage";
import VotingResultDetail from "@/components/voter/voting-result/VotingResultDetail";
import SecretaryLayout from "@/layout/SecretaryLayout";
import DashboardSecretary from "@/pages/secretary/Dashboard";
import DraftingDocuments from "@/pages/secretary/DraftingDocuments";
import ManagementDocument from "@/pages/secretary/ManagementDocument";
import OrganizingCommitteeLayout from "@/layout/OrganizingCommitteeLayout";
import DashboardOrganizingCommittee from "@/pages/organizing-committee/Dashboard";
import Checkin from "@/pages/organizing-committee/Checkin";



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
      { path: "statistics", element: <Statistics /> },
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
    path: "/voter",
    element: <VoterLayout />,
    children: [
      { index: true, element: <DashboardVoter /> },
      { path: "authorization", element: <Authorization /> },
      { path: "ballots", element: <BallotList /> },
      { path: "ballot_cumulative_voting", element: <CumulativeVoting /> },
      { path: "ballot_resolution_voting", element: <ResolutionVoting /> },
      { path: "statistics", element: <Statistics /> },
      { path: "roles", element: <ManagementRole /> },
      { path: "authorization", element: <Authorization /> },
      { path: "voting-history", element: <VotingHistory /> },
      { path: "results", element: <VotingResult /> },
      { path: "results/detail", element: <VotingResultDetail /> },


    ],
  },

  {
    path: "/preside",
    element: <PresideLayout />,
    children: [
      { index: true, element: <DashboardPreside /> },
      { path: "decision", element: <ManagementDecision /> },
      { path: "authorization", element: <AuthorizationPreside /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "election-monitor", element: <ElectionResultsPage /> },

    ],
  },


  {
    path: "/secretary",
    element: <SecretaryLayout />,
    children: [
      { index: true, element: <DashboardSecretary /> },
      { path: "drafting-documents", element: <DraftingDocuments /> },
      { path: "documents", element: <ManagementDocument /> },

    ],
  },

  {
    path: "/organizing-committee",
    element: <OrganizingCommitteeLayout />,
    children: [
      { index: true, element: <DashboardOrganizingCommittee /> },
      { path: "checkin", element: <Checkin /> },
      // { path: "documents", element: <ManagementDocument /> },

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
