import { Card, Typography, Button, Empty } from "antd";
import { FileTextOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BallotCard from "@/components/voter/BallotCard";
import { Ballot } from "@/types/Ballot.interface";
import "../../../style/voter/Dashboard.model.css";

const { Text, Title } = Typography;

// Mock data - sẽ được thay thế bằng API call
const ballots: Ballot[] = [];

const BallotListSummary = () => {
    const navigate = useNavigate();

    const handleCardClick = (ballot: Ballot) => {
        if (ballot.status === "Đang diễn ra")
            navigate("/voter/ballot_resolution_voting");
        else if (ballot.status === "Đang diễn ra")
            navigate("/voter/ballot_cumulative_voting");
    };

    const handleViewAll = () => {
        navigate("/voter/ballots");
    };

    return (
        <Card
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileTextOutlined style={{ fontSize: 18, color: "#27ae60" }} />
                    <Text strong style={{ fontSize: 17 }}>
                        Danh sách phiếu bầu
                    </Text>
                </div>
            }
            extra={
                <Button
                    type="link"
                    onClick={handleViewAll}
                    style={{
                        color: "#27ae60",
                        fontWeight: 500,
                        padding: 0,
                    }}
                >
                    Xem tất cả <RightOutlined />
                </Button>
            }
            className="ballot-list-summary-card"
        >
            {ballots.length > 0 ? (
                <div className="ballot-list-summary-content">
                    {ballots.slice(0, 3).map((ballot) => (
                        <div key={ballot._id} className="ballot-list-summary-item">
                            <BallotCard
                                ballot={ballot}
                                onClick={() => handleCardClick(ballot)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <Empty
                    description={<Text type="secondary">Chưa có phiếu bầu nào</Text>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
        </Card>
    );
};

export default BallotListSummary;



