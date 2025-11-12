import { Modal, Form, Input, Switch, Button, Row, Col, Tag } from "antd";
import { FC, useEffect } from "react";
import { LockOutlined, CodeOutlined, LinkOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface AddPermissionModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (values: any) => void;
}

const AddPermissionModal: FC<AddPermissionModalProps> = ({ visible, onCancel, onAdd }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ status : true });
  }, []);

  const handleOk = () => {
    form.validateFields().then((values) => {
      let body = {
        ...values,
        status: values.status ? "ACTIVE" : "INACTIVE",
      }
      onAdd(body);
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
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <LockOutlined style={{ fontSize: "20px", color: "#fff" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Thêm mới quyền hạn
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
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: 500 }}>
                  <LockOutlined style={{ marginRight: "6px", color: "#667eea" }} />
                  Tên quyền
                </span>
              }
              name="permissionName"
              rules={[{ required: true, message: "Vui lòng nhập tên quyền!" }]}
            >
              <Input
                placeholder="Nhập tên quyền"
                size="large"
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: 500 }}>
                  <CodeOutlined style={{ marginRight: "6px", color: "#52c41a" }} />
                  Code
                </span>
              }
              name="permissionCode"
              rules={[{ required: true, message: "Vui lòng nhập code!" }]}
            >
              <Input
                placeholder="Nhập code (VD: user.create)"
                size="large"
                prefix={<CodeOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={
            <span style={{ fontWeight: 500 }}>
              <LinkOutlined style={{ marginRight: "6px", color: "#1890ff" }} />
              URL
            </span>
          }
          name="url"
          rules={[{ required: true, message: "Vui lòng nhập URL!" }]}
        >
          <Input
            placeholder="Nhập URL (VD: /api/users)"
            size="large"
            prefix={<LinkOutlined style={{ color: "#bfbfbf" }} />}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: 500 }}>
              <FileTextOutlined style={{ marginRight: "6px", color: "#fa8c16" }} />
              Mô tả
            </span>
          }
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea
            placeholder="Nhập mô tả chi tiết về quyền hạn này..."
            rows={4}
            style={{ fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 500 }}>Trạng thái</span>}
          name="status"
          valuePropName="checked"
          initialValue={true}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Switch
              checkedChildren={<CheckCircleOutlined />}
              unCheckedChildren={<CloseCircleOutlined />}
              style={{
                backgroundColor: form.getFieldValue("status") !== false ? "#52c41a" : undefined
              }}
              checked={statusValue}
              onChange={(checked) => form.setFieldValue("status", checked)}
            />
            <span style={{ color: "#8c8c8c", fontSize: "13px" }}>
              {form.getFieldValue("status") !== false ? (
                <Tag icon={<CheckCircleOutlined />} color="success">Hoạt động</Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color="error">Không hoạt động</Tag>
              )}
            </span>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            paddingTop: "16px",
            borderTop: "1px solid #f0f0f0"
          }}>
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
                borderColor: "#52c41a"
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
              Thêm mới
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPermissionModal;
