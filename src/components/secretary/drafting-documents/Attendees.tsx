import { useEffect, useState } from "react";
import {
    Card,
    Tag,
    Typography,
    Modal,
    Form,
    Input,
    Select,
    Button,
    message,
} from "antd";

import {
    DeleteOutlined,
} from "@ant-design/icons";
import ElectionService from "@/services/ElectionService";
import DecisionService from "@/services/DecisionService";
import { User } from "@/types/User.interface";
import { P } from "framer-motion/dist/types.d-BJcRxCew";
const { Text } = Typography;
const { Option } = Select;
interface Participant {
    id?: number;
    userId: string
    fullName: string;
    email: string;
    position?: string;
    status: string;
    phone?: string;
    citizenId?: string;
    address: string;
    department?: string;
    percentage?: number;
}

interface Props {
    onChange: (data: Participant[]) => void;
}


const Attendees: React.FC<Props> = ({ onChange }) => {
    const [participants, setParticipants] = useState<any[]>([]);
    const [selectedVoter, setSelectedVoter] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [users, setUsers] = useState<User[]>([]);

    /* ===========================================================
        CHỌN CỬ TRI
    ============================================================ */
    const handleSelectVoter = (email: string) => {
        const voter = users.find((v) => v.email === email);
        setSelectedVoter(voter);
    };
    const getUsers = async () => {
        try {
            const electionId = localStorage.getItem("currentElectionId") || "";
            const election = await DecisionService.getElectionById(electionId);
            const res = await ElectionService.getElectionUser({ startData: election.startDate, endDate: election.startDate });
            setUsers(res);
        } catch (err) {
            message.error("Không thể tải danh sách người dùng!");
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const totalPercentage = participants.reduce(
        (sum, p) => sum + (Number(p.percentage) || 0),
        0
    );


    const handleAdd = (values: any) => {
        const userInfo = users.find((u) => u._id === values.userId);

        if (!userInfo) {
            return message.error("Không tìm thấy thông tin người dùng!");
        }

        const newMember: Participant = {
            id: Date.now(),
            userId: values.userId,
            fullName: userInfo.fullName,
            email: userInfo.email,
            position: userInfo.position,
            status: userInfo.status,
            phone: userInfo.phone,
            citizenId: userInfo.citizenId,
            address: userInfo.address,
            department: userInfo.department,
            percentage: values.percentage

        };

        const updated = [...participants, newMember];
        setParticipants(updated);
        onChange(updated); // gửi dữ liệu về DraftingDocuments

        form.resetFields();
        setSelectedVoter(null);
        setIsModalOpen(false);
    };
    const handleDelete = (id: number) => {
        const updated = participants.filter((m) => m.id !== id);
        setParticipants(updated);
        onChange(updated);
    };
    /* ===========================================================
        TAG MÀU TRẠNG THÁI
    ============================================================ */
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

    return (
        <>
            {/* ==================== DANH SÁCH CỬ TRI ==================== */}
            <Card
                className="meeting-side-card"
                title={
                    <div className="card-header">
                        <Text style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>
                            👥 Danh sách cử tri ({participants.length})
                        </Text>
                        <Tag color="blue" style={{ marginLeft: 10 }}>
                            Tổng cổ phần: {totalPercentage}%
                        </Tag>

                        <a
                            className="add-link"
                            onClick={() => setIsModalOpen(true)}
                            style={{ cursor: "pointer" }}
                        >
                            + Thêm
                        </a>
                    </div>
                }
            >
                {participants.map((p, i) => (
                    <div key={i} className="participant-item">
                        <div>
                            <strong>{p.fullName}</strong>
                            <p>{p.position}</p>
                            <p>
                                <b>% Cổ phần:</b> {p.percentage}%
                            </p>
                        </div>
                        <Tag color={statusColor(p.status || "PENDING")}>
                            {p.status === "ACTIVE"
                                ? "Đã xác nhận"
                                : p.status === "INACTIVE"
                                    ? "Đã hủy"
                                    : "Chờ duyệt"}
                        </Tag>

                        <DeleteOutlined
                            onClick={() => handleDelete(p.id)}
                            style={{ color: "red", marginLeft: 10 }}

                        />,
                    </div>
                ))}
            </Card>

            {/* ==================== MODAL CHỌN CỬ TRI ==================== */}
            <Modal
                title="➕ Chọn cử tri"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedVoter(null);
                }}
                footer={null}
                centered
                width={650}
                styles={{
                    body: {
                        maxHeight: "65vh",
                        overflowY: "auto",
                        padding: "20px 24px",
                    },
                }}
            >
                <Form form={form} layout="vertical" onFinish={handleAdd}>
                    {/* CHỌN CỬ TRI */}
                    <Form.Item
                        label="Chọn cử tri"
                        name="userId"
                        rules={[{ required: true, message: "Vui lòng chọn cử tri" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Tìm theo tên hoặc email"
                            onChange={handleSelectVoter}
                        >
                            {users
                                .filter((u) => !participants.some((p) => p.userId === u._id))
                                .map((v, i) => (
                                    <Option key={i} value={v._id}>
                                        {v.fullName} — {v.email}
                                    </Option>
                                ))}

                        </Select>
                    </Form.Item>

                    {/* % CỔ PHẦN */}
                    <Form.Item
                        name="percentage"
                        label="% Cổ phần"
                        rules={[
                            { required: true, message: "Vui lòng nhập tỷ lệ cổ phần" },
                            { pattern: /^[0-9]+$/, message: "Chỉ nhập số" },
                        ]}
                    >
                        <Input placeholder="VD: 12" />
                    </Form.Item>

                    {/* THÔNG TIN CHI TIẾT CỬ TRI */}
                    {selectedVoter && (
                        <Card
                            size="small"
                            style={{ background: "#f9fafc", borderRadius: 10 }}
                            title="📌 Thông tin cử tri"
                        >
                            <p>
                                <b>Họ tên:</b> {selectedVoter.fullName}
                            </p>
                            <p>
                                <b>Email:</b> {selectedVoter.email}
                            </p>
                            <p>
                                <b>Chức vụ:</b> {selectedVoter.position}
                            </p>
                            <p>
                                <b>SĐT:</b> {selectedVoter.phone}
                            </p>
                            <p>
                                <b>Phòng ban:</b> {selectedVoter.department}
                            </p>
                            <p>
                                <b>Trạng thái:</b>{" "}
                                <Tag color={statusColor(selectedVoter.status)}>
                                    {selectedVoter.status}
                                </Tag>
                            </p>
                        </Card>
                    )}

                    {/* BUTTONS */}
                    <Form.Item style={{ textAlign: "right", marginTop: 20 }}>
                        <Button
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedVoter(null);
                            }}
                            style={{ marginRight: 8 }}
                        >
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

export default Attendees;
