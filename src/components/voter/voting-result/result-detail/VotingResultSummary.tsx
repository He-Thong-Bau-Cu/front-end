import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import ElectionService from "@/services/ElectionService";
import { Election } from "@/types/Election.interface";
import { Card, Col, Row, Spin, Typography } from "antd";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

const VotingResultSummary: React.FC = () => {
    const [election, setElection] = useState<Election | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        cast: 0,
        notCast: 0,
    });

    const electionId = localStorage.getItem("currentElectionId");
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            try {
                showLoading();

                if (!electionId) {
                    notify("Không tìm thấy electionId!", "error");
                    return;
                }
                const resElection = await ElectionService.getElectionId(electionId);
                setElection(resElection);

                const data = await BallotService.getBallotStatisticsByElectionId(electionId);
                const cast = data.ballotStatus.find((s) => s._id === "CAST")?.totalBallots || 0;

                setStats({
                    total: data.total,
                    cast,
                    notCast: data.total - cast,
                });

            } catch {
                notify("Lỗi tải dữ liệu kết quả bầu cử!", "error");
            } finally {
                hideLoading();
            }
        };

        fetchData();
    }, []);


    if (!election) {
        return (
            <div className="voting-wrapper" style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="voting-wrapper">
            <Card className="summary-card">
                <div className="summary-header">
                    <Title level={4}>{election?.title}</Title>
                </div>

                <div className="summary-meta">
                    <span>
                        📅 Kết thúc:{" "}
                        {moment.utc(election?.endDate).format("DD/MM/YYYY HH:mm")}
                    </span>
                </div>


                {/* 🔥 Thống kê phiếu bầu */}
                <Row gutter={24} className="summary-stats">
                    <Col span={6} className="stat-item">
                        <Title style={{ color: "#27ae60" }} level={3}>{stats.total}</Title>
                        <Text>Tổng số cử tri tham gia bỏ phiếu</Text>
                    </Col>

                    <Col span={6} className="stat-item">
                        <Title style={{ color: "#27ae60" }} level={3}>{stats.cast}</Title>
                        <Text>Tổng số cử tri đã bỏ phiếu</Text>
                    </Col>

                    <Col span={6} className="stat-item">
                        <Title style={{ color: "#27ae60" }} level={3}>{stats.notCast}</Title>
                        <Text>Tổng số cử tri chưa bỏ phiếu</Text>
                    </Col>

                    <Col span={6} className="stat-item">
                        <Title style={{ color: "#27ae60" }} level={3}>
                            {stats.total === 0
                                ? "0%"
                                : `${Math.round((stats.cast / stats.total) * 100)}%`}
                        </Title>
                        <Text>Tỷ lệ tham gia</Text>
                    </Col>
                </Row>
            </Card>
        </div >
    );
};

export default VotingResultSummary;
