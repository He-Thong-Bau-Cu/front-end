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

import { DeleteOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons";
import ElectionService from "@/services/ElectionService";
import { User } from "@/types/User.interface";
import ExcelImport from "./ExcelImport";
import { Participant } from "@/types/Participants.interface";
import { useNotification } from "@/contexts/NotificationContext";
const { Text } = Typography;
const { Option } = Select;

interface Props {
  onChange: (data: Participant[]) => void;
  data?: any;
  disabled?: boolean;
  organizationMembers?: any[]; // Danh sách thành viên tổ chức để lọc
  onAddDocument?: (document: any) => void; // Callback để thêm document vào tài liệu đính kèm
  electionId?: string; // ID của election để upload file
}
const Attendees: React.FC<Props> = ({
  onChange,
  data,
  disabled = false,
  organizationMembers = [],
  onAddDocument,
  electionId,
}) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedVoter, setSelectedVoter] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false); // Track xem data đã được load chưa
  const [excelVotersLoaded, setExcelVotersLoaded] = useState(false); // Track xem đã load voters từ Excel chưa
  const { notify } = useNotification();

  /* ===========================================================
        CHỌN CỬ TRI
    ============================================================ */
  const handleSelectVoter = (email: string) => {
    const voter = users.find((v) => v.email === email);
    setSelectedVoter(voter);
  };
  const getUsers = async () => {
    try {
      const res = await ElectionService.getElectionVoter({});
      setUsers(res);
    } catch {
      notify("Không thể tải danh sách người dùng!", "error");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Load voters từ prop data (từ server) - chạy trước
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const mapped = data.map((item: any) => ({
        _id: item._id, // Giữ _id để có thể update
        id: item._id || String(Date.now() + Math.random()), // Giữ id cho UI
        userId: item.userId || item.user?._id,
        fullName: item.user?.fullName || item.fullName,
        email: item.user?.email || item.email,
        position: item.user?.position || item.position,
        phone: item.user?.phone || item.phone,
        citizenId: item.user?.citizenId || item.citizenId,
        address: item.user?.address || item.address,
        department: item.user?.department || item.department,
        percentage: item.percentage || item.shares,
        status: item.status,
        eligible: item.eligible,
        isImportedFromExcel: false,
      }));
      setParticipants(mapped);
      onChange(mapped);
      setDataLoaded(true); // Đánh dấu data đã được load
      setExcelVotersLoaded(false); // Reset flag để load lại voters từ Excel sau khi data thay đổi
    } else if (data === null || (Array.isArray(data) && data.length === 0)) {
      // Nếu data là null hoặc mảng rỗng, vẫn đánh dấu đã load
      setDataLoaded(true);
      setExcelVotersLoaded(false); // Reset flag để load lại voters từ Excel
    }
  }, [data]);

  // Load voters từ Excel SAU KHI data đã được load
  useEffect(() => {
    if (electionId && dataLoaded && !excelVotersLoaded) {
      const fetchVotersFromExcel = async () => {
        try {
          const res = await ElectionService.getVotersFromExcel(electionId);

          // Kiểm tra xem có voters không
          if (
            res &&
            res.data &&
            res.data.voters &&
            Array.isArray(res.data.voters) &&
            res.data.voters.length > 0
          ) {
            const votersFromExcel = res.data.voters;

            // Map voters từ Excel sang format của participants
            const mappedVoters = votersFromExcel.map((voter: any) => ({
              id: `excel-${voter.rowIndex}-${Date.now()}`,
              fullName: voter.fullName,
              email: voter.email,
              phone: voter.phone || "",
              citizenId: voter.citizenId || "",
              percentage: voter.percentage,
              isImportedFromExcel: true, // Đánh dấu voter được import từ Excel
              status: "PENDING", // Mặc định status
              position: "",
            }));

            setParticipants((currentParticipants) => {
              // Kiểm tra duplicate với participants hiện tại (theo email hoặc citizenId)
              const existingEmails = new Set(
                currentParticipants
                  .map((p) => p.email?.toLowerCase())
                  .filter(Boolean)
              );
              const existingCitizenIds = new Set(
                currentParticipants.map((p) => p.citizenId).filter(Boolean)
              );

              const newVoters = mappedVoters.filter((voter: any) => {
                const emailLower = voter.email?.toLowerCase();
                return (
                  !(emailLower && existingEmails.has(emailLower)) &&
                  !(voter.citizenId && existingCitizenIds.has(voter.citizenId))
                );
              });

              if (newVoters.length > 0) {
                // Merge với participants hiện tại (từ data prop)
                const updated = [...currentParticipants, ...newVoters];
                onChange(updated);
                return updated;
              }
              return currentParticipants;
            });
          }

          setExcelVotersLoaded(true);
        } catch (error) {
          console.error("Error fetching voters from Excel:", error);
          setExcelVotersLoaded(true);
        }
      };
      fetchVotersFromExcel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId, dataLoaded, excelVotersLoaded]);

  const totalPercentage = participants?.reduce(
    (sum, p) => sum + (Number(p.percentage) || 0),
    0
  );

  const handleAdd = (values: any) => {
    const userInfo = users.find((u) => u._id === values.userId);
    if (!userInfo) {
      return notify("Không tìm thấy thông tin người dùng!", "error");
    }

    // Kiểm tra tổng % cổ phần không vượt quá 100%
    const percentageValue = Number(values.percentage);
    const currentTotal = participants.reduce(
      (sum, p) => sum + (Number(p.percentage) || 0),
      0
    );
    const newTotal = currentTotal + percentageValue;

    if (newTotal > 100) {
      return notify(
        `Tổng cổ phần không được vượt quá 100%! (Hiện tại: ${currentTotal}%, Thêm: ${percentageValue}% = ${newTotal}%)`,
        "error"
      );
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
      percentage: percentageValue,
      isImportedFromExcel: false,
    };
    const updated = [...participants, newMember];
    setParticipants(updated);
    onChange(updated); // gửi dữ liệu về DraftingDocuments (không có _id = mới)
    form.resetFields();
    setSelectedVoter(null);
    setIsModalOpen(false);
  };
  const handleDelete = (participant: Participant) => {
    const updated = participants.filter((m) =>
      m._id ? m._id !== participant._id : m.id !== participant.id
    );
    setParticipants(updated);
    onChange(updated);
  };
  /* ===========================================================
        TAG MÀU TRẠNG THÁI - Đồng bộ với Organization
    ============================================================ */
  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "PENDING":
        return "orange";
      case "INACTIVE":
        return "red";
      case "AUTHORIZED":
        return "blue"; // Màu xanh dương cho trạng thái được ủy quyền
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
          <div
            className="card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "nowrap",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
                minWidth: 0,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                Danh sách cử tri ({participants.length})
              </Text>
              <Tag color="blue" style={{ margin: 0 }}>
                Tổng cổ phần: {totalPercentage}%
              </Tag>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <a
                className="add-link"
                onClick={() => !disabled && setIsModalOpen(true)}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.5 : 1,
                  pointerEvents: disabled ? "none" : "auto",
                  whiteSpace: "nowrap",
                }}
              >
                <PlusOutlined style={{ marginRight: 4 }} />
                Thêm
              </a>
              <ExcelImport
                disabled={disabled}
                participants={participants}
                setParticipants={setParticipants}
                organizationMembers={organizationMembers}
                onChange={onChange}
                users={users}
                onAddDocument={onAddDocument}
              />
            </div>
          </div>
        }
      >
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "8px",
          }}
        >
          {participants.map((p, i) => (
            <div
              key={i}
              className="participant-item"
              style={{
                borderLeft: p.isImportedFromExcel
                  ? "4px solid #52c41a"
                  : "4px solid #1890ff",
                paddingLeft: "8px",
                marginBottom: "8px",
              }}
            >
              <div>
                <strong>{p.fullName}</strong>
                {p.isImportedFromExcel && (
                  <Tag color="green" style={{ marginLeft: 8, fontSize: 10 }}>
                    Nhập từ Excel
                  </Tag>
                )}
                <p>{p.position}</p>
                <p>
                  <b>% Cổ phần:</b> {p.percentage}%
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Tag
                  color={statusColor(p.status || "PENDING")}
                  style={{ margin: 0, marginTop: 2 }}
                >
                  {p.status === "ACTIVE"
                    ? "Đã xác nhận"
                    : p.status === "INACTIVE"
                      ? "Đã hủy"
                      : p.status === "AUTHORIZED"
                        ? "Được ủy quyền"
                        : "Chờ duyệt"}
                </Tag>
                <DeleteOutlined
                  onClick={() => !disabled && handleDelete(p)}
                  style={{
                    color: disabled ? "#ccc" : "red",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                    marginTop: 2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ==================== MODAL CHỌN CỬ TRI ==================== */}
      <Modal
        title={
          <>
            <PlusOutlined style={{ marginRight: 8 }} />
            Chọn cử tri
          </>
        }
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
              disabled={disabled}
              onChange={handleSelectVoter}
            >
              {users
                .filter((u) => {
                  // Lọc bỏ user đã được chọn trong danh sách cử tri
                  const isInParticipants = participants.some(
                    (p) => p.userId === u._id
                  );
                  // Lọc bỏ user đã được chọn trong danh sách thành viên tổ chức
                  const isInOrganization = organizationMembers.some(
                    (m) => m.userId === u._id
                  );
                  return !isInParticipants && !isInOrganization;
                })
                .map((v, i) => (
                  <Option key={v._id || i} value={v._id}>
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
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const percentageValue = Number(value);
                  if (percentageValue <= 0) {
                    return Promise.reject("Tỷ lệ cổ phần phải lớn hơn 0");
                  }
                  if (percentageValue > 100) {
                    return Promise.reject(
                      "Tỷ lệ cổ phần không được vượt quá 100%"
                    );
                  }
                  // Kiểm tra tổng % hiện tại + % mới không vượt quá 100%
                  const currentTotal = participants.reduce(
                    (sum, p) => sum + (Number(p.percentage) || 0),
                    0
                  );
                  const newTotal = currentTotal + percentageValue;
                  if (newTotal > 100) {
                    return Promise.reject(
                      `Tổng cổ phần sẽ vượt quá 100% (hiện tại: ${currentTotal}%, thêm ${percentageValue}% = ${newTotal}%)`
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="VD: 12"
              disabled={disabled}
              suffix={
                <span style={{ color: "#999", fontSize: 12 }}>
                  Tổng hiện tại: {totalPercentage}%
                </span>
              }
            />
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

export default Attendees;
