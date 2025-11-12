import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import VoterService from "@/services/VoterService";
import {
    BarChartOutlined,
    CheckCircleOutlined,
    FileDoneOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import "../../../style/voter/Dashboard.model.css";


const { Text } = Typography;

const VoterStats = () => {
    const [statsData, setStatsData] = useState({
        totalVoters: 0,
        totalParticipants: 0,
        participationPercentage: 0,
        voterNotActive: 0,
    });
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();




    useEffect(() => {
        async function fetchStats() {
            try {
                showLoading();
                const electionId = localStorage.getItem("currentElectionId");
                if (!electionId) {
                    notify("Không tìm thấy electionId", "error");
                    return;
                }
                const data = await VoterService.getDashboardVoterByElectionId(electionId);
                setStatsData(data);

            } catch (error) {
                console.error(error);
                notify("Không thể lấy thống kê cho voter", "error");
            } finally {
                hideLoading();
            }
        }

        fetchStats();
    }, []);

    const stats = [
        {
            icon: <CheckCircleOutlined />,
            title: "Tổng số cử tri",
            value: statsData.totalVoters,
            color: "#27AE60",
            bg: "#E8F8F2",
        },
        {
            icon: <FileDoneOutlined />,
            title: "Tổng người tham gia",
            value: statsData.totalParticipants,
            color: "#4A90E2",
            bg: "#E8F1FB",
        },
        {
            icon: <BarChartOutlined />,
            title: "Tỷ lệ tham gia",
            value: `${statsData.participationPercentage}%`,
            color: "#F39C12",
            bg: "#FFF6E5",
        },
        {
            icon: <UserOutlined />,
            title: "Chưa tham gia",
            value: `${statsData.voterNotActive}%`,
            color: "#8E44AD",
            bg: "#F4E6FA",
        }

    ];


    return (
        <Row gutter={[16, 16]} className="voter-stats-container">
            {stats.map((item, i) => (
                <Col xs={24} sm={12} md={6} key={i}>
                    <Card
                        bordered={false}
                        className="voter-stat-card voter-stat-horizontal"
                        style={{ borderTop: `5px solid ${item.color}` }}
                    >
                        <div className="voter-stat-inner">
                            <div
                                className="voter-stat-icon-box"
                                style={{ backgroundColor: item.bg, color: item.color }}
                            >
                                {item.icon}
                            </div>

                            <div className="voter-stat-text">
                                <Text strong className="voter-stat-value">
                                    {item.value}
                                </Text>
                                <Text className="voter-stat-title">{item.title}</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default VoterStats;
