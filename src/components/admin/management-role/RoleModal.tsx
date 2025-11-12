import { Modal, Form, Input, Switch, Button, Row, Col, Tag } from "antd";
import { FC, useEffect, useState } from "react";
import {
  UserOutlined,
  CodeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

interface RoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  mode: "add" | "edit";
}

const RoleModal: FC<RoleModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  mode,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues && mode === "edit") {
      form.setFieldsValue({
        roleId: initialValues.roleId,
        roleName: initialValues.roleName,
        roleCode: initialValues.roleCode,
        description: initialValues.description,
        status: initialValues.status === "ACTIVE" ? true : false,
      });
    } else if (visible && mode === "add") {
      form.resetFields();
    }
  }, [visible, initialValues, mode, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit({
        ...values,
        status: values.status ? "ACTIVE" : "INACTIVE",
      });
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const statusValue = Form.useWatch("status", form);

  return (
    <Modal
      open={visible}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ fontSize: "20px", color: "#fff" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            {mode === "add" ? "Thêm mới vai trò" : "Chỉnh sửa vai trò"}
          </span>
        </div>
      }
      onCancel={handleCancel}
      footer={null}
      width={650}
      maskClosable={false}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: "24px" }}
        initialValues={{ status: true }}
      >
        <Row gutter={16}>
          <Form.Item
            name="roleId"
            hidden
          >
            <Input
              type="hidden"
            />
          </Form.Item>
          <Col span={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: 500 }}>
                  <UserOutlined
                    style={{ marginRight: "6px", color: "#667eea" }}
                  />
                  Tên vai trò
                </span>
              }
              name="roleName"
              rules={[
                { required: true, message: "Vui lòng nhập tên vai trò!" },
              ]}
            >
              <Input
                placeholder="Nhập tên vai trò"
                size="large"
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: 500 }}>
                  <CodeOutlined
                    style={{ marginRight: "6px", color: "#52c41a" }}
                  />
                  Mã vai trò
                </span>
              }
              name="roleCode"
              rules={[{ required: true, message: "Vui lòng nhập mã vai trò!" }]}
            >
              <Input
                placeholder="Nhập mã (VD: ADMIN)"
                size="large"
                prefix={<CodeOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={
            <span style={{ fontWeight: 500 }}>
              <FileTextOutlined
                style={{ marginRight: "6px", color: "#fa8c16" }}
              />
              Mô tả
            </span>
          }
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea
            placeholder="Nhập mô tả chi tiết về vai trò này..."
            rows={4}
            style={{ fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 500 }}>Trạng thái</span>}
          name="status"
          valuePropName="checked"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Switch
              checkedChildren={<CheckCircleOutlined />}
              unCheckedChildren={<CloseCircleOutlined />}
              style={{
                backgroundColor: statusValue ? "#52c41a" : "#fa8c16",
              }}
              checked={statusValue}
              onChange={(checked) => form.setFieldValue("status", checked)}
            />
            <span style={{ color: "#8c8c8c", fontSize: "13px" }}>
              {statusValue ? (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Hoạt động
                </Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color="error">
                  Không hoạt động
                </Tag>
              )}
            </span>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              paddingTop: "16px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              onClick={handleCancel}
              size="large"
              style={{ minWidth: "100px" }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleOk}
              size="large"
              style={{
                minWidth: "100px",
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#73d13d";
                e.currentTarget.style.borderColor = "#73d13d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#52c41a";
                e.currentTarget.style.borderColor = "#52c41a";
              }}
            >
              {mode === "add" ? "Thêm mới" : "Cập nhật"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
