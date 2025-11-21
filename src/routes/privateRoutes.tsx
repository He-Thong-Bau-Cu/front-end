import PrivateRoute from "@/components/auth/PrivateRoute";
import AuthorizationRequestForm from "@/components/voter/authorization/AuthorizationRequestForm";
import UserSelection from "@/components/voter/authorization/UserSelection";
import VotingResultDetail from "@/components/voter/voting-result/VotingResultDetail";
import AdminLayout from "@/layout/AdminLayout";
import BoardOfControlLayout from "@/layout/BoardOfControlLayout";
import HeadOfTheOrganizingCommitteeLayout from "@/layout/HeadOfTheOrganizingCommitteeLayout";
import OrganizingCommitteeLayout from "@/layout/OrganizingCommitteeLayout";
import PresideLayout from "@/layout/PresideLayout";
import SecretaryLayout from "@/layout/SecretaryLayout";
import VoterLayout from "@/layout/VoterLayout";
import Dashboard from "@/pages/admin/Dashboard";
import ManagementData from "@/pages/admin/ManagementData";
import ManagementPermission from "@/pages/admin/ManagementPermission";
import ManagementRole from "@/pages/admin/ManagementRole";
import ManagementUser from "@/pages/admin/ManagementUser";
import Statistics from "@/pages/admin/Statistics";
import SystemReport from "@/pages/admin/SystemReport";
import SystemSettings from "@/pages/admin/SystemSettings";
import DashboardBoardOfControlPage from "@/pages/board_of_control/DashboardBoardOfControl";
import ElectionVerificationPage from "@/pages/board_of_control/ElectionVerificationPage";
import ReportArchivePage from "@/pages/board_of_control/ReportArchivePage";
import SystemAuditReportPage from "@/pages/board_of_control/SystemAuditReportPage";
import VotingProcess from "@/pages/board_of_control/VotingProcess";
import AttendanceConfirm from "@/pages/head_of_the_organizing_comittee/AttendanceConfirm";
import CreateDelegateCardPage from "@/pages/head_of_the_organizing_comittee/CreateDelegateCardPage";
import ManagementMeeting from "@/pages/head_of_the_organizing_comittee/ManagementMeeting";
import OrganizerDashboardPage from "@/pages/head_of_the_organizing_comittee/OrganizerDashboardPage";
import VotingDashboardPage from "@/pages/head_of_the_organizing_comittee/VotingDashboardPage";
import HomePage from "@/pages/HomePage";
import Checkin from "@/pages/organizing-committee/Checkin";
import DashboardOrganizingCommittee from "@/pages/organizing-committee/Dashboard";
import ManagementDelegates from "@/pages/organizing-committee/ManagementDelegates";
import CreateMeetingAttendee from "@/pages/organizing-committee/CreateMeetingAttendee";
import AuthorizationPreside from "@/pages/preside/Authorization";
import DashboardPreside from "@/pages/preside/Dashboard";
import ReportsPage from "@/pages/preside/manage_report/ReportsPage";
import ManagementDecision from "@/pages/preside/ManagementDecision";
import ElectionResultsPage from "@/pages/preside/voting_process/ElectionResultsPage";
import DashboardSecretary from "@/pages/secretary/Dashboard";
import DraftingDocuments from "@/pages/secretary/DraftingDocuments";
import ManagementDocument from "@/pages/secretary/ManagementDocument";
import NotificationCenterPage from "@/pages/secretary/NotificationCenterPage";
import ReportCenterPage from "@/pages/secretary/ReportCenterPage";
import FirstTimeChangePasswordScreen from "@/pages/user/ChangePasswordFirstTime";
import Authorization from "@/pages/voter/Authorization";
import BallotList from "@/pages/voter/BallotList";
import CumulativeVoting from "@/pages/voter/CumulativeVoting";
import DashboardVoter from "@/pages/voter/Dashboard";
import DelegateCardPage from "@/pages/voter/DelegateCardPage";
import ResolutionVoting from "@/pages/voter/ResolutionVoting";
import VoteSuccess from "@/pages/voter/VoteSuccess";
import VotingHistory from "@/pages/voter/VotingHistory";
import AuthorizationDetail from "@/components/voter/authorization/AuthorizationDetail";
import AuthorizationForm from "@/components/voter/authorization/AuthorizationForm";
import AuthorizationHistory from "@/components/homepage/AuthorizationHistory";

export const privateRoutes = [
  {
    path: "/admin",
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "user", element: <ManagementUser /> },
          { path: "statistics", element: <Statistics /> },
          { path: "roles", element: <ManagementRole /> },
          { path: "permissions", element: <ManagementPermission /> },
          { path: "data", element: <ManagementData /> },
          { path: "settings", element: <SystemSettings /> },
          { path: "reports", element: <SystemReport /> },
        ],
      },
    ],
  },
  {
    path: "/voter",
    element: <PrivateRoute />,
    children: [
      {
        element: <VoterLayout />,
        children: [
          { index: true, element: <DashboardVoter /> },
          { path: "authorization", element: <Authorization /> },
          { path: "create-authorization", element: <UserSelection /> },
          { path: "request-authorization", element: <AuthorizationRequestForm /> },
          { path: "authorization-detail", element: <AuthorizationDetail /> },
          { path: "authorization-form", element: <AuthorizationForm /> },
          { path: "ballots", element: <BallotList /> },
          { path: "ballot_cumulative_voting", element: <CumulativeVoting /> },
          { path: "ballot_resolution_voting", element: <ResolutionVoting /> },
          { path: "statistics", element: <Statistics /> },
          { path: "authorization", element: <Authorization /> },
          { path: "voting-history", element: <VotingHistory /> },
          { path: "results", element: <VotingResultDetail /> },
          { path: "delegate-card", element: <DelegateCardPage /> },
          { path: "vote-success", element: <VoteSuccess /> },
        ],
      },
    ],
  },
  {
    path: "/preside",
    element: <PrivateRoute />,
    children: [
      {
        element: <PresideLayout />,
        children: [
          { index: true, element: <DashboardPreside /> },
          { path: "decision", element: <ManagementDecision /> },
          { path: "authorization", element: <AuthorizationPreside /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "election-monitor", element: <ElectionResultsPage /> },
        ],
      },
    ],
  },
  {
    path: "/secretary",
    element: <PrivateRoute />,
    children: [
      {
        element: <SecretaryLayout />,
        children: [
          { index: true, element: <DashboardSecretary /> },
          { path: "drafting-documents", element: <DraftingDocuments /> },
          { path: "documents", element: <ManagementDocument /> },
          { path: "notifications", element: <NotificationCenterPage /> },
          { path: "reports", element: <ReportCenterPage /> },
        ],
      },
    ],
  },
  {
    path: "/organizing-committee",
    element: <PrivateRoute />,
    children: [
      {
        element: <OrganizingCommitteeLayout />,
        children: [
          { index: true, element: <DashboardOrganizingCommittee /> },
          { path: "checkin", element: <Checkin /> },
          { path: "manage-delegates", element: <ManagementDelegates /> },
          { path: "create-participants", element: <CreateMeetingAttendee /> },
        ],
      },
    ],
  },
  {
    path: "/head_of_the_Organizing_committee",
    element: <PrivateRoute />,
    children: [
      {
        element: <HeadOfTheOrganizingCommitteeLayout />,
        children: [
          { index: true, element: <OrganizerDashboardPage /> },
          { path: "meetings", element: <ManagementMeeting /> },
          { path: "create-delegate-card", element: <CreateDelegateCardPage /> },
          { path: "election_tracking", element: <VotingDashboardPage /> },
          { path: "attendance_confirm", element: <AttendanceConfirm /> },
        ],
      },
    ],
  },
  {
    path: "/board-of-control",
    element: <PrivateRoute />,
    children: [
      {
        element: <BoardOfControlLayout />,
        children: [
          { index: true, element: <DashboardBoardOfControlPage /> },
          { path: "achive-reports", element: <ReportArchivePage /> },
          { path: "control-reports", element: <SystemAuditReportPage /> },
          { path: "verify-results", element: <ElectionVerificationPage /> },
          { path: "voting-process", element: <VotingProcess /> },
          { path: "create-delegate-card", element: <CreateDelegateCardPage /> },
          { path: "election_tracking", element: <VotingDashboardPage /> },
        ],
      },
    ],
  },
  {
    path: "/home",
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <HomePage />,

      },
      { path: "authorization-history", element: <AuthorizationHistory /> },

    ],
  },

  {
    path: "/change-password-first-time",
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <FirstTimeChangePasswordScreen />,
      },
    ],
  },
];
