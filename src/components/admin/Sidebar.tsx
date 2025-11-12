import {
  BarChartOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "../../style/admin/Sidebar.model.css";

type SideberProps = {
  onMenuSelect: (title: string) => void;
};

const Sideber: React.FC<SideberProps> = ({ onMenuSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: "/admin/user", icon: <TeamOutlined />, label: "Quản lý tài khoản" },
    {
      key: "/admin/statistics",
      icon: <BarChartOutlined />,
      label: "Thống kê và theo dõi",
    },
    { key: "/admin/roles", icon: <UserOutlined />, label: "Quản lý vai trò" },
    {
      key: "/admin/permissions",
      icon: <SafetyOutlined />,
      label: "Quản lý quyền",
    },
    {
      key: "/admin/data",
      icon: <FileTextOutlined />,
      label: "Quản lý dữ liệu",
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
    },
    {
      key: "/admin/reports",
      icon: <FileTextOutlined />,
      label: "Báo cáo hệ thống",
    },
  ].filter((item) => permissions.includes(item.key));

  const handleClick = (e: { key: string }) => {
    const selected = menuItems.find((item) => item.key === e.key);
    if (selected) onMenuSelect(selected.label);
    navigate(e.key);
  };

  return (
    <Sider className="custom-sider">
      {/* Header Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo-row">
          <div className="sidebar-logo-circle">
            <img src={logo} alt="Logo trang web" width="110" height="160" />
          </div>

          <div className="sidebar-title">
            <div className="sidebar-title-main">Hệ thống</div>
            <div className="sidebar-title-sub">bầu cử</div>
          </div>
        </div>

        <div className="sidebar-subtext">Sự lựa chọn của doanh nghiệp</div>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        style={{
          background: "transparent",
          border: "none",
        }}
        onClick={handleClick}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sideber;
