import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import OrganizingCommitteeHeader from '@/components/organizing-committee/Header';
import Sideber from '@/components/organizing-committee/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import bannerContent from "@/assets/banner_content.png";

const OrganizingCommitteeLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            "/organizing-committee": "Tổng quan",
            "/organizing-committee/checkin": "Checkin",
            "/organizing-committee/create-participants": "Danh sách người tham dự cuộc họp",
            "/organizing-committee/verify-delegates": "Xác thực đại biểu",
            // "/organizing-committee/manage-delegates": "Quản lý danh sách đại biểu và cổ đông",
        };

        setPageTitle(map[location.pathname] || "Trang quản lý Ban Tổ chức");
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: '10vh', width: '100vw', overflow: 'hidden' }}>
            <Sideber onMenuSelect={setPageTitle} />

            <Layout style={{
                marginLeft: 250,
                backgroundImage: `url(${bannerContent})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                display: "flex",
                flexDirection: "column",
                width: 'calc(100vw - 290px)',
                minHeight: '100vh',
                overflow: 'hidden',
            }}>
                <OrganizingCommitteeHeader title={pageTitle} />
                <Content
                    style={{
                        flex: 1,
                        padding: '32px 24px 24px',
                        backgroundImage: `url(${bannerContent})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
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

export default OrganizingCommitteeLayout;
