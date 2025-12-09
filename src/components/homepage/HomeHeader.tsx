import logo from "@/assets/logo.png";
import { getUserLogin } from "@/utils/auth";
import {
  HistoryOutlined,
  IdcardOutlined,
  LogoutOutlined,
  UserOutlined,
  FileTextOutlined,
  BellFilled,
} from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Layout, message, Popover, Space, Typography } from "antd";
import { MenuProps } from "antd/lib";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../types/User.interface";
import ProfileModal from "./ProfileModal";
import NotificationDropdown, { INotification } from "../notification/NotificationDropdown";
import NotificationListener from "../notification/NotificationListener";
import NotificationService from "@/services/NotificationService";
import { useLoading } from "@/contexts/LoadingContext";

const { Header } = Layout;
const { Title, Text } = Typography;

const HomeHeader: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
    loadNotification();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserLogin();
        setUser(userData as User);
      } catch {
        message.error("Không thể tải thông tin người dùng!");
      }
    };
    fetchUser();
  }, []);

  const loadNotification = async () => {
    try {
      showLoading();
      const userId = localStorage.getItem("userId") as string;
      if (!userId) return;
      const response = await NotificationService.getUserNotifications(userId);
      if (response.success) {
        const data = response.data;
        setNotifications(data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      hideLoading();
    }
  };

  const handleSocketNotification = (data: any) => {
    setNotifications((prev) => [data, ...prev]);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleOpenProfile = () => setProfileOpen(true);
  const handleCloseProfile = () => setProfileOpen(false);

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <IdcardOutlined />,
      onClick: handleOpenProfile,
    },
    {
      key: "myElectionRequests",
      label: "Yêu cầu tạo cuộc bầu cử",
      icon: <FileTextOutlined />,
      onClick: () => navigate("/home/my-election-requests"),
    },
    {
      key: "authorization",
      label: "Lịch sử ủy quyền",
      icon: <HistoryOutlined />,
      onClick: () => navigate("/home/authorization-history"),
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
      <Header
        className="home-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
        }}
      >
        <Space size={16} align="center" onClick={() => navigate("/home")}>
          <div className="sidebar-logo-circle">
            <img src={logo} alt="Logo trang web" width="110" height="160" />
          </div>
          <Title level={4} className="header-title">
            Hệ thống Bầu Cử
          </Title>
        </Space>

        <Space size={10} align="center">
          {userId && (
            <NotificationListener
              userId={userId}
              onNewNotification={handleSocketNotification}
            />
          )}
          <Popover
            placement="bottomRight"
            content={
              <NotificationDropdown
                userId={localStorage.getItem("userId") as string}
                notifications={notifications}
                setNotifications={setNotifications}
              />
            }
            trigger="click"
            overlayClassName="notification-popover"
          >
            <Badge count={notifications.filter((n) => !n.read).length} size="small">
              <BellFilled
                style={{
                  fontSize: '20px',
                  color: '#7cb342',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </Badge>
          </Popover>
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
                src={user?.image || undefined}
                icon={!user?.imageKey ? <UserOutlined /> : undefined}
                className="header-avatar"
              />
              <Text className="header-username">
                {user ? user.fullName : "Đang tải..."}
              </Text>
            </Space>
          </Dropdown>
        </Space>
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

export default HomeHeader;
