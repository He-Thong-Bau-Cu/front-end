import {
    BarChartOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
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
    const menuItems = [
        {
            key: "/organizing-committee",
            icon: <BarChartOutlined />,
            label: "Tổng quan",
        },
        {
            key: "/organizing-committee/checkin",
            icon: <CheckCircleOutlined />,
            label: "Checkin",
        },
        {
            key: "/organizing-committee/verify-delegates",
            icon: <UserSwitchOutlined />,
            label: "Xác thực đại biểu",
        },
        {
            key: "/organizing-committee/import-delegates",
            icon: <FileTextOutlined />,
            label: "Nhập danh sách đại biểu và cổ đông",
        },
    ];

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
                        <img src={logo} alt="Logo trang web" width="120" height="170" />
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
                defaultSelectedKeys={[location.pathname]}
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

