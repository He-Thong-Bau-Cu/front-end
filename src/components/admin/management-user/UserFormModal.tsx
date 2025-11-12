import React, { use, useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Row, Col } from "antd";
import { STATUS_ROLE, USER_ROLE } from "@/enums/STATUS";
import SystemService from "@/services/SystemService";

const { Option } = Select;

interface UserFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [roleData, setRoleData] = useState([]);

  const fetchRoleData = async () => {
    try {
      let body = {};
      const response = await SystemService.getRole(body);
      if (response.success) {
        if (response.data.content.length > 0) {
          let data = response.data.content.filter((item: any) => {
            return (
              item.roleCode === USER_ROLE.ADMIN ||
              item.roleCode === USER_ROLE.USER ||
              item.roleCode === USER_ROLE.PRESIDE
            );
          });
          setRoleData(data);
        } else {
          setRoleData([]);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchRoleData();
    if (initialValues) {
      console.log('run1')
      initialValues.userId = initialValues._id;
      initialValues.role = initialValues.roleId._id;
      form.setFieldsValue(initialValues);
    } else {
      console.log('run2')
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={
        <span style={{ fontSize: "18px", fontWeight: 600 }}>
          {initialValues ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        </span>
      }
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={700}
      styles={{
        body: { paddingTop: "24px" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Form.Item label="Họ và tên" name="userId" hidden>
            <Input placeholder="Nhập họ và tên" size="large" hidden />
          </Form.Item>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input placeholder="Nhập họ và tên" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select placeholder="Chọn vai trò" size="large">
                {roleData.map((item: any) => (
                  <Option key={item._id} value={item._id}>
                    {item.roleName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số căn cước công dân"
              name="citizenId"
              rules={[
                {
                  required: true,
                  message:
                    "Vui lòng nhập số căn cước công nhân hoặc chứng minh nhân dân!",
                },
              ]}
            >
              <Input placeholder="Nhập số cmnd hoặc cccd" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Chức vụ" name="position">
              <Input placeholder="Nhập chức vụ (nếu có)" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phòng ban" name="department">
              <Select placeholder="Chọn phòng ban" size="large">
                <Option value="Phòng phần mềm">Phòng phần mềm</Option>
                <Option value="Phòng nhân sự">Phòng nhân sự</Option>
                <Option value="Phòng kinh doanh">Phòng kinh doanh</Option>
                <Option value="Phòng Marketing">Phòng Marketing</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select size="large">
                <Option value={STATUS_ROLE.ACTIVE}>Hoạt động</Option>
                <Option value={STATUS_ROLE.INACTIVE}>Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          style={{ textAlign: "right", marginTop: 24, marginBottom: 0 }}
        >
          <Button onClick={onCancel} size="large" style={{ marginRight: 12 }}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{
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
            {initialValues ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
