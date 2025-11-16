import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import Header from '@/components/preside/Header';
import Sideber from '@/components/preside/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const PresideLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            "/preside": "Tổng quan",
            "/preside/decision": "Quản lý quyết định",
            "/preside/authorization": "Phê duyệt ủy quyền",
            "/preside/election-monitor": "Giám sát bầu cử",
            "/preside/reports": "Quản lý báo cáo",
        };

        setPageTitle(map[location.pathname] || "Bảng điều khiển");
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
                <Header title={pageTitle} />
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

export default PresideLayout;
