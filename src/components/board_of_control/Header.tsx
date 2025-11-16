import React, { useEffect, useState } from "react";
import {
    Avatar,
    Badge,
    Dropdown,
    Layout,
    Popover,
    Space,
    Typography,
} from "antd";
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
import NotificationDropdown, {
    INotification,
} from "../notification/NotificationDropdown";
import NotificationService from "@/services/NotificationService";
import { useLoading } from "@/contexts/LoadingContext";
import NotificationListener from "../notification/NotificationListener";

const { Header } = Layout;
const { Text } = Typography;

interface VoterHeaderProps {
    title: string;
    user: User | null;
}

const BoardOfControlHeader: React.FC<VoterHeaderProps> = ({ title, user }) => {
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const { showLoading, hideLoading } = useLoading();
    const [userId, setUserId] = useState<string | null>(null);

    const handleOpenProfile = () => setProfileOpen(true);
    const handleCloseProfile = () => setProfileOpen(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
        loadNotification();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

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

                <div className="header-container">
                    {/* Tiêu đề */}
                    <div className="header-title">{title}</div>

                    {/* Thông báo + Avatar */}
                    <div className="header-actions">
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
                                        className="header-icon"
                                        style={{ cursor: "pointer" }}
                                    />
                                </Badge>
                            </Popover>
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

export default BoardOfControlHeader;




