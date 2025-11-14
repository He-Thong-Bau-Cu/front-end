import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import Header from '@/components/voter/Header';
import Sideber from '@/components/voter/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const VoterLayout = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const location = useLocation();


    useEffect(() => {
        const map: Record<string, string> = {
            '/': 'Tổng quan',
            '/voter/authorization': 'Ủy quyền',
            '/voter/voting-history': 'Lịch sử bỏ phiếu',
            '/voter/ballots': 'Phiếu bầu',
            '/voter/results': 'Kết quả bỏ phiếu',
            '/voter/delegate-card': 'Thẻ đại biểu',
            '/voter/ballot_cumulative_voting': 'Bỏ phiếu',
            '/voter/ballot_resolution_voting': 'Bỏ phiếu',
            '/voter/results/detail': 'Kết quả bỏ phiếu chi tiết',
            '/voter/create-authorization': 'Tạo ủy quyền',
            '/voter/request-authorization': 'Tạo ủy quyền',
            '/voter/authorization-form': 'Tạo ủy quyền',
            '/voter/authorization-detail': 'Chi tiết ủy quyền'

        };

        setPageTitle(map[location.pathname] || 'Bảng điều khiển');
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sideber onMenuSelect={setPageTitle} />

            <div style={{
                marginLeft: 250,
                background: "#EFF8EF",
                display: "flex",
                flexDirection: "column",
                width: 'calc(100vw - 250px)',
                minHeight: '100vh',
                overflow: 'hidden',
            }}>
                <Header title={pageTitle} />
                <Content
                    style={{
                        flex: 1,
                        padding: '10px 24px 10px 24px',
                        background: '#EFF8EF',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        boxSizing: 'border-box',
                        marginTop: 100
                    }}
                >
                    <Outlet />

                </Content>
            </div>
        </Layout >
    );
};

export default VoterLayout;
