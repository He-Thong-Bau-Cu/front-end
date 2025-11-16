import VoterHeader from "@/components/voter/Header";
import Sideber from "@/components/voter/Sidebar";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
    const [pageTitle, setPageTitle] = useState("Tổng quan");
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        fetchDataUser();
    }, []);

    const fetchDataUser = async () => {
        try {
            const user = (await getUserLogin()) as User;
            setUser(user);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

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
                <VoterHeader title={pageTitle} user={user} />
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

export default AdminLayout;

