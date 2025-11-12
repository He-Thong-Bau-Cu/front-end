import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Typography,
  Space,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import moment from "moment-timezone";
import "../../../style/admin/Statistics.model.css";

const { Text, Paragraph, Title } = Typography;

interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
  position: string;
}

export interface AuditLog {
  _id: string;
  reference_id: string | null;
  userId: UserInfo;
  action: string;
  module: string;
  old_value: any;
  new_value: any;
  ip_address: string;
  user_agent: string;
  createdAt: string;
  updatedAt: string;
}

const getTimeAgo = (date: string) => {
  return moment(date).tz("Asia/Ho_Chi_Minh").fromNow();
};

interface AuditLogTableProps {
  data?: AuditLog[];
  total?: number;
  onSearch: (values: any) => void;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({data, total, onSearch}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"old" | "new" | "compare">(
    "compare"
  );
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: total,
    showSizeChanger: true,
    showTotal: (total) => `Tổng ${total} bản ghi`,
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  useEffect(() => {
    if (data) {
      setPagination({
        ...pagination,
        total: total,
      });
    }
  }, [total]);

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      POST: "green",
      PUT: "orange",
      DELETE: "red",
      GET: "blue",
    };
    return colors[action] || "default";
  };

  const getModuleColor = (module: string) => {
    const colors: { [key: string]: string } = {
      ELECTION: "purple",
      USER: "cyan",
      VOTE: "geekblue",
      SYSTEM: "magenta",
      UNKNOWN: "default",
    };
    return colors[module] || "default";
  };

  const handleView = (record: AuditLog, type: "old" | "new" | "compare") => {
    setSelectedLog(record);
    setModalType(type);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 30,
      align: "center",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Người dùng",
      key: "user",
      width: 80,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <Text strong>{record.userId.fullName}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.userId.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 50,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      )
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      width: 60,
      render: (module: string) => (
        <Tag color={getModuleColor(module)}>{module}</Tag>
      )
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 80,
      render: (ip: string) => <Text code>{ip}</Text>,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 80,
      render: (date: string) => (
        <Tooltip
          title={moment(date)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss")}
        >
          <Space>
            <ClockCircleOutlined style={{ color: "#52c41a" }} />
            <Text type="secondary">{getTimeAgo(date)}</Text>
          </Space>
        </Tooltip>
      )
    },
    {
      title: "Thay đổi",
      key: "hasChanges",
      width: 50,
      align: "center",
      render: (_, record) => (
        <Space>
          {record.old_value && <Tag color="orange">Old</Tag>}
          {record.new_value && <Tag color="green">New</Tag>}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {record.old_value && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record, "old")}
            >
              Old Data
            </Button>
          )}
          {record.new_value && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record, "new")}
            >
              New Data
            </Button>
          )}
          {record.old_value && record.new_value && (
            <Button
              type="primary"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => handleView(record, "compare")}
            >
              Compare
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    try {
      setPagination(newPagination);
      let values = {
        page: newPagination.current,
        limit: newPagination.pageSize,
      };
      if (onSearch) onSearch(values);
    } catch (error) {
      console.log(error);
    }
  };

  const renderCompareView = () => {
    if (!selectedLog) return null;

    return (
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={
              <Space>
                <Tag color="orange">OLD DATA</Tag>
              </Space>
            }
            size="small"
            style={{ backgroundColor: "#fff7e6" }}
          >
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "4px",
                maxHeight: "400px",
                overflow: "auto",
                fontSize: "13px",
              }}
            >
              {selectedLog.old_value
                ? JSON.stringify(selectedLog.old_value, null, 2)
                : "Không có dữ liệu cũ"}
            </pre>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <Space>
                <Tag color="green">NEW DATA</Tag>
              </Space>
            }
            size="small"
            style={{ backgroundColor: "#f6ffed" }}
          >
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "4px",
                maxHeight: "400px",
                overflow: "auto",
                fontSize: "13px",
              }}
            >
              {selectedLog.new_value
                ? JSON.stringify(selectedLog.new_value, null, 2)
                : "Không có dữ liệu mới"}
            </pre>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderModalContent = () => {
    if (!selectedLog) return null;

    if (modalType === "compare") {
      return (
        <>
          <Card size="small" style={{ marginBottom: "16px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <UserOutlined />
                <Text strong>User:</Text>
                <Text>{selectedLog.userId.fullName}</Text>
                <Text type="secondary">({selectedLog.userId.email})</Text>
              </Space>
              <Space>
                <Text strong>Action:</Text>
                <Tag color={getActionColor(selectedLog.action)}>
                  {selectedLog.action}
                </Tag>
                <Text strong>Module:</Text>
                <Tag color={getModuleColor(selectedLog.module)}>
                  {selectedLog.module}
                </Tag>
              </Space>
              <Space>
                <ClockCircleOutlined />
                <Text strong>Time:</Text>
                <Text>
                  {moment(selectedLog.createdAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm:ss")}
                </Text>
                <Text type="secondary">
                  ({getTimeAgo(selectedLog.createdAt)})
                </Text>
              </Space>
            </Space>
          </Card>
          {renderCompareView()}
        </>
      );
    }

    const data =
      modalType === "old" ? selectedLog.old_value : selectedLog.new_value;
    const title = modalType === "old" ? "OLD DATA" : "NEW DATA";
    const bgColor = modalType === "old" ? "#fff7e6" : "#f6ffed";

    return (
      <div>
        <Paragraph>
          <Space>
            <UserOutlined />
            <Text strong>User:</Text>
            <Text>{selectedLog.userId.fullName}</Text>
          </Space>
        </Paragraph>
        <Paragraph>
          <Space>
            <Text strong>Action:</Text>
            <Tag color={getActionColor(selectedLog.action)}>
              {selectedLog.action}
            </Tag>
            <Text strong>Module:</Text>
            <Tag color={getModuleColor(selectedLog.module)}>
              {selectedLog.module}
            </Tag>
          </Space>
        </Paragraph>
        <Paragraph>
          <Space>
            <ClockCircleOutlined />
            <Text strong>Time:</Text>
            <Text>{getTimeAgo(selectedLog.createdAt)}</Text>
          </Space>
        </Paragraph>
        <Paragraph>
          <Text strong>{title}:</Text>
        </Paragraph>
        <pre
          style={{
            backgroundColor: bgColor,
            padding: "16px",
            borderRadius: "4px",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          {data
            ? JSON.stringify(data, null, 2)
            : `Không có dữ liệu ${modalType === "old" ? "cũ" : "mới"}`}
        </pre>
      </div>
    );
  };

  return (
    <>
      <div className="realtime-card">
        <Card
          title={
            <Space>
              <Text strong style={{ fontSize: "16px", marginLeft: "12px" }}>
                🔍 Audit Logs
              </Text>
              <Tag color="purple">{pagination.total} records</Tag>
            </Space>
          }
          style={{ marginTop: "24px" }}
        >
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1600 }}
            size="middle"
          />
        </Card>

        <Modal
          title={
            <Space>
              {modalType === "compare" ? <SwapOutlined /> : <EyeOutlined />}
              <Text strong>
                {modalType === "compare"
                  ? "So sánh dữ liệu"
                  : `Chi tiết ${modalType === "old" ? "Old Data" : "New Data"}`}
              </Text>
            </Space>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setIsModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={modalType === "compare" ? 1200 : 800}
        >
          {renderModalContent()}
        </Modal>
      </div>
    </>
  );
};

export default AuditLogTable;
