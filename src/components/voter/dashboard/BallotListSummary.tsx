import { Card, Typography, Button, Empty } from "antd";
import { FileTextOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BallotCard from "@/components/voter/BallotCard";
import { Ballot } from "@/types/Ballot.interface";
import "../../../style/voter/Dashboard.model.css";

const { Text, Title } = Typography;

// Mock data - sẽ được thay thế bằng API call
const ballots: Ballot[] = [
    {
        id: 1,
        title: "Bầu cử Đại biểu Quốc hội Khóa XVI",
        desc: "Bầu chọn đại diện cho khu vực bầu cử số 1, Quận 1, TP. Hồ Chí Minh.",
        endTime: "15/12/2024 - 17:00",
        status: "Đang diễn ra",
        type: 2,
    },
    {
        id: 2,
        title: "Biểu quyết Nghị quyết cổ đông 2025",
        desc: "Thông qua kế hoạch hoạt động và tài chính năm 2025.",
        endTime: "10/01/2025 - 17:00",
        status: "Chưa bắt đầu",
        type: 1,
    },
    {
        id: 3,
        title: "Bầu chọn Ban Kiểm soát nhiệm kỳ 2025-2030",
        desc: "Cuộc bầu chọn thành viên Ban kiểm soát mới.",
        endTime: "30/01/2025 - 17:00",
        status: "Đã kết thúc",
        type: 1,
    },
];

const BallotListSummary = () => {
    const navigate = useNavigate();

    const handleCardClick = (ballot: Ballot) => {
        if (ballot.status === "Đang diễn ra" && ballot.type === 1)
            navigate("/voter/ballot_resolution_voting");
        else if (ballot.status === "Đang diễn ra" && ballot.type === 2)
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
                        <div key={ballot.id} className="ballot-list-summary-item">
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



