import BoardOfControlHeader from "@/components/board_of_control/Header";
import Sideber from "@/components/board_of_control/Sidebar";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const BoardOfControlLayout = () => {
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
            "/board-of-control": "Tổng quan",
            "/board-of-control/achive-reports": "Bao cáo đã lưu trữ",
            "/board-of-control/control-reports": "Báo cáo kiểm soát",
            "/board-of-control/verify-results": "Xác minh kết quả",
            "/board-of-control/voting-process": "Giam sát bỏ phiếu",
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
                <BoardOfControlHeader title={pageTitle} user={user} />
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

export default BoardOfControlLayout;

