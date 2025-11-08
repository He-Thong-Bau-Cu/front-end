import logo from "@/assets/logo.png";
import UserService from "@/services/UserService";
import {
    IdcardOutlined,
    LogoutOutlined,
    SettingOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Dropdown,
    Layout,
    message,
    Space,
    Typography
} from "antd";
import { MenuProps } from "antd/lib";
import React, { useEffect, useState } from "react";
import { User } from "../../types/User.interface";
import ProfileModal from "./ProfileModal";
import { getUserLogin } from "@/utils/auth";

const { Header } = Layout;
const { Title, Text } = Typography;

const HomeHeader: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isProfileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserLogin();
                setUser(userData);
            } catch (error) {
                message.error("Không thể tải thông tin người dùng!");
            }
        };
        fetchUser();
    }, []);

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
            key: "settings",
            label: "Cài đặt tài khoản",
            icon: <SettingOutlined />,
            onClick: () => message.info("Chức năng đang phát triển!"),
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
                <Space size={16} align="center">
                    <div className="sidebar-logo-circle">
                        <img src={logo} alt="Logo trang web" width="110" height="160" />
                    </div>
                    <Title level={4} className="header-title">
                        Hệ thống Bầu Cử
                    </Title>
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
                                icon={!user?.image ? <UserOutlined /> : undefined}
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
            <ProfileModal open={isProfileOpen} onClose={handleCloseProfile} user={user} />

        </>
    );
};

export default HomeHeader;
