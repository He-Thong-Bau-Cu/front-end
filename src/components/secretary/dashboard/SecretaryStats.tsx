import { Card, Row, Col, Typography, message } from "antd";
import {
    PieChartOutlined,
    TeamOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import StatisticsService from "@/services/StatisticsService";
import DelegationService from "@/services/DelegationService";
const { Text } = Typography;
const SecretaryStats = () => {
    const [statistic, setStatistic] = useState<any[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const electionId = localStorage.getItem("currentElectionId") || "";
                const userId = localStorage.getItem("userId") || "";
                const res = await DelegationService.getDelegationByElectionId(electionId);
                const onlyPending = res.filter((item: any) => item?.status === "PENDING");
                const pendingCount = onlyPending.length;
                const data = await StatisticsService.getDashBoardSecratary(userId, electionId);
                let dataMap = [] as any[];
                dataMap.push({ title: "Tổng số cử tri", icon: <TeamOutlined />, value: data.totalVoters !== null ? data.totalVoters : 0 })
                dataMap.push({ title: "Uỷ quyền đã xác nhận", icon: <PieChartOutlined />, value: data.totalConfirmed !== null ? data.totalConfirmed : 0 })
                dataMap.push({ title: "Uỷ quyền chờ xác nhận", icon: <FileTextOutlined />, value: pendingCount===0 ? 0 : pendingCount })
                dataMap.push({ title: "Số cuộc bầu cử đang tham gia", icon: <FileTextOutlined />, value: data.totalElectionsParticipated !== null ? data.totalElectionsParticipated : 0 })
                setStatistic(dataMap);
            } catch (error) {
                message.error("Không thể tải thông tin người dùng!");
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
export default SecretaryStats;
