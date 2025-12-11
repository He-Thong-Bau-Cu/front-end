import { useEffect, useState, useRef } from "react";
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
import { DeleteOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons";
import { User } from "@/types/User.interface";
import DecisionService from "@/services/DecisionService";
import ElectionService from "@/services/ElectionService";
import { USER_ROLE } from "@/enums/STATUS";
const { Text } = Typography;
const { Option } = Select;
interface Member {
  _id?: string; // ID từ backend (nếu có = edit, không có = mới)
  id: number | string; // ID tạm cho UI (có thể là number hoặc string)
  userId: string;
  fullName: string;
  roleId: string;
  roleName: string;
  status?: string;
}
interface Props {
  onChange: (data: Member[]) => void;
  data?: any;
  disabled?: boolean;
  attendeesList?: any[]; // Danh sách cử tri để lọc
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

const Organization: React.FC<Props> = ({ onChange, data, disabled = false, attendeesList = [] }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const prevDataRef = useRef<any>(null);
  const idCounterRef = useRef<number>(0);

  // Chỉ gọi getUsers() 1 lần khi component mount
  useEffect(() => {
    const getUsers = async () => {
      try {
        const electionId = localStorage.getItem("currentElectionId") || "";
        const userId = localStorage.getItem("userId") || "";
        setCurrentUserId(userId); // Lưu userId hiện tại để dùng cho disable nút xóa
        const election = await DecisionService.getElectionById(electionId);
        const res = await ElectionService.getElectionUser();
        // Lọc bỏ user có userId trùng với userId hiện tại
        const filteredUsers = res.filter((user: User) => user._id !== userId);
        setUsers(filteredUsers);
      } catch (err) {
        message.error("Không thể tải danh sách người dùng!");
      }
    };
    getUsers();
  }, []); // Chỉ chạy 1 lần khi mount

  // Xử lý data riêng, chỉ gọi onChange khi data thực sự thay đổi
  useEffect(() => {
    // So sánh data với data trước đó để tránh re-render không cần thiết
    const dataString = JSON.stringify(data);
    const prevDataString = JSON.stringify(prevDataRef.current);

    if (dataString === prevDataString) {
      return; // Không có thay đổi, không cần xử lý
    }

    prevDataRef.current = data;

    if (data && Array.isArray(data)) {
      // Lọc bỏ những thành viên có roleCode là VOTER
      const filteredData = data.filter((item: any) => {
        // Kiểm tra roleCode từ role object (được populate từ backend)
        if (item.role?.roleCode) {
          return item.role.roleCode !== USER_ROLE.VOTER;
        }
        // Nếu không có role object, kiểm tra roleId có phải là object với roleCode không
        if (item.roleId?.roleCode) {
          return item.roleId.roleCode !== USER_ROLE.VOTER;
        }
        // Nếu không có roleCode, giữ lại (có thể là roleId string chưa được populate)
        return true;
      }).map((item: any, index: number) => {
        // Tạo unique ID: ưu tiên _id, nếu không có thì dùng userId + roleId, cuối cùng dùng index + timestamp
        const uniqueId = item._id ||
          `${item.userId || item.user?._id || 'user'}_${item.roleId?._id || item.roleId || item.role?._id || 'role'}_${index}` ||
          `temp_${Date.now()}_${index}`;

        return {
          _id: item._id,
          id: uniqueId,
          userId: item.userId || item.user?._id,
          fullName: item.fullName || item.user?.fullName,
          roleId: item.roleId?._id || item.roleId || item.role?._id,
          roleName: item.roleName || item.role?.roleName,
          status: item.status,
        };
      });

      setMembers(filteredData);
      onChange(filteredData);
    } else if (!data) {
      // Nếu data là null/undefined, reset members
      setMembers([]);
      onChange([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // Chỉ phụ thuộc vào data, onChange được gọi nhưng không cần trong dependency

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

    // Kiểm tra role đã được chọn chưa (mỗi role chỉ được chọn 1 lần)
    const roleAlreadySelected = members.some((m) => m.roleId === values.roleId);
    if (roleAlreadySelected) {
      const roleName =
        values.roleId === "6906eb6a3bb016c908c61b92"
          ? "Trưởng ban tổ chức"
          : values.roleId === "6906eb903bb016c908c61b99"
            ? "Thành viên ban tổ chức"
            : "Ban kiểm soát";
      return message.error(`Vai trò "${roleName}" đã được chọn! Mỗi vai trò chỉ được chọn 1 lần.`);
    }

    // Tạo unique ID cho member mới: userId_roleId_timestamp_counter
    idCounterRef.current += 1;
    const uniqueId = `${values.userId}_${values.roleId}_${Date.now()}_${idCounterRef.current}`;

    const newMember: Member = {
      id: uniqueId,
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
              <TeamOutlined style={{ marginRight: 8 }} />
              Thành viên tổ chức ({members.length})
            </Text>
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <a
                className="add-link"
                onClick={() => !disabled && setIsModalOpen(true)}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.5 : 1,
                  pointerEvents: disabled ? "none" : "auto"
                }}
              >
                <PlusOutlined style={{ marginRight: 4 }} />
                Thêm
              </a>
            </div>
          </div>
        }
      >
        {members.map((m) => {
          // Kiểm tra xem user này có phải là user hiện tại không (thư ký)
          const isCurrentUser = m.userId === currentUserId;
          // Kiểm tra xem có phải là ban kiểm soát không (roleId = "693a5bcc1d62567f679795e0")
          const isBoardOfControl = m.roleId === "693a5bcc1d62567f679795e0";
          const isChuToa = m.roleId === "693a5b9e1d62567f679795c4"; // ID của Chữ Tòa
          const canDelete = !disabled && !isCurrentUser && !isBoardOfControl && !isChuToa;

          // Xác định title cho tooltip
          let deleteTitle = "Xóa";
          if (isCurrentUser) {
            deleteTitle = "Không thể xóa chính mình";
          } else if (isBoardOfControl) {
            deleteTitle = "Không thể xóa ban kiểm soát";
          }

          return (
            <div key={m.id} className="participant-item">
              <div>
                <strong>{m.fullName}</strong>
                <p>{m.roleName}</p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Tag color={statusColor(m.status || "PENDING")} style={{ margin: 0, marginTop: 2 }}>
                  {m.status === "ACTIVE"
                    ? "Đã xác nhận"
                    : m.status === "INACTIVE"
                      ? "Đã hủy"
                      : "Chờ duyệt"}
                </Tag>
                <DeleteOutlined
                  onClick={() => canDelete && handleDelete(m)}
                  style={{
                    color: canDelete ? "red" : "#ccc",
                    cursor: canDelete ? "pointer" : "not-allowed",
                    opacity: canDelete ? 1 : 0.5,
                    marginTop: 2
                  }}
                  title={deleteTitle}
                />
              </div>
            </div>
          );
        })}
      </Card>

      {/* ================= MODAL THÊM THÀNH VIÊN ================= */}
      <Modal
        title={
          <>
            <PlusOutlined style={{ marginRight: 8 }} />
            Thêm thành viên tổ chức
          </>
        }
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
              disabled={disabled}
              onChange={handleSelectUser}
              allowClear
              showSearch
            >
              {users
                .filter((u) => {
                  // Lọc bỏ user đã được chọn trong danh sách thành viên tổ chức
                  const isInMembers = members.some((m) => m.userId === u._id);
                  // Lọc bỏ user đã được chọn trong danh sách cử tri
                  const isInAttendees = attendeesList.some((a) => a.userId === u._id);
                  return !isInMembers && !isInAttendees;
                })
                .map((u) => (
                  <Option key={u._id} value={u._id}>
                    {u.fullName}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {/* ROLE */}
          <Form.Item
            label="Chức vụ"
            name="roleId"
            rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
          >
            <Select placeholder="Vui lòng chọn chức vụ" disabled={disabled} allowClear showSearch>
              <Option
                value="6906eb6a3bb016c908c61b92"
                disabled={members.some((m) => m.roleId === "6906eb6a3bb016c908c61b92")}
              >
                Trưởng ban tổ chức
                {members.some((m) => m.roleId === "6906eb6a3bb016c908c61b92") && " (đã chọn)"}
              </Option>
              <Option
                value="6906eb903bb016c908c61b99"
                disabled={members.some((m) => m.roleId === "6906eb903bb016c908c61b99")}
              >
                Thành viên ban tổ chức
                {members.some((m) => m.roleId === "6906eb903bb016c908c61b99") && " (đã chọn)"}
              </Option>
              <Option
                value="693a5bcc1d62567f679795e0"
                disabled={members.some((m) => m.roleId === "693a5bcc1d62567f679795e0")}
              >
                Ban kiểm soát
                {members.some((m) => m.roleId === "693a5bcc1d62567f679795e0") && " (đã chọn)"}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              disabled={disabled}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>

            <Button type="primary" htmlType="submit" disabled={disabled}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Organization;
