import { Card, Button, Tag, Typography } from "antd";
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "../../../style/voter/Dashboard.model.css";

const { Text, Title } = Typography;

interface ElectionCardProps {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    date?: string;
    status?: "Sắp diễn ra" | "Đang diễn ra" | "Đã hoàn thành";
    action?: string;
}

const ElectionCard = ({ 
    name = "Bầu cử nghị quyết số 30",
    description = "Cuộc bầu cử để quyết định về nghị quyết số 30 của Hội đồng nhân dân thành phố.",
    startDate = "15/11/2025 08:00",
    endDate = "20/11/2025 17:00",
    date,
    status = "Sắp diễn ra",
    action = "Xem nghị quyết"
}: ElectionCardProps) => {
    const getStatusConfig = () => {
        switch (status) {
            case "Đang diễn ra":
                return {
                    color: "#27AE60",
                    bg: "#E8F8F2",
                    icon: <ClockCircleOutlined />,
                };
            case "Sắp diễn ra":
                return {
                    color: "#FFB84C",
                    bg: "#FFF7E6",
                    icon: <ExclamationCircleOutlined />,
                };
            case "Đã hoàn thành":
                return {
                    color: "#4C84FF",
                    bg: "#F0F5FF",
                    icon: <CheckCircleOutlined />,
                };
            default:
                return {
                    color: "#FFB84C",
                    bg: "#FFF7E6",
                    icon: <ExclamationCircleOutlined />,
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <Card className="single-election-card" bordered={false}>
            <div className="single-election-header">
                <Title level={3} className="single-election-title">
                    🗳️ Cuộc bầu cử của bạn
                </Title>
                <Tag
                    className="single-election-status-tag"
                    style={{
                        background: statusConfig.bg,
                        color: statusConfig.color,
                        border: "none",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                    }}
                >
                    {statusConfig.icon} {status}
                </Tag>
            </div>

            <div className="single-election-content">
                <div className="single-election-main">
                    <Title level={4} className="single-election-name">
                        {name}
                    </Title>
                    
                    {description && (
                        <Text className="single-election-description">
                            {description}
                        </Text>
                    )}

                    {startDate && endDate ? (
                        <div className="single-election-dates">
                            <div className="single-election-date-item">
                                <CalendarOutlined style={{ fontSize: 18, color: "#27ae60" }} />
                                <div>
                                    <div className="single-election-date-label">Bắt đầu</div>
                                    <div className="single-election-date-value">{startDate}</div>
                                </div>
                            </div>
                            <div className="single-election-date-item">
                                <ClockCircleOutlined style={{ fontSize: 18, color: "#e74c3c" }} />
                                <div>
                                    <div className="single-election-date-label">Kết thúc</div>
                                    <div className="single-election-date-value">{endDate}</div>
                                </div>
                            </div>
                        </div>
                    ) : date ? (
                        <div className="single-election-date">
                            <CalendarOutlined style={{ marginRight: 8, color: "#666" }} />
                            <Text>Ngày bầu cử: {date}</Text>
                        </div>
                    ) : null}
                </div>

                <div className="single-election-actions">
                    <Button
                        type="primary"
                        size="large"
                        className="single-election-primary-btn"
                        style={{
                            background: status === "Sắp diễn ra" ? "#d9f7be" : status === "Đang diễn ra" ? "#b7eb8f" : "#e6f4ff",
                            color: status === "Sắp diễn ra" ? "#389e0d" : status === "Đang diễn ra" ? "#52c41a" : "#1677ff",
                            border: "none",
                            fontWeight: 500,
                            height: "44px",
                            padding: "0 24px",
                        }}
                    >
                        {action}
                    </Button>
                    <Button
                        size="large"
                        className="single-election-secondary-btn"
                        style={{
                            height: "44px",
                            padding: "0 24px",
                        }}
                    >
                        Chi tiết
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ElectionCard;

