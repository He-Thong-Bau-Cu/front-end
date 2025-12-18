import React, { useEffect, useState } from "react";
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
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ElectionTypesService from "@/services/ElectionTypesService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import type { ElectionTypes } from "@/types/ElectionTypes.interface";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SettingsElectionTypesProps {
  activeGroup: string;
}

const SettingsElectionTypes: React.FC<SettingsElectionTypesProps> = ({
  activeGroup,
}) => {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  const [data, setData] = useState<ElectionTypes[]>([]);
  const [filters, setFilters] = useState({
    keyword: "",
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
  const [editingRecord, setEditingRecord] = useState<ElectionTypes | null>(null);
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();

  const fetchElectionTypes = async (payload?: Partial<typeof filters>) => {
    const body = { ...filters, ...payload };
    showLoading();
    try {
      const response = await ElectionTypesService.searchElectionType(body);
      // Service đã unwrap response.data, nên response có thể là array hoặc object có content
      if (Array.isArray(response)) {
        // Nếu response là array trực tiếp
        setData(response);
        setPagination({
          page: 1,
          limit: 10,
          totalItems: response.length,
          totalPages: Math.ceil(response.length / 10),
        });
        setFilters(body);
      } else if (response && response.content && Array.isArray(response.content)) {
        // Nếu response có cấu trúc pagination
        setData(response.content);
        setPagination({
          page: response.page || 1,
          limit: response.limit || 10,
          totalItems: response.totalItems || 0,
          totalPages: response.totalPages || 0,
        });
        setFilters(body);
      } else if (response && response.data) {
        // Nếu response có cấu trúc BaseResponse
        const data = response.data;
        if (Array.isArray(data)) {
          setData(data);
          setPagination({
            page: 1,
            limit: 10,
            totalItems: data.length,
            totalPages: Math.ceil(data.length / 10),
          });
        } else if (data.content) {
          setData(data.content);
          setPagination({
            page: data.page || 1,
            limit: data.limit || 10,
            totalItems: data.totalItems || 0,
            totalPages: data.totalPages || 0,
          });
        }
        setFilters(body);
      } else {
        notify("Không thể tải danh sách thể loại bầu cử", "error");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải danh sách thể loại bầu cử";
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (activeGroup === "ELECTION_TYPES") {
      fetchElectionTypes({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup]);

  const handleSearch = (values: any) => {
    fetchElectionTypes({ keyword: values.keyword || "", page: 1 });
  };

  const openModal = (record?: ElectionTypes) => {
    setEditingRecord(record || null);
    setIsModalOpen(true);
    modalForm.setFieldsValue({
      typeName: record?.typeName || "",
      typeCode: record?.typeCode || "",
      description: record?.description || "",
      status: record?.status || "ACTIVE",
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await modalForm.validateFields();
      setIsSubmitting(true);
      const payload = {
        typeName: values.typeName.trim(),
        typeCode: values.typeCode.trim().toUpperCase(),
        description: values.description?.trim() || "",
        status: values.status || "ACTIVE",
      };

      let response;
      if (editingRecord) {
        response = await ElectionTypesService.updateElectionTypeById(
          editingRecord._id,
          payload
        );
      } else {
        response = await ElectionTypesService.createElectionType(payload);
      }

      // Response đã được unwrap bởi interceptor, có thể là BaseResponse hoặc data trực tiếp
      const isSuccess =
        (response?.success === true) ||
        (response?.data?.success === true) ||
        (response && !response.success && !response.data); // Nếu không có success field, coi như thành công

      if (isSuccess) {
        notify(
          response?.message ||
            response?.data?.message ||
            editingRecord
              ? "Cập nhật thành công"
              : "Tạo mới thành công",
          "success"
        );
        setIsModalOpen(false);
        modalForm.resetFields();
        fetchElectionTypes();
      } else {
        notify(
          response?.message ||
            response?.data?.message ||
            "Thao tác thất bại",
          "error"
        );
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Thao tác thất bại";
      notify(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: ElectionTypes) => {
    Modal.confirm({
      title: "Xác nhận xóa thể loại bầu cử",
      content: `Bạn có chắc chắn muốn xóa "${record.typeName}"?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        showLoading();
        try {
          // Backend chưa có API delete, dùng update để set status = INACTIVE
          const response = await ElectionTypesService.updateElectionTypeById(
            record._id,
            { status: "INACTIVE" }
          );
          const isSuccess =
            (response?.success === true) ||
            (response?.data?.success === true) ||
            (response && !response.success && !response.data);

          if (isSuccess) {
            notify("Đã vô hiệu hóa thể loại bầu cử", "success");
            fetchElectionTypes();
          } else {
            notify(
              response?.message || response?.data?.message || "Xóa thất bại",
              "error"
            );
          }
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || error?.message || "Xóa thất bại";
          notify(errorMessage, "error");
        } finally {
          hideLoading();
        }
      },
    });
  };

  const columns: ColumnsType<ElectionTypes> = [
    {
      title: "Tên thể loại",
      dataIndex: "typeName",
      key: "typeName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Mã thể loại",
      dataIndex: "typeCode",
      key: "typeCode",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value) => (
        <Text type="secondary">{value || "—"}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) =>
        value ? (() => { const date = new Date(value); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })() : "—",
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

  if (activeGroup !== "ELECTION_TYPES") {
    return null;
  }

  return (
    <Card bordered={false} className="general-card settings-content-card">
      <div className="general-card-header">
        <span className="general-emoji" aria-hidden>
          🗳️
        </span>
        <div style={{ flex: 1 }}>
          <Title level={5} className="general-title">
            Quản lý thể loại bầu cử
          </Title>
          <Typography.Paragraph type="secondary">
            Quản lý các loại bầu cử trong hệ thống
          </Typography.Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Thêm thể loại
        </Button>
      </div>

      <Form
        layout="inline"
        form={searchForm}
        style={{ marginBottom: 16, rowGap: 16 }}
        onFinish={handleSearch}
      >
        <Form.Item name="keyword">
          <Input
            placeholder="Tìm kiếm theo tên, mã hoặc mô tả"
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
            fetchElectionTypes({ page, limit: pageSize }),
        }}
      />

      <Modal
        title={editingRecord ? "Cập nhật thể loại bầu cử" : "Thêm thể loại bầu cử mới"}
        open={isModalOpen}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        onCancel={() => {
          setIsModalOpen(false);
          modalForm.resetFields();
        }}
        destroyOnClose
        width={600}
      >
        <Form layout="vertical" form={modalForm}>
          <Form.Item
            label="Tên thể loại"
            name="typeName"
            rules={[
              { required: true, message: "Vui lòng nhập tên thể loại" },
            ]}
          >
            <Input placeholder="VD: Bầu tổng giám đốc" />
          </Form.Item>
          <Form.Item
            label="Mã thể loại"
            name="typeCode"
            rules={[
              { required: true, message: "Vui lòng nhập mã thể loại" },
              {
                pattern: /^[A-Z_]+$/,
                message: "Mã thể loại chỉ chứa chữ in hoa và dấu gạch dưới",
              },
            ]}
          >
            <Input
              placeholder="VD: PERSON"
              disabled={!!editingRecord}
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <TextArea
              rows={3}
              placeholder="Mô tả về thể loại bầu cử"
            />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Vô hiệu hóa</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SettingsElectionTypes;

