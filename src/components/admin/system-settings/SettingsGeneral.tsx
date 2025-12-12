import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Table,
  Space,
  Tag,
  Modal,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  SystemConfig,
  SystemSettingsGroup,
} from "@/types/SystemConfig.interface";
import SystemConfigService from "@/services/SystemConfigService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDate } from "@/utils/format";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface GeneralSettingsProps {
  activeGroup: SystemSettingsGroup;
}

const groupOptions = [
  { label: "Tổng quan", value: "OVERVIEW" },
  { label: "Thông báo", value: "NOTIFY" },
  { label: "Bảo mật", value: "SECURITY" },
  { label: "Tích hợp", value: "INTEGRATION" },
  { label: "Nâng cao", value: "ADVANCED" },
];

export interface GeneralSettingsHandle {
  refresh: () => void;
  resetFilters: () => void;
}

const GeneralSettings = forwardRef<GeneralSettingsHandle, GeneralSettingsProps>(
  ({ activeGroup }, ref) => {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  const [data, setData] = useState<SystemConfig[]>([]);
  const [filters, setFilters] = useState({
    textSearch: "",
    groupType: activeGroup,
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SystemConfig | null>(null);
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();

  const fetchConfigs = async (payload?: Partial<typeof filters>) => {
    const body = { ...filters, ...payload, groupType: activeGroup };
    showLoading();
    try {
      const response = await SystemConfigService.search(body);
      if (response.success && response.data) {
        const res = response.data;
        setData(res.content);
        setPagination({
          page: res.page,
          limit: res.limit,
          totalItems: res.totalItems,
          totalPages: res.totalPages,
        });
        setFilters(body);
      } else {
        notify(response.message || "Không thể tải cấu hình", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể tải cấu hình hệ thống", "error");
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchConfigs({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup]);

  const handleSearch = (values: any) => {
    fetchConfigs({ textSearch: values.textSearch || "", page: 1 });
  };

  const openModal = (record?: SystemConfig) => {
    setEditingRecord(record || null);
    setIsModalOpen(true);
    modalForm.setFieldsValue({
      configKey: record?.configKey || "",
      groupType: record?.groupType || activeGroup,
      configValue:
        typeof record?.configValue === "object"
          ? JSON.stringify(record?.configValue, null, 2)
          : record?.configValue || "",
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await modalForm.validateFields();
      setIsSubmitting(true);
      const payload = {
        configKey: values.configKey.trim().toUpperCase(),
        groupType: values.groupType.trim().toUpperCase(),
        configValue: parseConfigValue(values.configValue),
      };
      const request = editingRecord
        ? SystemConfigService.update(editingRecord._id, payload)
        : SystemConfigService.create(payload);
      const response = await request;
      if (response.success) {
        notify(response.message || "Cập nhật thành công", "success");
        setIsModalOpen(false);
        fetchConfigs();
      } else {
        notify(response.message || "Thao tác thất bại", "error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: SystemConfig) => {
    Modal.confirm({
      title: "Xác nhận xóa cấu hình",
      content: `Bạn có chắc chắn muốn xóa ${record.configKey}?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        showLoading();
        try {
          const response = await SystemConfigService.remove(record._id);
          if (response.success) {
            notify("Đã xóa cấu hình", "success");
            fetchConfigs();
          } else {
            notify(response.message || "Xóa thất bại", "error");
          }
        } catch (error) {
          notify("Xóa thất bại", "error");
        } finally {
          hideLoading();
        }
      },
    });
  };

  const columns: ColumnsType<SystemConfig> = [
    {
      title: "Config key",
      dataIndex: "configKey",
      key: "configKey",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Nhóm",
      dataIndex: "groupType",
      key: "groupType",
      render: (groupType: string) => <Tag color="blue">{groupType}</Tag>,
    },
    {
      title: "Giá trị",
      dataIndex: "configValue",
      key: "configValue",
      ellipsis: true,
      render: (value) => (
        <Text type="secondary">
          {typeof value === "object"
            ? JSON.stringify(value)
            : value || "—"}
        </Text>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => formatDate(value),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => openModal(record)}
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

    useImperativeHandle(ref, () => ({
      refresh: () => fetchConfigs({ page: 1 }),
      resetFilters: () => {
        searchForm.resetFields();
        fetchConfigs({ textSearch: "", page: 1 });
      },
    }));

  return (
    <Card bordered={false} className="general-card settings-content-card">
      <div className="general-card-header">
        <span className="general-emoji" aria-hidden>
          ⚙️
        </span>
        <div style={{ flex: 1 }}>
        <Title level={5} className="general-title">
            Cấu hình hệ thống
        </Title>
          <Typography.Paragraph type="secondary">
            Quản lý key-value cho từng nhóm cấu hình
          </Typography.Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Thêm cấu hình
        </Button>
      </div>

      <Form
        layout="inline"
        form={searchForm}
        style={{ marginBottom: 16, rowGap: 16 }}
        onFinish={handleSearch}
      >
        <Form.Item name="textSearch">
          <Input
            placeholder="Tìm kiếm config"
            prefix={<SearchOutlined />}
            allowClear
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Tìm kiếm</Button>
        </Form.Item>
      </Form>

      <Table
        rowKey={(record) => record._id}
        columns={columns}
        dataSource={data}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.totalItems,
          showSizeChanger: true,
          onChange: (page, pageSize) =>
            fetchConfigs({ page, limit: pageSize }),
        }}
      />

      <Modal
        title={editingRecord ? "Cập nhật cấu hình" : "Thêm cấu hình mới"}
        open={isModalOpen}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={modalForm}>
          <Form.Item
            label="Config key"
            name="configKey"
            rules={[{ required: true, message: "Vui lòng nhập config key" }]}
          >
            <Input placeholder="VD: COMPANY_NAME" />
          </Form.Item>
          <Form.Item
            label="Nhóm"
            name="groupType"
            rules={[{ required: true, message: "Vui lòng chọn nhóm" }]}
          >
            <Select options={groupOptions} />
          </Form.Item>
          <Form.Item label="Giá trị" name="configValue">
            <TextArea rows={4} placeholder="Giá trị hoặc JSON" />
        </Form.Item>
      </Form>
      </Modal>
    </Card>
  );
  }
);

const parseConfigValue = (value: string) => {
  if (!value || !value.trim()) return null;
  const trimmed = value.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
};

export default GeneralSettings;
