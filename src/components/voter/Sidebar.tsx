import {
    CheckCircleOutlined,
    DashboardOutlined,
    FileTextOutlined,
    HistoryOutlined,
    IdcardOutlined,
    TeamOutlined
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
            key: "/voter",
            icon: <DashboardOutlined />,
            label: "Tổng quan",
        },
        {
            key: "/voter/authorization",
            icon: <TeamOutlined />,
            label: "Ủy quyền",
        },
        {
            key: "/voter/voting-history",
            icon: <HistoryOutlined />,
            label: "Lịch sử bỏ phiếu",
        },
        {
            key: "/voter/ballots",
            icon: <FileTextOutlined />,
            label: "Danh sách phiếu bầu",
        },
        {
            key: "/voter/results",
            icon: <CheckCircleOutlined />,
            label: "Kết quả bỏ phiếu",
        },
        {
            key: "/voter/delegate-card",
            icon: <IdcardOutlined />,
            label: "Thẻ đại biểu",
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
                <div className="sidebar-logo-row" onClick={() => navigate("/home")} >
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
                defaultSelectedKeys={[location.pathname]}
                style={{
                    background: "transparent",
                    border: "none",
                }}
                onClick={handleClick}
                items={menuItems}
            />
        </Sider >
    );
};

export default Sideber;



