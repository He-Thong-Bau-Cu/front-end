import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Row,
  Table,
  Tag,
  Typography,
  Checkbox,
  List,
  Pagination,
  Tooltip,
  Modal,
} from "antd";
import { TableProps } from "antd/lib";
import "../../../style/admin/ManagementRole.model.css";
import type { RoleRecord } from "../../../types/Role.interface";
import { useEffect, useMemo, useState } from "react";
import RoleModal from "./RoleModal";
import SystemService from "@/services/SystemService";
import { STATUS_ROLE } from "@/enums/STATUS";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";

const { Text } = Typography;

interface ListRolesProps {
  dataRolePermission?: any;
  onSearch?: (values: any) => void;
  total?: number;
}

const ListRoles = ({ dataRolePermission, onSearch, total }: ListRolesProps) => {
  const [values, setValues] = useState({
    roleName: "",
    status: "",
    page: 1,
    limit: 10,
  });
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedRoleModal, setSelectedRoleModal] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<any>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [permissions, setPermissions] = useState<any>([]);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  useEffect(() => {
    fetchPermission();
  }, []);

  const fetchPermission = async () => {
    try {
      const response = await SystemService.getAllPermission();
      if (response.success) setPermissions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text: string, record, index) => index + 1,
    },
    {
      title: "Tên vai trò",
      dataIndex: "roleName",
      key: "roleName",
      render: (text: string, record) => (
        <div className="role-item">
          <div className="role-dot" />
          <div>
            <Text strong>{record.roleName}</Text>
            <div className="role-desc">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissionIds",
      key: "permissionIds",
      render: (permissionIds: string[]) => (
        <Tag className="role-tag">{permissionIds.length}</Tag>
      ),
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
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title="Phân quyền">
            <Button
              type="text"
              icon={<RocketOutlined />}
              className="role-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRoleEdit(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="role-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="role-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedRoleModal(null);
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (role: any) => {
    setModalMode("edit");
    setSelectedRoleModal(role);
    setIsModalVisible(true);
  };

  // Xử lý khi submit form
  const handleSubmit = async (values: any) => {
    try {
      showLoading();
      if (modalMode === "add") {
        const body = {
          ...values,
        };
        const response = await SystemService.addRole(body);
        if (response.success) {
          notify(response.message, "success");
          if (onSearch) onSearch({ page: 1, limit: 10 });
        }
      } else {
        const body = {
          ...values,
        };
        const response = await SystemService.updateRole(body);
        if (response.success) {
          notify(response.message, "success");
          if (onSearch) onSearch({ page: 1, limit: 10 });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsModalVisible(false);
      hideLoading();
    }
  };

  // Đóng modal
  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedRole(null);
  };

  const handleSelectRole = (record: any) => {
    setSelectedRole(record);
    setSelectedPermissions(record.permissionIds);
    setIsEditing(false);
  };

  const handleSelectRoleEdit = (record: any) => {
    setSelectedRole(record);
    setSelectedPermissions(record.permissionIds);
    setIsEditing(true);
  };

  const handleTogglePermission = (key: string, checked: boolean) => {
    setSelectedPermissions((prev: any) =>
      checked ? [...prev, key] : prev.filter((p: any) => p !== key)
    );
  };

  const getPermissionGroup = (name?: string) => {
    if (!name) return "Nhóm khác";
    const parts = name.split(/của/i);
    const base = parts[0].trim();
    return base.length ? base : "Nhóm khác";
  };

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, any[]>();
    (permissions || []).forEach((perm: any) => {
      const key = getPermissionGroup(perm.permissionName);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(perm);
    });
    return Array.from(map.entries())
      .map(([label, items]) => ({
        label,
        items: items.sort((a, b) =>
          (a.permissionName || "").localeCompare(b.permissionName || "")
        ),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions]);

  const handleUpdate = async () => {
    try {
      showLoading();
      const body = {
        ...selectedRole,
        permissionIds: selectedPermissions,
        rolePermissionId: selectedRole.id,
      };
      const response = await SystemService.updateRolePermission(body);
      if (response.success) {
        notify(response.message, "success");
        if (onSearch) onSearch({ page: 1, limit: 10 });
      }
    } catch (error) {
      console.log(error);
    } finally {
      hideLoading();
      setIsEditing(false);
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

  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: "Xác nhận xóa vai trò",
      content: (
        <>
          <p>Bạn có chắc chắn muốn xoá vai trò này không?</p>
          <strong>{record.roleName}</strong>
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
          const response = await SystemService.deleteRole(record.roleId);
          if (response.success) {
            notify(response.message, "success");
            if (onSearch) onSearch({ page: 1, limit: 10 });
          } else {
            notify(response.message, "error");
          }
        } catch (error) {
          console.log(error);
        } finally {
          hideLoading();
        }
      },
    });
  };

  return (
    <div className="role-section" style={{ height: "calc(100vh - 160px)" }}>
      <Row gutter={24} style={{ height: "100%" }}>
        {/* LEFT TABLE */}
        <Col
          xs={24}
          lg={14}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flex: 1,
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
                justifyContent: "space-between",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                👤 Vai trò
              </span>
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
                onClick={handleAddNew}
              >
                Thêm mới
              </Button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <Table
                rowKey="key"
                columns={columns}
                dataSource={dataRolePermission}
                pagination={false}
                className="role-table"
                onRow={(record) => ({
                  onClick: () => handleSelectRole(record),
                })}
              />
            </div>
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
          </div>
        </Col>

        <Col
          xs={24}
          lg={10}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flex: 1,
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
              📜 Quyền hạn
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "#fff",
                padding: "24px 28px",
                boxSizing: "border-box",
                minHeight: 0,
              }}
            >
              {selectedRole ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                      flex: 1,
                      overflowY: "auto",
                      maxHeight: "calc(100vh - 400px)",
                      minHeight: 0,
                      paddingRight: "8px",
                    }}
                  >
                    {groupedPermissions.map((group) => (
                      <div key={group.label}>
                        <Text strong style={{ display: "block", marginBottom: 6 }}>
                          {group.label}
                        </Text>
                        <List
                          dataSource={group.items}
                          renderItem={(perm: any) => (
                            <List.Item
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "4px 0",
                              }}
                            >
                              <Checkbox
                                checked={selectedPermissions.includes(perm._id)}
                                onChange={(e) =>
                                  handleTogglePermission(perm._id, e.target.checked)
                                }
                                disabled={!isEditing}
                              >
                                {perm.permissionName}
                              </Checkbox>
                            </List.Item>
                          )}
                        />
                      </div>
                    ))}
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
                  <span style={{ fontSize: "36px", marginBottom: "10px" }}>
                    👈
                  </span>
                  <Typography.Text
                    strong
                    style={{ fontSize: "15px", color: "#2d2d2d" }}
                  >
                    Chọn một vai trò để xem và chỉnh sửa quyền hạn
                  </Typography.Text>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <RoleModal
        visible={isModalVisible}
        mode={modalMode}
        initialValues={selectedRoleModal}
        onCancel={handleCancelModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ListRoles;
