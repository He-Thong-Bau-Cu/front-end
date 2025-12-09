import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Select,
  DatePicker,
  Tag,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import "../../../style/preside/CreateDecisionModal.model.css";
import { useNotification } from "@/contexts/NotificationContext";
import dayjs from "dayjs";
import UserService from "@/services/UserService";
import ElectionService from "@/services/ElectionService";
const { Option } = Select;
interface CreateDecisionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any, isEdit?: boolean, id?: string) => void;
  editMode?: boolean;
  initialData?: any;
  secrytary?: any;
}
const FORMAT = "YYYY-MM-DD HH:mm:ss"; // FORMAT CHUẨN KHÔNG LỆCH GIỜ
const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editMode,
  initialData,
  secrytary
}) => {
  const [form] = Form.useForm();
  const [userList, setUserList] = useState<any[]>([]);
  const { notify } = useNotification();
  const [showAddSecretary, setShowAddSecretary] = useState(false);
  // Giờ hành chính
  const WORK_START = 8;   // 08:00
  const WORK_END = 17;    // 17:00

  // Disable time ngoài giờ hành chính
  const disabledTime = () => {
    return {
      disabledHours: () => {
        const hours: number[] = [];
        for (let h = 0; h < 24; h++) {
          if (h < WORK_START || h >= WORK_END) hours.push(h);
        }
        return hours;
      },
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  };

  /* ===========================================================
      LOAD USER (KHÔNG CẦN THỜI GIAN)
  =========================================================== */
  const loadUsers = async () => {
    try {
      const res = await ElectionService.getElectionUser();
      setUserList(res || []);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
    }
  };

  /* ===========================================================
      INIT FORM WHEN OPEN / EDIT
  =========================================================== */
  useEffect(() => {
    if (open) {
      // Load users ngay khi mở form
      loadUsers();

      if (editMode && initialData) {
        // Convert từ string backend -> dayjs đúng format
        const start = initialData.startDate
          ? dayjs(initialData.startDate, FORMAT)
          : null;
        const end = initialData.endDate
          ? dayjs(initialData.endDate, FORMAT)
          : null;
        form.setFieldsValue({
          decisionNumber: initialData.decisionNumber || "",
          decisionName: initialData.decisionName || "",
          secretaryId: secrytary?.userId?._id || undefined,
          presideId: initialData.presideId || undefined,
          startDate: start,
          endDate: end,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editMode, initialData, form]);

  /* ===========================================================
      SUBMIT
  =========================================================== */
  const handleFinish = (values: any) => {

    // Nếu chọn trạng thái "Chờ thư ký nhập dữ liệu" → cảnh báo trước
    if (values.statusData === "WAIT_ENTER_DATA") {
      Modal.confirm({
        title: "Xác nhận tạo quyết định",
        content:
          "Nếu bạn tạo với trạng thái 'Chờ thư ký nhập dữ liệu' thì SAU KHI TẠO bạn sẽ không được phét chỉnh sửa lại nội dung bầu cử. Bạn có chắc chắn muốn tiếp tục không?",
        okText: "Tiếp tục",
        cancelText: "Hủy",
        onOk: () => {
          const payload = {
            ...values,
            startDate: values.startDate?.format(FORMAT),
            endDate: values.endDate?.format(FORMAT),
          };
          onSubmit(payload, editMode, initialData?._id);
        }
      });
      return;
    }

    // Trường hợp trạng thái khác → xử lý bình thường
    const payload = {
      ...values,
      startDate: values.startDate?.format(FORMAT),
      endDate: values.endDate?.format(FORMAT),
    };

    onSubmit(payload, editMode, initialData?._id);
  };


  /* ===========================================================
      MIN DATE = TODAY + 20 DAYS
  =========================================================== */
  const todayPlus20 = dayjs().add(21, "day").startOf("day");

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={750}
      className="create-decision-modal"
      centered
    >
      {/* HEADER */}
      <div className="modal-header">
        <FileTextOutlined className="header-icon" />
        <div>
          <h2 className="header-title">
            {editMode ? "Chỉnh sửa quyết định bầu cử" : "Tạo quyết định bầu cử"}
          </h2>
          <p className="header-sub">
            {editMode
              ? "Cập nhật thông quyết định bầu cử"
              : "Nhập đầy đủ thông tin cần thiết"}
          </p>
        </div>
      </div>

      <Divider />

      {/* FORM */}
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={[0, 16]}>
          {/* Số quyết định */}
          <Col span={24}>
            <Form.Item
              name="decisionNumber"
              label="Số quyết định"
              rules={[{ required: true, message: "Vui lòng nhập số quyết định" }]}
            >
              <Input placeholder="VD: QĐ-15/2025/QH-16" />
            </Form.Item>
          </Col>

          {/* Tên nghị quyết */}
          <Col span={24}>
            <Form.Item
              name="decisionName"
              label="Tên quyết định"
              rules={[{ required: true, message: "Vui lòng nhập tên quyết định" }]}
            >
              <Input placeholder="Nhập tên quyết định" />
            </Form.Item>
          </Col>

          {/* DATE RANGE */}
          <Row gutter={20} style={{ width: "100%" }}>
            {/* Thời gian bắt đầu */}
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Thời gian bắt đầu"
                rules={[{ required: true }]}
              >
                <DatePicker
                  showTime={{
                    format: "HH:mm",
                    disabledTime,   // ⬅ CHỈ ĐƯỢC CHỌN TRONG GIỜ HÀNH CHÍNH
                  }}
                  format={FORMAT}
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian bắt đầu"
                  disabledDate={(current) => current && current < todayPlus20}
                  onChange={(value) => {
                    form.setFieldsValue({ startDate: value });
                  }}
                />

              </Form.Item>
            </Col>

            {/* Thời gian kết thúc */}
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Thời gian kết thúc"
                dependencies={["startDate"]}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue("startDate");
                      if (!value || !start) return Promise.resolve();

                      // Cho phép cùng ngày nhưng giờ phải sau
                      if (value.isBefore(start)) {
                        return Promise.reject(
                          "Thời gian kết thúc phải sau thời gian bắt đầu"
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  showTime={{
                    format: "HH:mm",
                    disabledTime,   // ⬅ CHỈ ĐƯỢC CHỌN TRONG GIỜ HÀNH CHÍNH
                  }}
                  format={FORMAT}
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian kết thúc"
                  disabledDate={(current) => {
                    const start = form.getFieldValue("startDate");

                    if (!start) return current && current < todayPlus20;

                    return current && current < start.startOf("day");
                  }}
                  onChange={(value) => {
                    form.setFieldsValue({ endDate: value });
                  }}
                />

              </Form.Item>
            </Col>
          </Row>

          {/* Chủ tọa */}
          <Col span={24}>
            <Form.Item
              name="presideId"
              label="Chủ tọa"
              rules={[{ required: !editMode, message: "Vui lòng chọn chủ tọa" }]}
            >
              <Select
                placeholder="Chọn chủ tọa"
                allowClear
                disabled={editMode}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label || option?.children;
                  if (typeof label === 'string') {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  if (Array.isArray(label)) {
                    return label.some((item: any) =>
                      String(item?.props?.children || item).toLowerCase().includes(input.toLowerCase())
                    );
                  }
                  return false;
                }}
              >
                {userList.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.fullName} - {user.email}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Thư ký */}
          <Col span={24}>
            {!showAddSecretary && (
              <>
                <Form.Item
                  name="secretaryId"
                  label="Thư ký chủ tọa"
                  rules={[{ required: !editMode, message: "Vui lòng chọn thư ký" }]}
                >
                  <Select placeholder="Chọn thư ký" allowClear disabled={editMode}>
                    {/* Option hiện tại (dùng khi EDIT) */}
                    {editMode && secrytary?.userId && (
                      <Option value={secrytary.userId._id}>
                        {secrytary.userId.fullName} - {secrytary.userId.email}
                      </Option>
                    )}

                    {/* Danh sách userList */}
                    {userList.map((user) => (
                      <Option key={user._id} value={user._id}>
                        {user.fullName} - {user.email}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {!editMode ? (
                  <Tag
                    color={"blue"}
                    style={{
                      fontSize: 14,
                      padding: "8px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      marginBottom: 20
                    }}
                    onClick={() => setShowAddSecretary(true)}
                  >
                    + Thêm thư ký mới
                  </Tag>
                ) : null}
              </>
            )}

            {showAddSecretary && (
              <div
                style={{
                  padding: "16px",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  marginTop: 12,
                  background: "#fafafa"
                }}
              >
                <Divider>Thông tin thư ký mới</Divider>

                <Form.Item
                  label="Họ và tên người được ủy quyền *"
                  name="new_name"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="Nhập họ tên đầy đủ" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="CCCD/CMND *"
                      name="new_cccd"
                      rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}
                    >
                      <Input placeholder="Số CCCD" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Số điện thoại *"
                      name="new_phone"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                      <Input placeholder="Số điện thoại" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email *"
                      name="new_email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                      ]}
                    >
                      <Input placeholder="Email" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Địa chỉ *"
                      name="new_address"
                      rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                      <Input placeholder="Địa chỉ" />
                    </Form.Item>
                  </Col>
                </Row>

                <Tag
                  color={"blue"}
                  style={{
                    fontSize: 14,
                    padding: "8px 14px",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                  onClick={() => setShowAddSecretary(false)}
                >
                  ← Quay lại chọn từ danh sách
                </Tag>
              </div>
            )}
          </Col>

        </Row>

        {/* FOOTER */}
        <div className="modal-footer">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" >
            {editMode ? "Cập nhật quyết định" : "Tạo quyết định"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDecisionModal;
