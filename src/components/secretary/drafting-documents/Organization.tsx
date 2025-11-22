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
import { DeleteOutlined } from "@ant-design/icons";
import { User } from "@/types/User.interface";
import DecisionService from "@/services/DecisionService";
import ElectionService from "@/services/ElectionService";
const { Text } = Typography;
const { Option } = Select;
interface Member {
  _id?: string; // ID từ backend (nếu có = edit, không có = mới)
  id: number; // ID tạm cho UI
  userId: string;
  fullName: string;
  roleId: string;
  roleName: string;
  status?: string;
}
interface Props {
  onChange: (data: Member[]) => void;
  data?: any;
}

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

const Organization: React.FC<Props> = ({ onChange, data }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const getUsers = async () => {
    try {
      const electionId = localStorage.getItem("currentElectionId") || "";
      const election = await DecisionService.getElectionById(electionId);
      const res = await ElectionService.getElectionUser({
        startData: election.startDate,
        endDate: election.startDate,
      });
      setUsers(res);
    } catch (err) {
      message.error("Không thể tải danh sách người dùng!");
    }
  };

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setMembers(data);
      onChange(data);
    }
    getUsers();
  }, []);

  const handleSelectUser = (email: string) => {
    const voter = users.find((v) => v.email === email);
    setSelectedUser(voter);
  };


  const handleAdd = (values: any) => {
    const userInfo = users.find((u) => u._id === values.userId);

    if (!userInfo) {
      return message.error("Không tìm thấy thông tin người dùng!");
    }
    if (members.some((m) => m.userId === values.userId)) {
      return message.error("Người này đã được thêm vào danh sách!");
    }

    const newMember: Member = {
      id: Date.now(),
      userId: values.userId,
      fullName: userInfo.fullName,
      roleId: values.roleId,
      roleName:
        values.roleId === "6906eb6a3bb016c908c61b92"
          ? "Trưởng ban tổ chức"
          : values.roleId === "6906eb903bb016c908c61b99"
            ? "Thành viên ban tổ chức"
            : "Ban kiểm soát",
      status: "PENDING",
    };

    const updated = [...members, newMember];
    setMembers(updated);
    onChange(updated);

    form.resetFields();
    setIsModalOpen(false);
  };

  const handleDelete = (member: Member) => {
    const updated = members.filter((m) =>
      m._id ? m._id !== member._id : m.id !== member.id
    );
    setMembers(updated);
    onChange(updated);
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
        {members.map((m) => (
          <div key={m.id} className="participant-item">
            <div>
              <strong>{m.fullName}</strong>
              <p>{m.roleName}</p>
            </div>
            <Tag color={statusColor(m.status || "PENDING")}>
              {m.status === "ACTIVE"
                ? "Đã xác nhận"
                : m.status === "INACTIVE"
                  ? "Đã hủy"
                  : "Chờ duyệt"}
            </Tag>
            <DeleteOutlined
              onClick={() => handleDelete(m)}
              style={{ color: "red", marginLeft: 10 }}
            />
            ,
          </div>
        ))}
      </Card>

      {/* ================= MODAL THÊM THÀNH VIÊN ================= */}
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
          {/* USER */}
          <Form.Item
            label="Họ và tên"
            name="userId"
            rules={[{ required: true, message: "Vui lòng chọn thành viên" }]}
          >
            <Select
              placeholder="Chọn thành viên"
              onChange={handleSelectUser}
              allowClear
              showSearch
            >
              {users.map((u) => {
                const isSelected = members.some((m) => m.userId === u._id);

                return (
                  <Option key={u._id} value={u._id} disabled={isSelected}>
                    {u.fullName} {isSelected ? " (đã chọn)" : ""}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {/* ROLE */}
          <Form.Item
            label="Chức vụ"
            name="roleId"
            rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
          >
            <Select placeholder="Vui lòng chọn chức vụ" allowClear showSearch>
              <Option value="6906eb6a3bb016c908c61b92">
                Trưởng ban tổ chức
              </Option>
              <Option value="6906eb903bb016c908c61b99">
                Thành viên ban tổ chức
              </Option>
              <Option value="6907a5b5399e3682d80a1ddf">Ban kiểm soát</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button
              onClick={() => setIsModalOpen(false)}
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

export default Organization;
