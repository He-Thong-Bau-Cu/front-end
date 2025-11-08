import VoteSuccess from "@/pages/voter/VoteSuccess";
import { Navigate } from "react-router-dom";
import PublicRoute from "../components/auth/PublicRoute";
import Forbidden403 from "../pages/Forbidden403";
import NotFound404 from "../pages/NotFound404";
import LoginScreen from "../pages/user/Login";
import ForgotPasswordScreen from "@/pages/user/ForgotPasswordScreen";
import VerifyEmailScreen from "@/pages/user/VerifyEmailScreen";
import HomePage from "@/pages/HomePage";


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
  }
];
