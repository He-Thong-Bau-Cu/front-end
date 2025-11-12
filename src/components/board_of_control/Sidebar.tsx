import {
    BarChartOutlined,
    FileTextOutlined,
    HistoryOutlined,
    UserSwitchOutlined
} from "@ant-design/icons";
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import '../../style/admin/Sidebar.model.css';

type SideberProps = {
    onMenuSelect: (title: string) => void;
};

const Sideber: React.FC<SideberProps> = ({ onMenuSelect }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
    const permissionsElections = JSON.parse(localStorage.getItem("permissionsElections") || "[]");

    const menuItems = [
        {
            key: "/board-of-control",
            icon: <BarChartOutlined />,
            label: "Tổng quan",
        },
        {
            key: "/board-of-control/achive-reports",
            icon: <FileTextOutlined />,
            label: "Báo cáo đã lưu trữ",
        },
        {
            key: "/board-of-control/control-reports",
            icon: <FileTextOutlined />,
            label: "Báo cáo kiểm soát",
        },
        {
            key: "/board-of-control/verify-results",
            icon: <UserSwitchOutlined />,
            label: "Xác minh kết quả",
        },
        {
            key: "/board-of-control/voting-process",
            icon: <HistoryOutlined />,
            label: "Gíam sát bỏ phiếu",
        },
    ].filter((item) => permissions.includes(item.key) || permissionsElections.includes(item.key));

    const handleClick = (e: { key: string }) => {
        const selected = menuItems.find((item) => item.key === e.key);
        if (selected) onMenuSelect(selected.label);
        navigate(e.key);
    };

    return (
        <Sider className="custom-sider" width={290}>
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

