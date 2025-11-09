import FileService from "@/services/FileService";
import UserService from "@/services/UserService";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface CustomJwtPayload extends JwtPayload {
  role?: {
    code: string;
  };
  permissions?: {
    path: string;
  }[];
}

interface LoginData {
  user: any;
  accessToken: string;
  refreshToken?: string;
}

export const setLocalStorage = (
  token: string,
  userId: string,
  role: string,
  name: string,
  permissions: string[]
) => {
  localStorage.setItem("user", JSON.stringify({ userId, role, name }));
  localStorage.setItem("accessToken", token);
  localStorage.setItem("userId", userId);
  localStorage.setItem("role", role);
  localStorage.setItem("name", name);
  localStorage.setItem("permissions", JSON.stringify(permissions));
};

export const getCurrentUser = (): any | null => {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (!token || typeof token !== "string" || token.split(".").length !== 3) {
      throw new Error("Token không tồn tại hoặc sai định dạng");
    }

    const decoded = jwtDecode<CustomJwtPayload>(token);

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.clear();
      return null;
    }

    return user ? JSON.parse(user) : null;
  } catch (error: any) {
    console.error("Error getting current user:", error.message);
    return null;
  }
};

export const getUserLogin = async () => {
  try {
    const userId = localStorage.getItem("userId") || "";
    const response = await UserService.detail(userId);
    if (response.data.image) {
      const avt = await FileService.getPresignedUrlByKey(response.data.image);
      if (avt.success) {
        response.data.imageKey = avt.data.url;
      }
    }
    if (response.success) {
      return response.data;
    } else {
      console.error("Failed to fetch user details:", response.message);
      return null;
    }
  } catch (error) {
    console.error("Error getting user ID:", error);
  }
};

export const logout = (): void => {
  localStorage.clear();
};

export const login = (loginData: LoginData): void => {
  const decode = jwtDecode<CustomJwtPayload>(loginData.accessToken);
  const permissionList = decode?.permissions?.map((item) => item.path) || [];

  localStorage.setItem("user", JSON.stringify(loginData.user));
  localStorage.setItem("accessToken", loginData.accessToken || "");
  localStorage.setItem("refreshToken", loginData.refreshToken || "");
  localStorage.setItem("role", decode?.role?.code || "");
  localStorage.setItem("permissions", JSON.stringify(permissionList));
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};
