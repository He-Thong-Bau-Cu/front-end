import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Divider,
} from "antd";
import { FileTextOutlined, FileAddOutlined } from "@ant-design/icons";
import "../../../style/preside/CreateDecisionModal.model.css";

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

  useEffect(() => {
    if (open) {
      if (editMode && initialData) {
        // Nạp dữ liệu khi chỉnh sửa
        form.setFieldsValue({
          decisionNumber: initialData.decisionNumber || "",
          decisionName: initialData.decisionName || "",
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
        </Row>

        <Divider />

        <div className="upload-section">
          <h3 className="upload-title">
            <FileAddOutlined /> Đính kèm tài liệu liên quan
          </h3>
          <p className="upload-sub">Chấp nhận định dạng: PDF, DOCX, XLSX</p>
          <div className="upload-box">
            <input type="file" />
          </div>
        </div>

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
