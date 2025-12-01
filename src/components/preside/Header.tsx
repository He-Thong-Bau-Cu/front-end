import logo from "@/assets/logo.png";
import React, { useEffect, useState } from 'react';
import { Avatar, Badge, Button, Dropdown, Layout, message, Popover, Space, Typography } from 'antd';
import { BellFilled, IdcardOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import '../../style/Header.model.css';
import { getUserLogin } from '@/utils/auth';
import { User } from '@/types/User.interface';
import { MenuProps } from 'antd/lib';
import ProfileModal from '../homepage/ProfileModal';
import NotificationDropdown, { INotification } from "../notification/NotificationDropdown";
import NotificationListener from "../notification/NotificationListener";
import NotificationService from "@/services/NotificationService";
import { useLoading } from "@/contexts/LoadingContext";

const { Header } = Layout;
const { Title, Text } = Typography;

interface VoterHeaderProps {
    title: string;
}

const VoterHeader: React.FC<VoterHeaderProps> = ({ title }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const [userId, setUserId] = useState<string | null>(null);

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
            } catch (error) {
                message.error("Không thể tải thông tin người dùng!");
            }
        };
        fetchUser();
    }, []);

    const loadNotification = async () => {
        try {
            showLoading();
            const userId = localStorage.getItem("userId") as string;
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
                {userId && (
                    <NotificationListener
                        userId={userId}
                        onNewNotification={handleSocketNotification}
                    />
                )}
                <Space size={16} align="center">

                    <Title level={4} className="header-title">
                        {title}
                    </Title>
                </Space>


                <Space size={10} align="center">
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
                        <Badge count={notifications.length} size="small">
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

export default VoterHeader;



