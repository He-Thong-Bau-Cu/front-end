import React from "react";
import { Menu } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    BarChartOutlined,
    SettingOutlined,
    FileTextOutlined,
    DatabaseOutlined,
    KeyOutlined,
} from "@ant-design/icons";

const Dashboard = () => {
    return (
        <div className="h-screen w-60 bg-[#f6f9f5] border-r border-gray-200 p-4 flex flex-col">
            <div className="flex items-center mb-8">
                <img src="/logo.png" alt="logo" className="w-10 h-10 mr-2" />
                <h2 className="text-lg font-bold text-green-700">Electoral System</h2>
            </div>
            <Menu
                mode="inline"
                defaultSelectedKeys={["dashboard"]}
                className="bg-transparent border-none"
                items={[
                    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
                    { key: "users", icon: <UserOutlined />, label: "Quản lý tài khoản" },
                    { key: "stats", icon: <BarChartOutlined />, label: "Thống kê" },
                    { key: "roles", icon: <KeyOutlined />, label: "Quản lý quyền" },
                    { key: "data", icon: <DatabaseOutlined />, label: "Quản lý dữ liệu" },
                    { key: "settings", icon: <SettingOutlined />, label: "Cài đặt hệ thống" },
                    { key: "reports", icon: <FileTextOutlined />, label: "Báo cáo hệ thống" },
                ]}
            />
        </div>
    );
}

export default Dashboard;