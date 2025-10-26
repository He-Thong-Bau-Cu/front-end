import { Card, Button, Tag, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const elections = [
    {
        name: "Bầu cử nghị quyết số 30",
        date: "15/11/2025",
        status: "Sắp diễn ra",
        action: "Xem nghị quyết",
        color: "#FFB84C",
    },
    {
        name: "Bầu cử Phó chủ tịch hội đồng quản trị khóa 10",
        date: "20/11/2025",
        status: "Sắp diễn ra",
        action: "Xem ứng viên",
        color: "#FFB84C",
    },
    {
        name: "Bầu cử bãi nhiệm tổng giám đốc",
        date: "25/08/2025",
        status: "Đã hoàn thành",
        action: "Xem kết quả",
        color: "#4C84FF",
    },
    {
        name: "Bầu cử tăng vốn đầu tư",
        date: "10/05/2025",
        status: "Đã hoàn thành",
        action: "Xem kết quả",
        color: "#4C84FF",
    },
];

const ElectionList = () => (
    <Card
        title={<Text style={{ paddingLeft: 25, fontSize: 17 }} strong>🗳️ Các kỳ bầu cử</Text>}
        extra={
            <a href="#" className="election-view-all">
                Xem tất cả →
            </a>
        }
        className="election-card"
    >
        {elections.map((e, i) => (
            <div key={i} className="election-item">
                <div className="election-info">
                    <Text strong className="election-name">
                        {e.name}
                    </Text>
                    <p className="election-date">
                        <CalendarOutlined style={{ marginRight: 6 }} /> Ngày bầu cử:{" "}
                        {e.date}
                    </p>
                    <div className="election-buttons">
                        <Button
                            size="small"
                            className="election-btn primary"
                            style={{
                                background:
                                    e.status === "Sắp diễn ra" ? "#d9f7be" : "#e6f4ff",
                                color: e.status === "Sắp diễn ra" ? "#389e0d" : "#1677ff",
                                border: "none",
                            }}
                        >
                            {e.action}
                        </Button>
                        <Button size="small" className="election-btn">
                            Chi tiết
                        </Button>
                    </div>
                </div>

                <Tag
                    className="election-status"
                    style={{
                        background:
                            e.status === "Sắp diễn ra" ? "#fff7e6" : "#f0f5ff",
                        color: e.color,
                        border: "none",
                    }}
                >
                    {e.status}
                </Tag>
            </div>
        ))}
    </Card>
);

export default ElectionList;
