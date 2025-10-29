import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;


const VotingResultSummary: React.FC = () => {
    const navigate = useNavigate();

    const summary = {
        title: "Kết quả Bầu cử Đại biểu Quốc hội Khóa XVI",
        location: "Khu vực bầu cử số 1 - Quận 1, TP. Hồ Chí Minh",
        date: "15/12/2024 - 17:00",
        totalVotes: 15234,
        validVotes: 14856,
        invalidVotes: 378,
        participation: "89.2%",
    };

    return (
        <div className="voting-wrapper">
            <Card className="summary-card">
                <div className="summary-header">
                    <Title level={4}>{summary.title}</Title>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        className="voting-result-back-btn"
                        onClick={() => navigate(`/voter/results`)}
                    >
                        Quay lại
                    </Button>
                </div>

                <Text type="secondary">{summary.location}</Text>
                <div className="summary-meta">
                    <span>📅 Kết thúc: {summary.date}</span>
                    <span>📍 Quận 1, TP.HCM</span>
                    <span>🧑‍💼 5 Ứng cử viên</span>
                </div>

                <Row gutter={24} className="summary-stats">
                    <Col span={6} className="stat-item">
                        <Title level={4} className="stat-value">
                            {summary.totalVotes}
                        </Title>
                        <Text>Tổng phiếu</Text>
                    </Col>
                    <Col span={6} className="stat-item">
                        <Title level={4} className="stat-value">
                            {summary.validVotes}
                        </Title>
                        <Text>Phiếu hợp lệ</Text>
                    </Col>
                    <Col span={6} className="stat-item">
                        <Title level={4} className="stat-value">
                            {summary.invalidVotes}
                        </Title>
                        <Text>Phiếu không hợp lệ</Text>
                    </Col>
                    <Col span={6} className="stat-item">
                        <Title level={4} className="stat-value">
                            {summary.participation}
                        </Title>
                        <Text>Tỷ lệ tham gia</Text>
                    </Col>
                </Row>
            </Card>


        </div>
    );
};

export default VotingResultSummary;
