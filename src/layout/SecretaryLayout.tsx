import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import SecretaryHeader from '@/components/secretary/Header';
import Sideber from '@/components/secretary/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const SecretaryLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            "/secretary": "Tổng quan",
            "/secretary/drafting-documents": "Soạn thảo tài liệu bầu cử",
            "/secretary/documents": "Quản lý tài liệu",
            "/secretary/notifications": "Trung tâm thông báo",
            "/secretary/reports": "Trung tâm báo cáo",
        };
        setPageTitle(map[location.pathname] || "Trang quản lý");
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sideber onMenuSelect={setPageTitle} />

            <Layout style={{
                marginLeft: 290,
                background: "#EFF8EF",
                display: "flex",
                flexDirection: "column",
                width: 'calc(100vw - 290px)',
                minHeight: '100vh',
                overflow: 'hidden',
            }}>
                <SecretaryHeader title={pageTitle} />
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

export default SecretaryLayout;
