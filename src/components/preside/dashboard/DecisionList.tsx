import { Card, Tag, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;

const decisions = [
    {
        code: "QD-016/2025",
        title: "Triệu tập HĐND cấp tỉnh",
        date: "07/10/2025",
        status: "Chờ duyệt",
    },
    {
        code: "QD-017/2025",
        title: "Phê duyệt danh sách cử tri",
        date: "06/10/2025",
        status: "Chờ duyệt",
    },
    {
        code: "QD-018/2025",
        title: "Bổ nhiệm ủy viên mới",
        date: "05/10/2025",
        status: "Đã duyệt",
    },
];

const DecisionList = () => (
    <Card
        title={<Text style={{ paddingLeft: 20, fontSize: 17 }} strong>📄 Quyết định chờ duyệt</Text>}
        extra={<a href="#" className="decision-list-link">Xem tất cả →</a>}
        className="decision-list-card"
    >
        {decisions.map((d, i) => (
            <div key={i} className="decision-item">
                <div className="decision-item-left">
                    <Text strong className="decision-code">{d.code}</Text>
                    <p className="decision-title">{d.title}</p>
                    <p className="decision-date">
                        <CalendarOutlined /> Ngày tạo: {d.date}
                    </p>
                </div>

                <div className="decision-item-right">
                    {d.status === "Đã duyệt" ? (
                        <Tag color="green" className="decision-tag">
                            Đã duyệt
                        </Tag>
                    ) : (
                        <Tag color="orange" className="decision-tag">
                            Chờ duyệt
                        </Tag>
                    )}
                </div>
            </div>
        ))}
    </Card>
);

export default DecisionList;
