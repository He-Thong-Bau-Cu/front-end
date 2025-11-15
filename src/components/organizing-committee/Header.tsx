import React, { useEffect, useState } from "react";
import { Avatar, Badge, Dropdown, Layout, Space, Typography, message } from "antd";
import { BellFilled, IdcardOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { MenuProps } from "antd/lib";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import ProfileModal from "@/components/homepage/ProfileModal"; // ✅ import modal hồ sơ cá nhân

const { Header } = Layout;
const { Text } = Typography;

interface OrganizingCommitteeHeaderProps {
  title: string;
}

const OrganizingCommitteeHeader: React.FC<OrganizingCommitteeHeaderProps> = ({ title }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);

  // 🧩 Lấy thông tin user đăng nhập
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserLogin();
        setUser(userData as User);
      } catch (error) {
        message.error("Không thể tải thông tin người dùng!");
      }
    };
    fetchUser();
  }, []);

  // 🧩 Xử lý hành động người dùng
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleOpenProfile = () => setProfileOpen(true);
  const handleCloseProfile = () => setProfileOpen(false);

  // 🧩 Menu Dropdown (Hồ sơ cá nhân, Đăng xuất)
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
          {/* 🏷 Tiêu đề */}
          <div className="header-title">{title}</div>

          {/* 🔔 Thông báo + Avatar */}
          <div className="header-actions">
            <Badge count={3} size="small">
              <BellFilled className="header-icon" />
            </Badge>

            {/* 🧩 Dropdown Avatar */}
            <Dropdown
              menu={{ items: menuItems }}
              placement="bottomRight"
              arrow
              overlayClassName="profile-dropdown"
              trigger={["click"]}
            >
              <Space className="header-user" style={{ cursor: "pointer" }}>
                <Avatar
                  className="header-avatar"
                  size="large"
                  src={user?.imageKey || undefined}
                  icon={!user?.imageKey ? <UserOutlined /> : undefined}
                />
                <Text className="header-username">
                  {user ? user.fullName : "Đang tải..."}
                </Text>
              </Space>
            </Dropdown>
          </div>
        </div>
      </Header>

      {/* 🧩 Modal Hồ sơ cá nhân */}
      <ProfileModal
        open={isProfileOpen}
        onClose={handleCloseProfile}
        user={user}
        handleCloseProfile={handleCloseProfile}
      />
    </>
  );
};

export default OrganizingCommitteeHeader;
