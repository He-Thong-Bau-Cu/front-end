import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import Header from '@/components/secretary/Header';
import Sideber from '@/components/secretary/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const SecretaryLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            "/secretary": "Tổng quan",
            "/secretary/drafting-documents": "Quản lý soạn thảo",
            "/secretary/documents": "Quản lý tài liệu",
            "/secretary/notifications": "Trung tâm thông báo",
            "/secretary/reports": "Trung tâm báo cáo",
            "/secretary/drafting-documents/drafting": "Soạn thảo tài liệu bầu cử",
        };
        setPageTitle(map[location.pathname] || "Trang quản lý");
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
            <Sideber onMenuSelect={setPageTitle} />

            <Layout
                style={{
                    marginLeft: 250, // bằng đúng width sidebar
                    height: "calc(100vh - 64px)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    overflow: "hidden", // ẩn scroll ngoài
                }}
            >
                <Header title={pageTitle}  />
                <Content
                    style={{
                        height: "calc(100vh - 64px)",
                        overflow: "auto",
                        padding: "10px 24px 24px",
                        background: "#EFF8EF",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default SecretaryLayout;
