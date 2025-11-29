import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import { Card, Col, Row, Typography } from "antd";
import { useEffect, useState, useCallback } from "react";
import BallotStatsListener from "./BallotStatsListener";

const { Title, Text } = Typography;

const VotingHeader = () => {
    const [stats, setStats] = useState({
        total: 0,
        cast: 0,
        notCast: 0,
    });

    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();
    const electionId = localStorage.getItem("currentElectionId") || "";

    // Tách hàm fetch stats để có thể gọi lại realtime
    const fetchStats = useCallback(async () => {
        try {
            showLoading();
            const data = await BallotService.getBallotStatisticsByElectionId(electionId);
            const cast = data.ballotStatus.find((s) => s._id === "CAST")?.totalBallots || 0;

            setStats({
                total: data.total,
                cast,
                notCast: data.total - cast,
            });
        } catch {
            notify("Không hiển thị được thống kê phiếu bầu");
        } finally {
            hideLoading();
        }
    }, [electionId]);

    // Load lần đầu
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const displayStats = [
        { label: "Tổng số phiếu trong cuộc bầu cử", value: stats.total },
        { label: "Tổng số phiếu đã bỏ", value: stats.cast },
        { label: "Tổng số phiếu chưa bỏ", value: stats.notCast },
    ];

    return (
        <>
            {/* Listener realtime */}
            <BallotStatsListener electionId={electionId} onUpdate={fetchStats} />

            <Card className="voting-header-card">
                <div className="voting-header-top">
                    <Title level={5} style={{ margin: 0 }}>
                        📊 Xem thống kê tất cả số phiếu trong cuộc bầu cử
                    </Title>
                </div>

                <Row gutter={16} className="voting-stats-row">
                    {displayStats.map((s, i) => (
                        <Col xs={24} sm={12} md={8} key={i}>
                            <Card bordered className="voting-stat-card">
                                <Text className="voting-stat-value">{s.value}</Text>
                                <p className="voting-stat-label">{s.label}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
        </>
    );
};

export default VotingHeader;
