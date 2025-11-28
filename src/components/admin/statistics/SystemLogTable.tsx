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
} from "antd";
import { EyeOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import "../../../style/admin/Statistics.model.css";

const { Text, Paragraph } = Typography;

export interface SystemLog {
  _id: string;
  method: string;
  url: string;
  statusCode: number;
  ipAddress: string;
  userId: string | null;
  body: any;
  headers: any;
  query: any;
  responseTime: number;
  createdAt: string;
  updatedAt: string;
}

interface SystemLogTableProps {
  data?: SystemLog[];
  totalRecords?: number;
  onSearch: (values: any) => void;
  filters?: any;
}

const SystemLogTable: React.FC<SystemLogTableProps> = ({
  data,
  totalRecords,
  onSearch,
  filters,
}) => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"body" | "headers" | "query">(
    "body"
  );
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: totalRecords,
    showSizeChanger: true,
    showTotal: (total) => `Tổng ${total} bản ghi`,
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: totalRecords,
    }));
  }, [totalRecords]);


  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      GET: "blue",
      POST: "green",
      PUT: "orange",
      DELETE: "red",
    };
    return colors[method] || "default";
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "success";
    if (status >= 400 && status < 500) return "warning";
    if (status >= 500) return "error";
    return "default";
  };

  const handleView = (
    record: SystemLog,
    type: "body" | "headers" | "query"
  ) => {
    setSelectedLog(record);
    setModalType(type);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<SystemLog> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 100,
      render: (_, record, index) => index + 1,
    },
    {
      title: "Phương thức",
      dataIndex: "method",
      key: "method",
      width: 100,
      render: (method: string) => (
        <Tag color={getMethodColor(method)}>{method}</Tag>
      ),
      filters: [
        { text: "GET", value: "GET" },
        { text: "POST", value: "POST" },
        { text: "PUT", value: "PUT" },
        { text: "DELETE", value: "DELETE" },
      ],
      onFilter: (value, record) => record.method === value,
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      width: 300,
      ellipsis: true,
      render: (url: string) => (
        <Tooltip title={url}>
          <Text code>{url}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusCode",
      key: "statusCode",
      width: 100,
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      sorter: (a, b) => a.statusCode - b.statusCode,
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 150,
      render: (ip: string) => <Text type="secondary">{ip}</Text>,
    },
    {
      title: "Thời gian phản hồi",
      dataIndex: "responseTime",
      key: "responseTime",
      width: 150,
      render: (time: number) => (
        <Space>
          <ClockCircleOutlined
            style={{ color: time > 200 ? "#ff4d4f" : "#52c41a" }}
          />
          <Text type={time > 200 ? "danger" : "success"}>{time}ms</Text>
        </Space>
      ),
      sorter: (a, b) => a.responseTime - b.responseTime,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => (
        <Text type="secondary">{new Date(date).toLocaleString("vi-VN")}</Text>
      ),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_: any, record: SystemLog) => (
        <Space size="small">
          {record.body && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record, "body")}
            >
              Body
            </Button>
          )}
          {record.headers && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record, "headers")}
            >
              Headers
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
        ...filters,
      };
      if (onSearch) onSearch(values);
    } catch (error) {
      console.log(error)
    }
  };

  const renderModalContent = () => {
    if (!selectedLog) return null;

    let data: any;
    let title: string;

    switch (modalType) {
      case "body":
        data = selectedLog.body;
        title = "Request Body";
        break;
      case "headers":
        data = selectedLog.headers;
        title = "Request Headers";
        break;
      case "query":
        data = selectedLog.query;
        title = "Query Parameters";
        break;
      default:
        data = {};
        title = "";
    }

    return (
      <div>
        <Paragraph>
          <Text strong>URL: </Text>
          <Text code>{selectedLog.url}</Text>
        </Paragraph>
        <Paragraph>
          <Text strong>Method: </Text>
          <Tag color={getMethodColor(selectedLog.method)}>
            {selectedLog.method}
          </Tag>
        </Paragraph>
        <Paragraph>
          <Text strong>Status Code: </Text>
          <Tag color={getStatusColor(selectedLog.statusCode)}>
            {selectedLog.statusCode}
          </Tag>
        </Paragraph>
        <Paragraph>
          <Text strong>{title}:</Text>
        </Paragraph>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "16px",
            borderRadius: "4px",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
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
                📋 System Logs
              </Text>
              <Tag color="blue">{pagination.total} records</Tag>
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
            scroll={{ x: 1400 }}
            size="middle"
          />
        </Card>

        <Modal
          title={
            <Space>
              <EyeOutlined />
              <Text strong>Chi tiết Log</Text>
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
          width={800}
        >
          {renderModalContent()}
        </Modal>
      </div>
    </>
  );
};

export default SystemLogTable;
