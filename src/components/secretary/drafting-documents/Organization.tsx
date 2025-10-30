import { useState } from "react";
import { Card, Tag, Typography, Modal, Form, Input, Select, Button } from "antd";

const { Text } = Typography;
const { Option } = Select;

interface Member {
    name: string;
    role: string;
    status: string;
}

const initialMembers: Member[] = [
    { name: "Nguyễn Văn A", role: "Trưởng ban tổ chức", status: "Đã xác nhận" },
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

const Organization: React.FC = () => {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleAdd = () => {
        form
            .validateFields()
            .then((values) => {
                setMembers([...members, values]);
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
                            👥 Thành viên tổ chức ({members.length})
                        </Text>
                        <a className="add-link" onClick={() => setIsModalOpen(true)}>
                            + Thêm
                        </a>
                    </div>
                }
            >
                {members.map((m, i) => (
                    <div key={i} className="participant-item">
                        <div>
                            <strong>{m.name}</strong>
                            <p>{m.role}</p>
                        </div>
                        <Tag color={statusColor(m.status)}>{m.status}</Tag>
                    </div>
                ))}
            </Card>

            {/* Modal thêm thành viên */}
            <Modal
                title="➕ Thêm thành viên tổ chức"
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

export default Organization;
