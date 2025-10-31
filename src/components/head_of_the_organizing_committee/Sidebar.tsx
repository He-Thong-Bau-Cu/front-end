import {
    DashboardOutlined,
    FileTextOutlined,
    HistoryOutlined,
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
            key: "/head_of_the_Organizing_committee",
            icon: <DashboardOutlined />,
            label: "Tổng quan",
        },
        {
            key: "/head_of_the_Organizing_committee/list_meeting",
            icon: <FileTextOutlined />,
            label: "Danh sách cuộc họp",
        },
        {
            key: "/head_of_the_Organizing_committee/meetings",
            icon: <FileTextOutlined />,
            label: "Quản lý cuộc họp",
        },
        {
            key: "/head_of_the_Organizing_committee/create_meeting",
            icon: <TeamOutlined />,
            label: "Tạo cuộc họp",
        },
        {
            key: "/head_of_the_Organizing_committee/attendence_confirm_tracking",
            icon: <HistoryOutlined />,
            label: "Bảng theo dõi xác nhận tham dự",
        },
        {
            key: "/head_of_the_Organizing_committee/election_tracking",
            icon: <HistoryOutlined />,
            label: "Bảng theo dõi cuộc bầu cử",
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

