import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/Header";
import Sideber from "@/components/admin/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { MenuProps } from "antd/lib";
import {
  IdcardOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLoading } from "@/contexts/LoadingContext";
import bannerContent from "@/assets/banner_content.png";

const AdminLayout = () => {
  const [pageTitle, setPageTitle] = useState("Tổng quan");
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    fetchDataUser();
  }, []);

  const fetchDataUser = async () => {
    try {
      const user = (await getUserLogin()) as User;
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    const map: Record<string, string> = {
      "/admin": "Tổng quan",
      "/admin/user": "Quản lý tài khoản",
      "/admin/statistics": "Thông kê và theo dõi",
      "/admin/roles": "Quản lý vai trò",
      "/admin/permissions": "Quản lý quyền",
      "/admin/data": "Quản lý dữ liệu",
      "/admin/settings": "Cài đặt hệ thống",
      "/admin/reports": "Báo cáo hệ thống",
    };
    setPageTitle(map[location.pathname] || "Bảng điều khiển");
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sideber onMenuSelect={setPageTitle} />

      <AdminHeader title={pageTitle} user={user} />
      <Layout
        style={{
          marginLeft: 250, // bằng đúng width sidebar
          height: "100vh",
          overflow: "hidden", // ẩn scroll ngoài
        }}
      >
        <Content
          style={{
            height: "100vh",
            overflow: "auto",
            padding: "100px 24px 24px 24px",
            margin: 0,
            backgroundImage: `url(${bannerContent})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
