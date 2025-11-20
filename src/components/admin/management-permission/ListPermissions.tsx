import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Switch,
  Table,
  Tag,
  Typography,
  Input,
  Pagination,
  Select,
  Modal,
} from "antd";
import { TableProps } from "antd/lib";
import "../../../style/admin/ManagementPermission.model.css";
import { useState } from "react";
import AddPermissionModal from "./AddPermissionModal";
import { STATUS_COLOR, STATUS_ELECTION, STATUS_ROLE } from "@/enums/STATUS";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import SystemService from "@/services/SystemService";

const { Text } = Typography;

const getPermissionGroup = (name?: string) => {
  if (!name) return "Khác";
  const [base] = name.split(/của/i);
  const normalized = base.trim();
  return normalized.length ? normalized : "Khác";
};

interface ListPermissionsProps {
  permissions?: any[];
  total?: number;
  onSearch?: (values: any) => void;
}

const ListPermissions = ({
  permissions,
  total,
  onSearch,
}: ListPermissionsProps) => {
  const [values, setValues] = useState({
    permissionName: "",
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleAddPermission = async (values: any) => {
    try {
      showLoading();
      const response = await SystemService.addPermission(values);
      if (response.success) {
        notify(response.message, "success");
        if (onSearch) onSearch({ page: 1, limit: 10 });
      }
    } catch (error) {
      console.log(error);
    } finally {
      hideLoading();
    }
    console.log("New permission:", values);
    setIsModalVisible(false);
  };

  const handleSelectPermission = (record: any) => {
    setSelectedPermission(record);
    setIsEditing(false);
  };

  const handleEdit = (record: any) => {
    setSelectedPermission(record);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    try {
      showLoading();
      if (!selectedPermission) return;
      let body = {
        ...selectedPermission,
        permissionId: selectedPermission._id,
      }
      const response = await SystemService.updatePermission(body);
      if (response.success) {
        notify(response.message, "success");
        if (onSearch) onSearch({ page: 1, limit: 10 });
      }
    } catch (error) {
    } finally {
      hideLoading();
      setIsEditing(false);
    }
  };

  const handleChangeField = (field: keyof any, value: any) => {
    if (selectedPermission) {
      setSelectedPermission({ ...selectedPermission, [field]: value });
    }
  };

  const handleTableChange = (newPagination: any) => {
    try {
      setValues(newPagination);
      let values = {
        page: newPagination.page,
        limit: newPagination.limit,
      };
      if (onSearch) onSearch(values);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    let body = {
      permissionName: searchValue,
      page: values.page,
      limit: values.limit,
    };
    if (onSearch) onSearch(body);
  };

  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: "Xác nhận xoá quyền",
      content: (
        <>
          <p>Bạn có chắc chắn muốn xoá quyền này không?</p>
          <strong>{record?.permissionName}</strong>
        </>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        style: { backgroundColor: "#ef4444", border: "none" },
      },
      onOk: async () => {
        try {
          showLoading();
          const response = await SystemService.deletePermission(
            record._id
          );
          if (response.success) {
            notify(response.message, "success");
            if (onSearch) onSearch({ page: 1, limit: 10 });
          }
        } catch (error) {
          console.log(error);
        } finally {
          hideLoading();
        }
      },
    });
  }

  const columns: TableProps<any>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: "5%",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissionName",
      key: "permissionName",
      width: "30%",
      render: (_: string, record) => (
        <div className="permission-item">
          <div>
            <Text strong style={{ fontSize: "14px" }}>
              {record.permissionName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Nhóm quyền",
      dataIndex: "permissionName",
      key: "group",
      width: "20%",
      render: (text: string) => (
        <Tag color="processing">{getPermissionGroup(text)}</Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "40%",
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
      title: "Hành động",
      key: "action",
      render: (record) => (
        <div className="permission-action">
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: "#52c41a" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: "#ff4d4f" }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "67.7% 31.8%",
        gap: "20px",
        width: "100%",
        alignItems: "stretch",
        marginTop: "12px",
        paddingRight: "8px",
        boxSizing: "border-box",
        height: "calc(100vh - 180px)",
      }}
    >
      {/* DANH SÁCH QUYỀN HẠN */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(180deg, #b7f59f 0%, #a7f08c 100%)",
            padding: "16px 20px",
            height: "54px",
            borderBottom: "1px solid rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 600,
            color: "#2f7a32",
            fontSize: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🔐 Danh sách quyền hạn
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Input
              placeholder="Tìm kiếm quyền hạn..."
              prefix={<SearchOutlined style={{ color: "#888" }} />}
              style={{
                width: "250px",
                borderRadius: "6px",
                height: "32px",
                background: "#fff",
                border: "1px solid #d9d9d9",
              }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                borderRadius: "6px",
                height: "32px",
                fontSize: "13px",
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
              }}
              onClick={showModal}
            >
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Bảng danh sách */}
        <Card
          style={{
            flex: 1,
            border: "none",
            borderRadius: "0 0 12px 12px",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Table có scroll riêng */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={permissions}
              pagination={false}
              size="small"
              onRow={(record) => ({
                onClick: () => handleSelectPermission(record),
              })}
              sticky
            />
          </div>

          {/* Phân trang GHIM DƯỚI CÙNG */}
          <div
            style={{
              padding: "10px 0 12px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Pagination
              current={values.page}
              total={total}
              pageSize={values.limit}
              showSizeChanger
              onChange={(page, pageSize) =>
                handleTableChange({ page, limit: pageSize || values.limit })
              }
            />
          </div>
        </Card>
      </div>

      {/* CHI TIẾT QUYỀN HẠN */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #b7f59f 0%, #a7f08c 100%)",
            padding: "16px 20px",
            height: "54px",
            borderBottom: "1px solid rgba(255,255,255,0.6)",
            fontWeight: 600,
            color: "#2f7a32",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          📄 Chi tiết quyền hạn
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            padding: "24px 28px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          {selectedPermission ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  flex: 1,
                }}
              >
                <div>
                  <Text strong>Tên quyền:</Text>
                  <Input
                    value={selectedPermission.permissionName}
                    onChange={(e) =>
                      handleChangeField("permissionName", e.target.value)
                    }
                    style={{ marginTop: 4, width: "100%" }}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Text strong>Mã quyền:</Text>
                  <Input
                    value={selectedPermission.permissionCode}
                    onChange={(e) =>
                      handleChangeField("permissionCode", e.target.value)
                    }
                    style={{ marginTop: 4, width: "100%" }}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Text strong>Mô tả:</Text>
                  <Input.TextArea
                    value={selectedPermission.description}
                    onChange={(e) =>
                      handleChangeField("description", e.target.value)
                    }
                    rows={3}
                    style={{ marginTop: 4, width: "100%" }}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Text strong>URL:</Text>
                  <Input
                    value={selectedPermission.url}
                    onChange={(e) => handleChangeField("url", e.target.value)}
                    style={{ marginTop: 4, width: "100%" }}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Text strong>Trạng thái:</Text>
                  <div style={{ marginTop: 6 }}>
                    <Select
                      value={selectedPermission.status}
                      style={{ width: "100%" }}
                      onChange={(value) => handleChangeField("status", value)}
                      disabled={!isEditing}
                    >
                      <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                      <Select.Option value="INACTIVE">
                        Không hoạt động
                      </Select.Option>
                    </Select>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: "16px",
                  flexShrink: 0,
                }}
              >
                <Button
                  type="primary"
                  size="middle"
                  onClick={handleUpdate}
                  block
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    height: "38px",
                    fontWeight: 500,
                  }}
                  disabled={!isEditing}
                >
                  Cập nhật
                </Button>
              </div>
            </>
          ) : (
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "60px 16px",
              }}
            >
              <span style={{ fontSize: "36px", marginBottom: "10px" }}>👈</span>
              <Typography.Text
                strong
                style={{ fontSize: "15px", color: "#2d2d2d" }}
              >
                Chọn một quyền hạn
              </Typography.Text>
              <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
                để xem chi tiết và chỉnh sửa
              </p>
            </div>
          )}
        </div>
      </div>

      <AddPermissionModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onAdd={handleAddPermission}
      />
    </div>
  );
};

export default ListPermissions;
