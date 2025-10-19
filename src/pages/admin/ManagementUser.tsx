import AdminHeader from "@/components/admin/Header";
import Sideber from "@/components/admin/Sidebar";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useState } from "react";

const ManagementUser = () => {
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
                    haha
                </Content>
            </Layout>
        </Layout >
    )

}

export default ManagementUser;