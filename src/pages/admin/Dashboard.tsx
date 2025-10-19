import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sideber from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { useState } from 'react';
import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import DashboardCharts from '@/components/admin/dashboard/DashboardCharts';
import DashboardElections from '@/components/admin/dashboard/DashboardElections';
import DashboardActivity from '@/components/admin/dashboard/DashboardActivity';

const Dashboard = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    return (
        <Layout>
            <Sideber onMenuSelect={setPageTitle} />

            <Layout style={{ paddingLeft: '290px' }}>
                <AdminHeader title={pageTitle} />
                <Content
                    style={{
                        marginTop: 100,
                        padding: 24,
                        background: '#EFF8EF',
                        position: 'fixed',
                        overflowY: "auto",
                        height: "100vh",
                        paddingBottom: '300px'
                    }}
                >
                    <DashboardStats />
                    <DashboardCharts />
                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: 2 }}>
                            <DashboardElections />
                        </div>
                        <div style={{ flex: 1 }}>
                            <DashboardActivity />
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout >
    );
};

export default Dashboard;
