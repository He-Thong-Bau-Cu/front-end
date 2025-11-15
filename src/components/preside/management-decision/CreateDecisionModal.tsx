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
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import "../../../style/preside/CreateDecisionModal.model.css";
import UserService from "@/services/UserService"; // <-- thêm service lấy user

const { Option } = Select;

interface CreateDecisionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any, isEdit?: boolean, id?: string) => void;
  editMode?: boolean;
  initialData?: any;
}

const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editMode = false,
  initialData,
}) => {
  const [form] = Form.useForm();

  const [userList, setUserList] = useState<any[]>([]);

  // 🔥 Load danh sách user
  const loadUsers = async () => {
    try {
      const res = await UserService.getNonVoter();
      setUserList(res || []);
    } catch (err) {
      console.error("Không thể load user:", err);
    }
  };

  useEffect(() => {
    if (open) loadUsers();
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editMode && initialData) {
        form.setFieldsValue({
          decisionNumber: initialData.decisionNumber || "",
          decisionName: initialData.decisionName || "",
          secretaryId: initialData.signerId || undefined, // ⬅ SET DEFAULT USER
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editMode, initialData, form]);

  const handleFinish = (values: any) => {
    onSubmit(values, editMode, initialData?._id);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="create-decision-modal"
      destroyOnClose
    >
      {/* HEADER */}
      <div className="modal-header">
        <FileTextOutlined className="header-icon" />
        <div>
          <h2 className="header-title">
            {editMode ? "Chỉnh sửa nghị quyết bầu cử" : "Tạo nghị quyết bầu cử"}
          </h2>
          <p className="header-sub">
            {editMode
              ? "Cập nhật thông tin nghị quyết bầu cử"
              : "Vui lòng nhập đầy đủ thông tin nghị quyết trước khi gửi phê duyệt"}
          </p>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* BODY */}
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        className="form-body"
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="decisionNumber"
              label="Số quyết định"
              rules={[{ required: true, message: "Vui lòng nhập số quyết định" }]}
            >
              <Input placeholder="VD: QĐ-15/2025/QH-16" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="decisionName"
              label="Tên nghị quyết"
              rules={[{ required: true, message: "Vui lòng nhập tên nghị quyết" }]}
            >
              <Input placeholder="VD: Nghị quyết phê duyệt dự án..." />
            </Form.Item>
          </Col>

          {/* 🔥 SELECT USER */}
          <Col span={12}>
            <Form.Item
              name="secretaryId"
              label="Thư ký chủ tọa"
              rules={[{ required: true, message: "Vui lòng người đảm nhiệm" }]}
            >
              <Select placeholder="Chọn thư ký" allowClear showSearch>
                {userList.map((user: any) => (
                  <Option key={user._id} value={user._id}>
                    {user.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
        </Row>

        <Divider />

        {/* FOOTER */}
        <div className="modal-footer">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" className="btn-create">
            {editMode ? "Cập nhật nghị quyết" : "Tạo nghị quyết"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDecisionModal;
