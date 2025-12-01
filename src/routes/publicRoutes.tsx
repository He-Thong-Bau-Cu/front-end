import ForgotPasswordScreen from "@/pages/user/ForgotPasswordScreen";
import VerifyEmailScreen from "@/pages/user/VerifyEmailScreen";
import VerifyForgotPasswordOtp from "@/pages/user/VerifyForgotPasswordOtp";
import { Navigate } from "react-router-dom";
import PublicRoute from "../components/auth/PublicRoute";
import Forbidden403 from "../pages/Forbidden403";
import NotFound404 from "../pages/NotFound404";
import LoginScreen from "../pages/user/Login";
import Invited from "../pages/user/Invited";


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
  { path: "/invited", element: <Invited /> },
  { path: "*", element: <Navigate to="/404" replace /> },
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
    path: "/verify-forgot-password-otp",
    element: (
      <PublicRoute>
        <VerifyForgotPasswordOtp />
      </PublicRoute>
    ),
  }
];
