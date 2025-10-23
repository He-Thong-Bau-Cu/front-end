import { Card, Typography, Tag, Button } from "antd";
import { CheckOutlined, ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const historyData = [
    { name: "Trần Thị Lan", id: "032148567005", date: "15/05/2024", status: "Đang duyệt" },
    { name: "Nguyễn Văn Minh", id: "021354789125", date: "01/05/2024", status: "Đã duyệt" },
];

const AuthorizationHistory = () => (
    <Card title={<Text style={{ paddingLeft: 20, fontWeight: 'bold', fontSize: 18 }}>📜 Lịch sử ủy quyền của bạn</Text>} className="delegation-history-card">
        {historyData.map((item, i) => (
            <div key={i} className="delegation-history-item">
                <div>
                    <Text strong>{item.name}</Text>
                    <p style={{ color: "#777" }}>
                        CCCD: {item.id} — Ngày tạo: {item.date}
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {item.status === "Đang duyệt" ? (
                        <Tag color="orange">
                            <ClockCircleOutlined /> {item.status}
                        </Tag>
                    ) : (
                        <Tag color="green">
                            <CheckOutlined /> {item.status}
                        </Tag>
                    )}
                    <Button icon={<DeleteOutlined />} danger shape="circle" />
                </div>
            </div>
        ))}
    </Card>
);

export default AuthorizationHistory;
