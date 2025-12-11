import VoterHeader from "@/components/voter/Header";
import Sideber from "@/components/voter/Sidebar";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import DelegateCardService from "@/services/DelegateCardService";
import bannerContent from "@/assets/banner_content.png";

const AdminLayout = () => {
    const [pageTitle, setPageTitle] = useState("Tổng quan");
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const { notify } = useNotification();
    const hasCheckedDelegateCard = useRef(false);

    useEffect(() => {
        fetchDataUser();
    }, []);

    useEffect(() => {
        // Chỉ check và tạo thẻ đại biểu khi navigate vào voter pages lần đầu
        if (!hasCheckedDelegateCard.current) {
            checkAndCreateDelegateCard();
            hasCheckedDelegateCard.current = true;
        }
    }, []);

    const fetchDataUser = async () => {
        try {
            const user = (await getUserLogin()) as User;
            setUser(user);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const checkAndCreateDelegateCard = async () => {
        try {
            const electionId = localStorage.getItem("currentElectionId");
            const voterId = localStorage.getItem("voterId");

            if (!electionId || !voterId) {
                return;
            }

            const checkResponse = await DelegateCardService.checkExists(electionId, voterId);

            if (!checkResponse.exists) {
                notify("Đang tạo thẻ đại biểu...", "info");

                try {
                    const createResponse = await DelegateCardService.autoCreate(electionId);

                    if (createResponse.success) {
                        notify("Tạo thẻ thành công", "success");
                    } else {
                        console.log("Không thể tạo thẻ đại biểu:", createResponse.message);
                    }
                } catch (error: any) {
                    console.error("Error creating delegate card:", error);
                }
            }
        } catch (error: any) {
            console.error("Error checking delegate card:", error);
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
        setPageTitle(map[location.pathname] || "Tổng quan");
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
            <Sideber onMenuSelect={setPageTitle} />

            <VoterHeader title={pageTitle} user={user} />
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

export default AdminLayout;

