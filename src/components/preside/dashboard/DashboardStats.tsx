import { Card, Row, Col, Typography, message } from "antd";
import {
    PieChartOutlined,
    TeamOutlined,
    FileTextOutlined,
    BarChartOutlined,
    AlertOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useEffect, useState } from "react";
import SystemService from "@/services/StatisticsService";
import { getUserLogin } from "@/utils/auth";
const { Text } = Typography;



const DashboardStats = () => {

    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();
    const [statistic, setStatistic] = useState<any[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Lấy thông tin user để check chairmanOfTheBoardOfDirectors
                const userData = await getUserLogin();
                const isSystemPreside = userData?.chairmanOfTheBoardOfDirectors;

                // Lấy electionId từ localStorage nếu không phải system preside
                const electionId = !isSystemPreside
                    ? localStorage.getItem("currentElectionId")
                    : undefined;

                const data = await SystemService.getDashboardStats(electionId || undefined);
                let dataMap = [] as any[];
                dataMap.push({ title: "Tổng số kỳ bầu cử", icon: <PieChartOutlined />, value: data.totalElections !== null ? data.totalElections : 0 })
                dataMap.push({ title: "Tổng số cử tri", icon: <TeamOutlined />, value: data.totalVoters !== null ? data.totalVoters : 0 })
                dataMap.push({ title: "Quyết định chờ duyệt", icon: <FileTextOutlined />, value: data.pendingApprovals !== null ? data.pendingApprovals : 0 })
                dataMap.push({ title: "Tỷ lệ tham gia", icon: <BarChartOutlined />, value: data.participationRate !== null ? data.participationRate : 0 })
                setStatistic(dataMap);
            } catch (err: any) {
                notify(err.response?.data?.message, "error");
            }
        };
        fetchUser();
    }, []);
    return (
        <Row gutter={[16, 16]} className="dashboard-stats-row">
            {statistic.map((s, i) => (
                <Col xs={24} sm={12} md={8} lg={6} key={i}>
                    <Card hoverable className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">{s.icon}</div>
                        <Text strong className="dashboard-stat-value">
                            {Math.round(s.value)}{s.icon === "how_to_vote" ? "%" : ""}
                        </Text>
                        <p className="dashboard-stat-label">{s.title}</p>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}



export default DashboardStats;
