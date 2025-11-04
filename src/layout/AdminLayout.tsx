import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/Header';
import Sideber from '@/components/admin/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            '/admin': 'Tổng quan',
            '/admin/user': 'Quản lý tài khoản',
            '/admin/statistics': 'Thông kê và theo dõi',
            '/admin/roles': 'Quản lý vai trò',
            '/admin/permissions': 'Quản lý quyền',
            '/admin/data': 'Quản lý dữ liệu',
            '/admin/settings': 'Cài đặt hệ thống',
            '/admin/reports': 'Béo cáo hệ thống'
        };
        setPageTitle(map[location.pathname] || 'Bảng điều khiển');
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sideber onMenuSelect={setPageTitle} />

            <Layout style={{
                marginLeft: 250,
                background: "#EFF8EF",
                display: "flex",
                flexDirection: "column",
                width: 'calc(100vw - 290px)',
                minHeight: '100vh',
                overflow: 'hidden',
            }}>
                <AdminHeader title={pageTitle} />
                <Content
                    style={{
                        flex: 1,
                        padding: '100px 24px 24px',
                        background: '#EFF8EF',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        boxSizing: 'border-box',
                    }}
                >
                    <Outlet />

                </Content>
            </Layout>
        </Layout >
    );
};

export default AdminLayout;
