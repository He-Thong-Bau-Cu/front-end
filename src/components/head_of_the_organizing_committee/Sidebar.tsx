import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
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

  const menuItems = [
    {
      key: "/head_of_the_Organizing_committee",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "/head_of_the_Organizing_committee/meetings",
      icon: <FileTextOutlined />,
      label: "Quản lý cuộc họp",
    },
    {
      key: "/head_of_the_Organizing_committee/attendance_confirm",
      icon: <HistoryOutlined />,
      label: "Bảng theo dõi xác nhận tham dự",
    },
    {
      key: "/head_of_the_Organizing_committee/election_tracking",
      icon: <HistoryOutlined />,
      label: "Bảng theo dõi cuộc bầu cử",
    },
  ].filter((item) => {
    // Menu "Tổng quan" (Dashboard) luôn hiển thị, không cần check permissions
    if (item.key === "/head_of_the_Organizing_committee") {
      return true;
    }
    // Các menu khác cần check permissions
    return permissions.includes(item.key) || permissionsElections.includes(item.key);
  });
  const handleClick = (e: { key: string }) => {
    const selected = menuItems.find((item) => item.key === e.key);
    if (selected) onMenuSelect(selected.label);
    navigate(e.key);
  };

  return (
    <Sider className="custom-sider" width={260}>
      {/* Header Logo - Clickable để navigate về dashboard */}
      <div 
        className="sidebar-header"
        onClick={() => {
          navigate("/head_of_the_Organizing_committee");
          onMenuSelect("Tổng quan");
        }}
        style={{ cursor: "pointer" }}
      >
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
