import { useState } from "react";
import { Card, Tag, Typography, Modal, Form, Input, Select, Button } from "antd";

const { Text } = Typography;
const { Option } = Select;

interface Participant {
    name: string;
    email: string;
    role: string;
    status: string;
}

const initialParticipants: Participant[] = [
    {
        name: "Nguyễn Văn A",
        email: "nguyenvana@company.com",
        role: "Chủ tịch HĐQT",
        status: "Đã xác nhận",
    },
    {
        name: "Trần Thị B",
        email: "tranthib@company.com",
        role: "Phó Chủ tịch",
        status: "Đã xác nhận",
    },
    {
        name: "Lê Văn C",
        email: "levanc@company.com",
        role: "Thành viên HĐQT",
        status: "Đang chờ",
    },
    {
        name: "Phạm Thị D",
        email: "phamthid@company.com",
        role: "Thành viên HĐQT",
        status: "Đã từ chối",
    },
];

const statusColor = (status: string) => {
    switch (status) {
        case "Đã xác nhận":
            return "green";
        case "Đang chờ":
            return "orange";
        case "Đã từ chối":
            return "red";
        default:
            return "default";
    }
};

const Attendees: React.FC = () => {
    const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleAdd = () => {
        form
            .validateFields()
            .then((values) => {
                setParticipants([...participants, values]);
                form.resetFields();
                setIsModalOpen(false);
            })
            .catch(() => { });
    };

    return (
        <>
            <Card
                className="meeting-side-card"
                title={
                    <div className="card-header">
                        <Text style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>
                            👥 Người tham dự ({participants.length})
                        </Text>
                        <a className="add-link" onClick={() => setIsModalOpen(true)}>
                            + Thêm
                        </a>
                    </div>
                }
            >
                {participants.map((p, i) => (
                    <div key={i} className="participant-item">
                        <div>
                            <strong>{p.name}</strong>
                            <p>{p.role}</p>
                            {/* <span className="email-text">{p.email}</span> */}
                        </div>
                        <Tag color={statusColor(p.status)}>{p.status}</Tag>
                    </div>
                ))}
            </Card>

            {/* Modal thêm người */}
            <Modal
                title="➕ Thêm người tham dự"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleAdd}
                    style={{ marginTop: 10 }}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <Input placeholder="example@company.com" />
                    </Form.Item>

                    <Form.Item
                        label="Chức vụ"
                        name="role"
                        rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
                    >
                        <Input placeholder="Nhập chức vụ" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue="Đang chờ"
                        rules={[{ required: true, message: "Chọn trạng thái" }]}
                    >
                        <Select>
                            <Option value="Đã xác nhận">Đã xác nhận</Option>
                            <Option value="Đang chờ">Đang chờ</Option>
                            <Option value="Đã từ chối">Đã từ chối</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" onClick={handleAdd}>
                            Lưu
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Attendees;
