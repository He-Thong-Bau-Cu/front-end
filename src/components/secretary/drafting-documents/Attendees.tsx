import { useState } from "react";
import {
    Card,
    Tag,
    Typography,
    Modal,
    Form,
    Input,
    Select,
    Button,
} from "antd";

const { Text } = Typography;
const { Option } = Select;

interface Participant {
    name: string;
    email: string;
    role: string;
    status: string;
    phone?: string;
    department?: string;
    percentage?: number; // % cổ phần
}

const masterVoters: Participant[] = [
    {
        name: "Nguyễn Văn A",
        email: "a@company.com",
        role: "Chủ tịch HĐQT",
        status: "Đã xác nhận",
        phone: "0909123456",
        department: "Ban Điều Hành",
    },
    {
        name: "Trần Thị B",
        email: "b@company.com",
        role: "Phó Chủ tịch",
        status: "Đã xác nhận",
        phone: "0909000999",
        department: "Ban Điều Hành",
    }
];

const Attendees: React.FC = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [voterList] = useState<Participant[]>(masterVoters);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleSelectVoter = (email: string) => {
        const selected = voterList.find(v => v.email === email);
        if (selected) {
            form.setFieldsValue({
                name: selected.name,
                email: selected.email,
                role: selected.role,
                status: selected.status,
                phone: selected.phone,
                department: selected.department
            });
        }
    };

    const handleAdd = () => {
        form.validateFields().then(values => {
            setParticipants([...participants, values]);
            form.resetFields();
            setIsModalOpen(false);
        });
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "Đã xác nhận": return "green";
            case "Đang chờ": return "orange";
            case "Đã từ chối": return "red";
            default: return "default";
        }
    };

    return (
        <>
            <Card
                className="meeting-side-card"
                title={
                    <div className="card-header">
                        <Text style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>
                            👥 Danh sách cử tri ({participants.length})
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
                            <p>{p.phone}</p>
                            <p><b>% Cổ phần:</b> {p.percentage}%</p>
                        </div>
                        <Tag color={statusColor(p.status)}>{p.status}</Tag>
                    </div>
                ))}
            </Card>

            {/* MODAL */}
            <Modal
                title="➕ Chọn cử tri"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                width={600}
                bodyStyle={{ maxHeight: "60vh", overflowY: "auto" }}
            >
                <Form form={form} layout="vertical" onFinish={handleAdd}>

                    {/* CHỌN CỬ TRI CÓ SẴN */}
                    <Form.Item label="Chọn cử tri" name="selectedVoter"
                        rules={[{ required: true, message: "Vui lòng chọn cử tri" }]}>
                        <Select
                            showSearch
                            placeholder="Tìm theo tên hoặc email"
                            onChange={handleSelectVoter}
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {voterList.map((v, i) => (
                                <Option key={i} value={v.email}>
                                    {v.name} — {v.email}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="percentage"
                        label="% Cổ phần"
                        rules={[
                            { required: true, message: "Vui lòng nhập tỷ lệ cổ phần" },
                            { pattern: /^[0-9]+$/, message: "Chỉ nhập số" }
                        ]}
                    >
                        <Input placeholder="Nhập % cổ phần (VD: 10)" />
                    </Form.Item>

                    <Form.Item style={{ textAlign: "right" }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Lưu
                        </Button>
                    </Form.Item>

                    {/* THÔNG TIN TỰ FILL */}
                    <Form.Item name="name" label="Họ và tên">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="email" label="Email">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="role" label="Chức vụ">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="phone" label="Số điện thoại">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="department" label="Phòng ban">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="status" label="Trạng thái">
                        <Input disabled />
                    </Form.Item>

                    {/* NHẬP % CỔ PHẦN */}


                </Form>
            </Modal>
        </>
    );
};

export default Attendees;
