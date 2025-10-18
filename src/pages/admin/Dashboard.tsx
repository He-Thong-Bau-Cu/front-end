import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sideber from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { useState } from 'react';

const Dashboard = () => {
    const [pageTitle, setPageTitle] = useState('Dashboard');
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sideber onMenuSelect={setPageTitle} />
            <Layout >
                <AdminHeader title={pageTitle} />

                <Content
                    style={{
                        marginTop: 100,
                        padding: 24,
                        background: '#fff',
                        minHeight: 'calc(100vh - 100px)',
                    }}
                >
                    Nội dung ở đây
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
