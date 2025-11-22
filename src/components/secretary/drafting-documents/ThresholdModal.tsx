import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Space,
  message,
  InputNumber,
} from "antd";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import { Threshols } from "@/types/Threshols.interface";
import ThresholdsService from "@/services/ThresholdsService";

interface ThresholdModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (thresholdId: string, thresholdName: string) => void;
  selectedThresholdId?: string;
}

const ThresholdModal: React.FC<ThresholdModalProps> = ({
  open,
  onCancel,
  onSelect,
  selectedThresholdId,
}) => {
  const [thresholds, setThresholds] = useState<Threshols[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      fetchThresholds();
      setIsAdding(false);
      form.resetFields();
    }
  }, [open]);

  const fetchThresholds = async () => {
    setLoading(true);
    try {
      const data = await ThresholdsService.searchThreshold({});
      setThresholds(data || []);
    } catch (error) {
      console.error("Error fetching thresholds:", error);
      message.error("Không thể tải danh sách ngưỡng thông qua");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async (values: any) => {
    try {
      const payload = {
        thresholdName: values.thresholdName,
        thresholdCode: values.thresholdCode,
        thresholdType: values.thresholdType,
        value: values.value,
        description: values.description || "",
        status: "ACTIVE",
      };

      const response = await ThresholdsService.createThreshold(payload);
      if (response.success) {
        message.success("Thêm ngưỡng thông qua thành công!");
        form.resetFields();
        setIsAdding(false);
        fetchThresholds();
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Error creating threshold:", error);
      message.error(error.response?.data?.message || "Không thể thêm ngưỡng thông qua");
    }
  };

  const columns = [
    {
      title: "Tên ngưỡng",
      dataIndex: "thresholdName",
      key: "thresholdName",
    },
    {
      title: "Mã ngưỡng",
      dataIndex: "thresholdCode",
      key: "thresholdCode",
    },
    {
      title: "Loại ngưỡng",
      dataIndex: "thresholdType",
      key: "thresholdType",
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value: number) => `${value}%`,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Threshols) => (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => {
            onSelect(record._id, record.thresholdName);
            onCancel();
          }}
          disabled={selectedThresholdId === record._id}
        >
          {selectedThresholdId === record._id ? "Đã chọn" : "Chọn"}
        </Button>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={
        <span style={{ fontSize: "18px", fontWeight: 600 }}>
          Quản lý ngưỡng thông qua
        </span>
      }
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        {!isAdding ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAdding(true)}
          >
            Thêm ngưỡng mới
          </Button>
        ) : (
          <div
            style={{
              padding: 16,
              border: "1px solid #e8e8e8",
              borderRadius: 8,
              backgroundColor: "#fafafa",
              marginBottom: 16,
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddNew}
              style={{ marginTop: 8 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Form.Item
                  label="Tên ngưỡng"
                  name="thresholdName"
                  rules={[{ required: true, message: "Vui lòng nhập tên ngưỡng" }]}
                >
                  <Input placeholder="Nhập tên ngưỡng" />
                </Form.Item>

                <Form.Item
                  label="Mã ngưỡng"
                  name="thresholdCode"
                  rules={[{ required: true, message: "Vui lòng nhập mã ngưỡng" }]}
                >
                  <Input placeholder="Nhập mã ngưỡng" />
                </Form.Item>

                <Form.Item
                  label="Loại ngưỡng"
                  name="thresholdType"
                  rules={[{ required: true, message: "Vui lòng nhập loại ngưỡng" }]}
                >
                  <Input placeholder="Nhập loại ngưỡng" />
                </Form.Item>

                <Form.Item
                  label="Giá trị (%)"
                  name="value"
                  rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    placeholder="Nhập giá trị"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Mô tả"
                  name="description"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <Input.TextArea rows={2} placeholder="Nhập mô tả" />
                </Form.Item>
              </div>

              <Space>
                <Button type="primary" htmlType="submit">
                  Lưu
                </Button>
                <Button onClick={() => {
                  setIsAdding(false);
                  form.resetFields();
                }}>
                  Hủy
                </Button>
              </Space>
            </Form>
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={thresholds}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} ngưỡng`,
        }}
        rowClassName={(record) =>
          selectedThresholdId === record._id ? "selected-row" : ""
        }
      />

      <style>{`
        .selected-row {
          background-color: #f6ffed !important;
        }
        .selected-row:hover {
          background-color: #d9f7be !important;
        }
      `}</style>
    </Modal>
  );
};

export default ThresholdModal;

