import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import OrganizingCommitteeHeader from '@/components/board_of_control/Header';
import Sideber from '@/components/board_of_control/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const BoardOfControlLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            "/board-of-control": "Tổng quan",
            "/board-of-control/achive-reports": "Bao cáo đã lưu trữ",
            "/board-of-control/control-reports": "Báo cáo kiểm soát",
            "/board-of-control/verify-results": "Xác minh kết quả",
            "/board-of-control/voting-process": "Giam sát bỏ phiếu",
        };

        setPageTitle(map[location.pathname] || "Trang quản lý Ban Tổ chức");
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
                <OrganizingCommitteeHeader title={pageTitle} />
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

export default BoardOfControlLayout;
