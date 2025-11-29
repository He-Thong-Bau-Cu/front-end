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
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
    const permissionsElections = JSON.parse(localStorage.getItem("permissionsElections") || "[]");

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
            key: "/voter/ballots",
            icon: <FileTextOutlined />,
            label: "Bỏ phiếu",
        },
        {
            key: "/voter/voting-history",
            icon: <HistoryOutlined />,
            label: "Lịch sử bỏ phiếu",
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
    ].filter((item) =>
        permissions.some(p => p.startsWith(item.key)) ||
        permissionsElections.some(p => p.startsWith(item.key))
    );


    const handleClick = (e: { key: string }) => {
        const selected = menuItems.find((item) => item.key === e.key);
        if (selected) onMenuSelect(selected.label);
        navigate(e.key);
    };

    const getSelectedKey = () => {
        const currentPath = location.pathname;

        if (
            currentPath === "/voter/ballots" ||
            currentPath.startsWith("/voter/ballots") ||
            currentPath.startsWith("/voter/ballot_")
        ) {
            return "/voter/ballots";
        }

        if (
            currentPath === "/voter/authorization" ||
            currentPath.startsWith("/voter/authorization") ||
            currentPath.startsWith("/voter/create-authorization") ||
            currentPath.startsWith("/voter/request-authorization") ||
            currentPath.startsWith("/voter/authorization-detail") ||
            currentPath.startsWith("/voter/authorization-form")
        ) {
            return "/voter/authorization";
        }

        if (currentPath.startsWith("/voter/voting-history")) {
            return "/voter/voting-history";
        }

        if (currentPath.startsWith("/voter/results")) {
            return "/voter/results";
        }

        if (currentPath.startsWith("/voter/delegate-card")) {
            return "/voter/delegate-card";
        }

        return "/voter";
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
                selectedKeys={[getSelectedKey()]}
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



