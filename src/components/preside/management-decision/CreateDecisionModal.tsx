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
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import "../../../style/preside/CreateDecisionModal.model.css";
import UserService from "@/services/UserService";
import dayjs from "dayjs";

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
          secretaryId: initialData.signerId || undefined,
          startTime: initialData.startTime ? dayjs(initialData.startTime) : null,
          endTime: initialData.endTime ? dayjs(initialData.endTime) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editMode, initialData, form]);

  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      startTime: values.startTime?.toISOString(),
      endTime: values.endTime?.toISOString(),
    };
    onSubmit(payload, editMode, initialData?._id);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={750}
      className="create-decision-modal"
      destroyOnClose
      centered
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
              : "Nhập đầy đủ thông tin cần thiết"}
          </p>
        </div>
      </div>

      <Divider style={{ margin: "16px 0" }} />

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
              label="Tên nghị quyết"
              rules={[{ required: true, message: "Vui lòng nhập tên nghị quyết" }]}
            >
              <Input placeholder="Nhập tên nghị quyết" />
            </Form.Item>
          </Col>

          {/* Người ký / thư ký */}
          <Col span={24}>
            <Form.Item
              name="secretaryId"
              label="Thư ký chủ tọa"
              rules={[{ required: true, message: "Vui lòng chọn thư ký" }]}
            >
              <Select placeholder="Chọn người ký / thư ký" allowClear>
                {userList.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Thời gian hiệu lực */}
          <Col span={24}>
            <Divider orientation="left">⏰ Thời gian diễn ra cuộc bầu cử</Divider>
          </Col>
          {/* Lấy ngày tối thiểu: hôm nay + 20 ngày */}
          {(() => {
            const todayPlus20 = dayjs().add(15, "day").startOf("day");

            return (
              <>
                {/* Thời gian bắt đầu */}
                <Col span={24}>
                  <Form.Item
                    name="startTime"
                    label="Thời gian bắt đầu"
                    rules={[{ required: true, message: "Vui lòng chọn thời gian bắt đầu" }]}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: "100%" }}
                      placeholder="Chọn thời gian bắt đầu"
                      disabledDate={(current) =>
                        current && current < todayPlus20
                      }
                    />
                  </Form.Item>
                </Col>

                {/* Thời gian kết thúc */}
                <Col span={24}>
                  <Form.Item
                    name="endTime"
                    label="Thời gian kết thúc"
                    dependencies={["startTime"]}
                    rules={[
                      { required: true, message: "Vui lòng chọn thời gian kết thúc" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const start = getFieldValue("startTime");
                          if (!value || !start) return Promise.resolve();
                          if (value.isBefore(start))
                            return Promise.reject("Thời gian kết thúc phải sau thời gian bắt đầu");
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: "100%" }}
                      placeholder="Chọn thời gian kết thúc"
                      disabledDate={(current) => {
                        const start = form.getFieldValue("startTime");
                        if (!start) {
                          // Nếu chưa chọn startTime thì vẫn khóa ngày quá khứ + 20 ngày
                          return current && current < todayPlus20;
                        }
                        // Nếu đã chọn startTime -> không cho chọn trước startTime
                        return current && current < start.startOf("day");
                      }}
                    />
                  </Form.Item>
                </Col>
              </>
            );
          })()}
        </Row>

        {/* FOOTER */}
        <div className="modal-footer">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {editMode ? "Cập nhật nghị quyết" : "Tạo nghị quyết"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDecisionModal;
