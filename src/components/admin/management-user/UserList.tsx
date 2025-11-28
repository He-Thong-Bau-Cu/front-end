import {
  Button,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Pagination,
  Tooltip,
  Modal,
  Upload,
  Form,
} from "antd";
import {
  PlusOutlined,
  FileExcelOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import type { UserRecord } from "@/types/User.interface";
import { TableProps } from "antd/lib";
import { COLOR_ROLE, STATUS_ROLE } from "@/enums/STATUS";
import { formatDate, highlightKeyword } from "@/utils/format";
import UserFormModal from "./UserFormModal";
import UserDetailModal from "./UserDetailModal";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import UserService from "@/services/UserService";
import { downloadBlob } from "@/utils/file";

const { Option } = Select;

interface UserListProps {
  users?: any[];
  total?: number;
  onSearch?: (values: any) => void;
}

const UserList = ({
  users = [],
  total = 0,
  onSearch = (values) => {},
}: UserListProps) => {
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importForm] = Form.useForm();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    status: "",
    page: 1,
    limit: 10,
  });

  // Khi input thay đổi
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, fullName: e.target.value, page: 1 }));
  };

  const handleSelectChange = (value: string) => {
    console.log(`selected ${value}`);
    setValues((prev) => ({ ...prev, status: value }));
    handleSearch({ ...values, status: value });
  };

  const handleSearch = (searchValues?: typeof values) => {
    console.log("Search:", values);
    const v = searchValues || values;
    if (onSearch) {
      onSearch(v);
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      notify("Vui lòng chọn file Excel hợp lệ", "warning");
      return;
    }
    setImporting(true);
    showLoading();
    try {
      const response = await UserService.importFromExcel(importFile);
      if (response.success) {
        notify(response.message || "Import thành công", "success");
        setIsImportModalOpen(false);
        setImportFile(null);
        importForm.resetFields();
        handleSearch();
      } else {
        notify(response.message || "Import thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Import thất bại", "error");
    } finally {
      setImporting(false);
      hideLoading();
    }
  };

  const handleExportUsers = async () => {
    setExporting(true);
    showLoading();
    try {
      const blob = await UserService.exportToExcel();
      downloadBlob(blob, `users-${Date.now()}.xlsx`);
      notify("Xuất file thành công", "success");
    } catch (error) {
      console.error(error);
      notify("Xuất file thất bại", "error");
    } finally {
      setExporting(false);
      hideLoading();
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setOpenModal(true);
  };

  const handleEdit = (record: any) => {
    setSelectedUser(record);
    setOpenModal(true);
  };

  const handleView = (record: any) => {
    setSelectedUser(record);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      showLoading();
      if (selectedUser) {
        console.log("Cập nhật người dùng:", values);
        let body = {
          ...values,
          roleId: values.role,
        };
        const response = await UserService.update(values.userId, body);
        if (response.success) {
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
      } else {
        let body = {
          ...values,
          roleId: values.role,
        };
        const response = await UserService.create(body);
        if (response.success) {
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
      }
    } catch (error) {
      notify("Đã có lỗi xảy ra. Vui lòng thử lagi.", "error");
    } finally {
      handleSearch();
      setOpenModal(false);
      hideLoading();
    }
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: "Xác nhận xóa người dùng",
      content: (
        <>
          <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
          <strong>{record.fullName} - {record.email}</strong>
        </>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        style: { backgroundColor: "#ef4444", border: "none" },
      },
      onOk: async () => {
        try {
          showLoading();
          const response = await UserService.delete(record._id);
          if (response.success) {
            notify(response.message, "success");
            handleSearch();
          } else {
            notify(response.message, "error");
          }
        } catch (error) {
          notify("Xóa thất bại. Vui lòng thử lại!", "error");
        } finally {
          hideLoading();
        }
      },
    });
  };

  const handleCancel = () => setOpenModal(false);

  const columns: TableProps<any>["columns"] = [
    {
      title: "Người dùng",
      dataIndex: "fullName",
      key: "fullName",

      render: (_, record) => (
        <Space>
          <div
            style={{
              backgroundColor: "#2F80ED",
              color: "#fff",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {record.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {highlightKeyword(record.fullName, values.fullName)}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roleId",
      key: "roleId",
      render: (text) => {
        let roleKey = text.roleCode as keyof typeof COLOR_ROLE;
        return (
          <Tag
            color={COLOR_ROLE[roleKey]}
            style={{
              borderRadius: 16,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {text.roleName}
          </Tag>
        );
      },
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === STATUS_ROLE.ACTIVE
            ? "green"
            : status === STATUS_ROLE.INACTIVE
              ? "gold"
              : "red";
        return (
          <Tag
            color={color}
            style={{
              borderRadius: 16,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span style={{ color: "#333" }}>{formatDate(text)}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (record) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              type="default"
              shape="circle"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
              style={{
                backgroundColor: "#0ea5e9",
                color: "#fff",
                border: "none",
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              shape="circle"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              style={{
                backgroundColor: "#f59e0b", // cam
                color: "#fff",
                border: "none",
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <Button
              type="default"
              shape="circle"
              icon={<DeleteOutlined />}
              size="small"
              style={{
                backgroundColor: "#ef4444",
                color: "#fff",
                border: "none",
              }}
              onClick={() => handleDelete(record)} // thêm dòng này
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px 32px",
        minHeight: "75vh",
        margin: "15px 32px",
        borderRadius: "16px",
        backgroundColor: "#FFF",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: 20,
            display: "flex",
            alignItems: "center",
          }}
        >
          📋 Danh sách người dùng
        </h2>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: "linear-gradient(90deg, #34d399, #059669)",
              border: "none",
              height: 45,
              padding: "0 20px",
              fontWeight: 500,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            onClick={handleAdd}
          >
            Thêm người dùng
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            style={{
              height: 45,
              background: "linear-gradient(90deg, #ff5a3c, #CA3E30)",
              color: "#fff",
              border: "none",
            }}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import Excel
          </Button>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            loading={exporting}
            style={{ color: "#16a34a", borderColor: "#16a34a", height: 45 }}
            onClick={handleExportUsers}
          >
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* Search & Filter */}
      <Space style={{ marginBottom: 40 }}>
        <Input
          placeholder="Tìm kiếm theo tên người dùng"
          prefix={<SearchOutlined />}
          style={{ width: 730, height: 45 }}
          value={values.fullName}
          onChange={handleInputChange}
          onPressEnter={() => handleSearch()}
        />
        <Select
          defaultValue="Tất cả trạng thái"
          style={{ width: 170, height: 45, paddingLeft: 10 }}
          value={values.status}
          onChange={(value) => handleSelectChange(value)}
        >
          <Option value="">Tất cả trạng thái</Option>
          <Option value="ACTIVE">Hoạt động</Option>
          <Option value="INACTIVE">Không hoạt động</Option>
        </Select>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={users}
        pagination={false}
        style={{
          backgroundColor: "#",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      />

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Pagination
          current={values.page}
          total={total}
          pageSize={values.limit}
          showSizeChanger
          onShowSizeChange={(current, size) => {
            const newValues = { ...values, page: 1, limit: size };
            setValues(newValues);
            handleSearch(newValues);
          }}
          onChange={(p) => {
            const newValues = { ...values, page: p };
            setValues(newValues);
            handleSearch(newValues);
          }}
        />
      </div>

      <UserFormModal
        open={openModal}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        initialValues={selectedUser}
      />
      <UserDetailModal
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        userData={selectedUser}
      />
      <Modal
        title="Import người dùng từ Excel"
        open={isImportModalOpen}
        onCancel={() => {
          setIsImportModalOpen(false);
          setImportFile(null);
          importForm.resetFields();
        }}
        onOk={handleImportUsers}
        okText="Import"
        confirmLoading={importing}
      >
        <Form layout="vertical" form={importForm}>
          <Form.Item label="Chọn file Excel">
            <Upload.Dragger
              beforeUpload={(file) => {
                setImportFile(file);
                return false;
              }}
              maxCount={1}
              onRemove={() => setImportFile(null)}
            >
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined />
              </p>
              <p className="ant-upload-text">
                Kéo thả hoặc nhấp để chọn file (.xlsx, .xls)
              </p>
              {importFile && (
                <p className="ant-upload-hint">{importFile.name}</p>
              )}
            </Upload.Dragger>
          </Form.Item>
          <p style={{ color: "#475569" }}>
            File cần đúng mẫu hệ thống để tránh lỗi định dạng.
          </p>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
