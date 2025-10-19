import {
    BarChartOutlined,
    DashboardOutlined,
    FileTextOutlined,
    SafetyOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from "../../assets/logo.png";




type SideberProps = {
    onMenuSelect: (title: string) => void;
};
const Sideber: React.FC<SideberProps> = ({ onMenuSelect }) => {
    const navigate = useNavigate();
    const location = useLocation();


    const menuItems = [
        { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
        { key: '/admin/user', icon: <TeamOutlined />, label: 'Quản lý tài khoản' },
        { key: '/admin/statistics', icon: <BarChartOutlined />, label: 'Thông kê và theo dõi' },
        { key: '/admin/roles', icon: <UserOutlined />, label: 'Quản lý vai trò' },
        { key: '/admin/permissions', icon: <SafetyOutlined />, label: 'Quản lý quyền' },
        { key: '/admin/data', icon: <FileTextOutlined />, label: 'Quản lý dữ liệu' },
        { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt hệ thống' },
        { key: '/admin/reports', icon: <FileTextOutlined />, label: 'Báo cáo hệ thống' },

    ];

    const handleClick = (e: { key: string }) => {
        const selected = menuItems.find((item) => item.key === e.key);
        if (selected) onMenuSelect(selected.label);
        navigate(e.key);
    };

    return (
        <div>
            <Sider
                style={{
                    background: '#ECF4E9',
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    boxShadow: '4px 0 6px rgba(0, 0, 0, 0.1)',

                }}
                width={290}
            >
                {/* Header Logo */}
                <div
                    style={{
                        padding: '25px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '8px',
                        paddingBottom: '50px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                        }}
                    >
                        <div
                            style={{
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '30px'
                            }}
                        >
                            <img src={logo} alt="Logo trang web" width="120" height="170" />
                        </div>

                        <div style={{ lineHeight: '1.2' }}>
                            <div style={{ fontWeight: '710', fontSize: '29px', color: '#124d2d' }}>Hệ thống</div>
                            <div style={{ fontWeight: '710', fontSize: '29px', color: '#124d2d', paddingLeft: '34px' }}>bầu cử</div>
                        </div>
                    </div>

                    <div style={{ fontSize: '15px', color: '#777', marginLeft: '20px' }}>
                        Sự lựa chọn của doanh nghiệp
                    </div>
                </div>

                <style>
                    {`
                        .ant-menu-item {
                        height: 55px !important;
                        width: 230px !important;
                        display: flex;
                        align-items: center;
                        font-size: 17px !important;
                        border-radius: 10px !important;
                        padding-left: 20px !important;
                        color: #666 !important;
                        transition: all 0.2s ease;
                        margin-left: 20px !important;                        
                        }

                        .ant-menu-item .anticon {
                        font-size: 20px;
                        color: #666 !important;
                        }

                        .ant-menu-item:hover {
                        background-color: #d9ead3 !important;
                        color: #000 !important;
                        }

                        .ant-menu-item-selected {
                        background-color: #b6fbb0 !important;
                        font-weight: 600;
                        color: #000 !important;
                        border-left: 4px solid red !important;
                        border-radius: 8px !important;
                        padding-left: 16px !important;
                        }

                        .ant-menu-item-selected .anticon {
                        color: #000 !important;
                        }

                    `}
                </style>

                {/* Menu */}
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{
                        background: 'transparent',
                        border: 'none',
                    }}

                    onClick={handleClick}
                    items={menuItems}
                />
            </Sider>
        </div>
    );
};

export default Sideber;
