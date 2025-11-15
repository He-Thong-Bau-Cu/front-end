import React, { useEffect, useState } from 'react';
import { Avatar, Badge, Dropdown, Layout, message, Space, Typography } from 'antd';
import { BellFilled, IdcardOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd/lib';
import { getUserLogin } from '@/utils/auth';
import { User } from '@/types/User.interface';
import ProfileModal from '@/components/homepage/ProfileModal';
import '../../style/Header.model.css';

const { Header } = Layout;
const { Title, Text } = Typography;

interface TBTCHeaderProps {
  title: string;
}

const TBTCHeader: React.FC<TBTCHeaderProps> = ({ title }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserLogin();
        setUser(userData as User);
      } catch (error) {
        message.error('Không thể tải thông tin người dùng!');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleOpenProfile = () => setProfileOpen(true);
  const handleCloseProfile = () => setProfileOpen(false);

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <IdcardOutlined />,
      onClick: handleOpenProfile,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <Header
        className="secretary-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
        }}
      >
        <div className="header-container">
          {/* 🏷️ Tiêu đề */}
          <div className="header-title">{title}</div>

          {/* 🔔 Chuông + Avatar */}
          <div className="header-actions">
            <Badge count={3} size="small">
              <BellFilled className="header-icon" />
            </Badge>

            <Dropdown
              menu={{ items: menuItems }}
              placement="bottomRight"
              arrow
              overlayClassName="profile-dropdown"
              trigger={['click']}
            >
              <Space className="profile-trigger">
                <Avatar
                  size={40}
                  src={user?.imageKey || undefined}
                  icon={!user?.imageKey ? <UserOutlined /> : undefined}
                  className="header-avatar"
                />
                <Text className="header-username">
                  {user ? user.fullName : 'Đang tải...'}
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

export default TBTCHeader;
