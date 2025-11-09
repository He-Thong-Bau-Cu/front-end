import React, { useState } from "react";
import { Avatar, Badge, Dropdown, Layout, Space, Typography } from "antd";
import {
  BellFilled,
  IdcardOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "../../style/Header.model.css";
import { User } from "@/types/User.interface";
import { MenuProps } from "antd/lib";
import ProfileModal from "../homepage/ProfileModal";

const { Header } = Layout;
const { Title, Text } = Typography;

interface AdminHeaderProps {
  title: string;
  user: User | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, user }) => {
  const [isProfileOpen, setProfileOpen] = useState(false);

  const handleOpenProfile = () => setProfileOpen(true);
  const handleCloseProfile = () => setProfileOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <IdcardOutlined />,
      onClick: handleOpenProfile,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <Header className="secretary-header">
        <div className="header-container">
          {/* Tiêu đề */}
          <div className="header-title">{title}</div>

          {/* Thông báo + Avatar */}
          <div className="header-actions">
            <Space size={10} align="center">
              <Badge count={3} size="small">
                <BellFilled className="header-icon" />
              </Badge>
            </Space>

            <Space size={10} align="center">
              <Dropdown
                menu={{ items: menuItems }}
                placement="bottomRight"
                arrow
                overlayClassName="profile-dropdown"
                trigger={["click"]}
              >
                <Space className="profile-trigger">
                  <Avatar
                    size={40}
                    src={user?.imageKey || undefined}
                    icon={!user?.imageKey ? <UserOutlined /> : undefined}
                    className="header-avatar"
                  />
                  <Text className="header-username">
                    {user ? user.fullName : "Đang tải..."}
                  </Text>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </div>
      </Header>

      <ProfileModal
        open={isProfileOpen}
        onClose={handleCloseProfile}
        user={user}
        handleCloseProfile={handleCloseProfile}
      />
    </>
  );
};

export default AdminHeader;
