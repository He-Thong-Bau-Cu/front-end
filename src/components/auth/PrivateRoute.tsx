import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { USER_ROLE } from "@/enums/STATUS";

interface CustomJwtPayload extends JwtPayload {
  role?: {
    code: string;
  };
  permissions?: {
    path: string;
  }[];
}

const PrivateRoute: React.FC = () => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const permissions: string[] = JSON.parse(
    localStorage.getItem("permissions") || "[]"
  );
  const permissionsElections = JSON.parse(
    localStorage.getItem("permissionsElections") || "[]"
  );

  const userRole = localStorage.getItem("role");
  const currentPath = location.pathname;
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    localStorage.clear();
    return <Navigate to="/403" replace state={{ unauthorized: true }} />;
  }

  let decoded: CustomJwtPayload;
  try {
    decoded = jwtDecode<CustomJwtPayload>(accessToken);
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/403" replace state={{ unauthorized: true }} />;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < currentTime) {
    localStorage.clear();
    return <Navigate to="/403" replace state={{ unauthorized: true }} />;
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Các route chính dựa trên role - không cần check permissions
  const roleBasedRoutes: Record<string, string[]> = {
    [USER_ROLE.ADMIN]: ["/admin", "/change-password-first-time"],
    [USER_ROLE.PRESIDE]: ["/preside", "/change-password-first-time"],
    [USER_ROLE.ORGANIZING_COMMITTEE]: ["/organizing-committee", "/change-password-first-time"],
    [USER_ROLE.HEAD_OF_ORGANIZING_COMMITTEE]: ["/head_of_the_Organizing_committee", "/change-password-first-time"],
    [USER_ROLE.BOARD_OF_CONTROL]: ["/board-of-control", "/change-password-first-time"],
    [USER_ROLE.SECRETARY]: ["/secretary", "/change-password-first-time"],
    [USER_ROLE.VOTER]: ["/voter", "/home", "/change-password-first-time"],
  };

  // Nếu route thuộc role-based routes, cho phép truy cập (bao gồm cả sub-routes)
  const allowedRoutesForRole = roleBasedRoutes[userRole || ""] || [];
  const isRoleBasedRoute = allowedRoutesForRole.some(route =>
    currentPath === route || currentPath.startsWith(route + "/")
  );

  if (isRoleBasedRoute) {
    return <Outlet />;
  }

  // Check permissions cho các route khác
  const allPermissions = [...permissions, ...permissionsElections];

  if (!permissions.includes(currentPath)) {
    if (!allPermissions.includes(currentPath)) {
      return <Navigate to="/403" replace state={{unauthorized: true}}/>;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
