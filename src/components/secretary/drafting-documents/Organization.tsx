import { useEffect, useState } from "react";
import { Card, Tag, Typography, Modal, Form, Input, Select, Button, message } from "antd";
import { User } from "@/types/User.interface";
import UserService from "@/services/UserService";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import { useNotification } from "@/contexts/NotificationContext";
import { useLoading } from "@/contexts/LoadingContext";
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
        case "ACTIVE":
            return "green";
        case "PENDING":
            return "orange";
        case "INACTIVE":
            return "red";
        default:
            return "default";
    }
};

const Organization: React.FC = () => {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [user, setUser] = useState<User[] | null>(null);
    const { notify } = useNotification();
    const { showLoading, hideLoading } = useLoading();


    useEffect(() => {
        getUser();
    }, [])

    const getUser = async () => {
        try {
            const userData = await UserService.getNonVoter();
            setUser(userData);
        } catch (error) {
            message.error("Không thể tải thông tin người dùng!");
        }
    }
    const handleAdd = async (values: any) => {
        try {
            showLoading();
            const electionId = localStorage.getItem("currentElectionId");

            const UserInfo = {
                electionId: electionId,
                userId: values.userId,
                roleId: values.roleId,
                position: "Ban tổ chức",
            };

            const response = await ElectionParticipantsService.createParticipant(UserInfo);

            if (response.success) {
                setIsModalOpen(false);
                form.resetFields(); // reset form luôn cho sạch
                notify(response.message, "success");
            } else {
                notify(response.message, "error");
            }
        } catch (error) {
            console.error(error);
            message.error("Không thể thêm ban tổ chức");
        } finally {
            hideLoading();
        }
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
                {/* {members.map((m, i) => (
                    <div key={i} className="participant-item">
                        <div>
                            <strong>{m.name}</strong>
                            <p>{m.role}</p>
                        </div>
                        <Tag color={statusColor(m.status)}>{m.status}</Tag>
                    </div>
                ))} */}
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
                        name="userId"
                        rules={[{ required: true, message: "Chọn trạng thái" }]}
                    >
                        <Select placeholder="Chọn bạn tổ chức" allowClear showSearch>
                            {user?.map((u) => (
                                <Option key={u._id} value={u._id}>
                                    {u.fullName}
                                </Option>
                            ))}
                        </Select>

                    </Form.Item>

                    <Form.Item
                        label="Chức vụ"
                        name="roleId"
                        rules={[{ required: true, message: "Chọn trạng thái" }]}
                    >
                        <Select placeholder="Vui lòng chọn chức vụ" allowClear showSearch>
                            <Option value="6906eb6a3bb016c908c61b92">Trưởng ban tổ chức</Option>
                            <Option value="6906eb903bb016c908c61b99">Thành viên ban tổ chức</Option>
                        </Select>
                    </Form.Item>

                    {/* <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Chọn trạng thái" }]}
                    >
                         <Input placeholder="Nhập họ và tên" required value="PENDING"> Chờ duyệt</Input>
                    </Form.Item> */}

                    <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Lưu
                        </Button>
                    </Form.Item>

                </Form>
            </Modal>
        </>
    );
};

export default Organization;
