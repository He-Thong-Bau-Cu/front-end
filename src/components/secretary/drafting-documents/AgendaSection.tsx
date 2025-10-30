import { Card, List, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const agendaItems = [
    {
        id: 1,
        title: "Báo cáo kết quả kinh doanh Quý 3",
        presenter: "Ông Trần Minh Hoàng",
        time: "30 phút",
    },
    {
        id: 2,
        title: "Thảo luận và phê duyệt Kế hoạch Q4",
        presenter: "Bà Nguyễn Thị Lan Anh",
        time: "45 phút",
    },
    {
        id: 3,
        title: "Bỏ phiếu đề xuất dự án 'Chuyển đổi số'",
        presenter: "Ông Lê Gia Bảo",
        time: "20 phút",
    },
];

const AgendaSection: React.FC = () => {
    return (
        <Card title={<Text style={{ paddingLeft: 20, fontSize: 16 }}>🧾 Chương trình nghị sự</Text>} className="meeting-card">
            <List
                dataSource={agendaItems}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <EditOutlined key="edit" />,
                            <DeleteOutlined key="delete" />,
                        ]}
                    >
                        <div>
                            <Text strong>
                                {item.id}. {item.title}
                            </Text>
                            <div className="agenda-meta">
                                Người trình bày: {item.presenter} | Thời lượng: {item.time}
                            </div>
                        </div>
                    </List.Item>
                )}
            />
            <a className="add-link">+ Thêm mục</a>
        </Card>
    );
};

export default AgendaSection;
