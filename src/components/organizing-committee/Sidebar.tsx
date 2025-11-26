import {
  BarChartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserSwitchOutlined,
  UserAddOutlined,
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
  const permissionsElections = JSON.parse(
    localStorage.getItem("permissionsElections") || "[]"
  );

  // Kiểm tra xem user có quyền truy cập organizing-committee không
  const hasOrganizingCommitteeAccess =
    permissions.includes("/organizing-committee") ||
    permissionsElections.includes("/organizing-committee") ||
    permissions.some((p: string) => p.startsWith("/organizing-committee")) ||
    permissionsElections.some((p: string) => p.startsWith("/organizing-committee")) ||
    location.pathname.startsWith("/organizing-committee"); // Nếu đang ở trong organizing-committee, hiển thị tất cả menu

  const menuItems = [
    {
      key: "/organizing-committee",
      icon: <BarChartOutlined />,
      label: "Tổng quan",
    },
    {
      key: "/organizing-committee/checkin",
      icon: <CheckCircleOutlined />,
      label: "Checkin",
    },
    {
      key: "/organizing-committee/create-participants",
      icon: <UserAddOutlined />,
      label: "Danh sách người tham dự cuộc họp",
    },
    // {
    //   key: "/organizing-committee/manage-delegates",
    //   icon: <FileTextOutlined />,
    //   label: "Quản lý danh sách đại biểu và cổ đông",
    // },
  ].filter((item) => {
    // Menu "Tổng quan" luôn hiển thị
    if (item.key === "/organizing-committee") {
      return true;
    }
    // Nếu user có quyền truy cập organizing-committee hoặc đang ở trong organizing-committee, hiển thị tất cả menu con
    if (hasOrganizingCommitteeAccess) {
      return true;
    }
    // Nếu không, check permissions cụ thể
    return permissions.includes(item.key) || permissionsElections.includes(item.key);
  });

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
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
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
