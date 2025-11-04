import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import Header from '@/components/head_of_the_organizing_committee/Header';
import Sideber from '@/components/head_of_the_organizing_committee/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const HeadOfTheOrganizingCommitteeLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            "/head_of_the_Organizing_committee/dashboard": "Tổng quan",
            "/head_of_the_Organizing_committee/list_meeting": "Danh sách cuộc họp",
            "/head_of_the_Organizing_committee/meetings": "Quản lý cuộc họp",
            "/head_of_the_Organizing_committee/create_meeting": "Tạo cuộc họp",
            "/head_of_the_Organizing_committee/attendance_confirm": "Bảng theo dõi xác nhận tham dự",
            "/head_of_the_Organizing_committee/election_tracking": "Bảng theo dõi cuộc bầu cử",
            "/head_of_the_Organizing_committee/create-delegate-card": "Phát hành thẻ đại biểu",
        };

        setPageTitle(map[location.pathname] || "Bảng điều khiển");
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
                <Header title={pageTitle} />
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

export default HeadOfTheOrganizingCommitteeLayout;
