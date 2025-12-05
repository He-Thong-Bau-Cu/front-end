import BoardOfControlHeader from "@/components/board_of_control/Header";
import Sideber from "@/components/board_of_control/Sidebar";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import bannerContent from "@/assets/banner_content.png";

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
            // "/board-of-control/control-reports": "Báo cáo kiểm soát",
            "/board-of-control/verify-results": "Xác minh kết quả",
            "/board-of-control/voting-process": "Giam sát bỏ phiếu",
        };
        setPageTitle(map[location.pathname] || "Bảng điều khiển");
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
            <Sideber onMenuSelect={setPageTitle} />

            <BoardOfControlHeader title={pageTitle} user={user} />
            <Layout
                style={{
                    marginLeft: 250, // bằng đúng width sidebar
                    height: "100vh",
                    overflow: "hidden", // ẩn scroll ngoài
                }}
            >
                <Content
                    style={{
                        height: "100vh",
                        overflow: "auto",
                        padding: "100px 24px 24px 24px",
                        margin: 0,
                        backgroundImage: `url(${bannerContent})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default BoardOfControlLayout;

