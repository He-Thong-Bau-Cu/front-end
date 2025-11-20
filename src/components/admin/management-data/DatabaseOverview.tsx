import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Table,
  Tag,
  Space,
  DatePicker,
  Modal,
  Descriptions,
} from "antd";
import { EyeOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import "@/style/admin/ManagementData.model.css";
import type {
  BackupRecord,
  BackupSearchPayload,
} from "@/types/DataManagement.interface";
import { formatDate } from "@/utils/format";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface DatabaseOverviewProps {
  data: BackupRecord[];
  filters: BackupSearchPayload;
  pagination: { page: number; limit: number; totalItems: number; totalPages: number };
  loading?: boolean;
  onSearch: (payload: Partial<BackupSearchPayload>) => void;
  onPageChange: (page: number, limit: number) => void;
  onDownloadFile: (key?: string | null) => void;
}

const DatabaseOverview = ({
  data,
  filters,
  pagination,
  loading,
  onSearch,
  onPageChange,
  onDownloadFile,
}: DatabaseOverviewProps) => {
  const [filterForm] = Form.useForm();
  const [detailRecord, setDetailRecord] = useState<BackupRecord | null>(null);

  const columns = useMemo(
    () => [
      {
        title: "Bảng",
        dataIndex: "tableName",
        key: "tableName",
        render: (text: string, record: BackupRecord) => (
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary">{record.recordId ? `Record #${record.recordId}` : "Không có recordId"}</Text>
          </Space>
        ),
      },
      {
        title: "Hành động",
        dataIndex: "action",
        key: "action",
        render: (action: string) => (
          <Tag color="blue">
            {action}
          </Tag>
        ),
      },
      {
        title: "Thực hiện bởi",
        dataIndex: "actionBy",
        key: "actionBy",
        render: (value: BackupRecord["actionBy"]) => {
          if (!value) return "—";
          if (typeof value === "string") return value;
          return value.fullName || value.email || "—";
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        ellipsis: true,
        render: (note: string | undefined) => note || "—",
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (value: string) => formatDate(new Date(value)),
      },
      {
        title: "Tệp",
        key: "file",
        render: (_: any, record: BackupRecord) => (
          <Button
            icon={<DownloadOutlined />}
            type="link"
            disabled={!record.filePath}
            onClick={() => onDownloadFile(record.filePath)}
          >
            Tải
          </Button>
        ),
      },
      {
        title: "Chi tiết",
        key: "detail",
        render: (_: any, record: BackupRecord) => (
          <Button icon={<EyeOutlined />} onClick={() => setDetailRecord(record)}>
            Xem
          </Button>
        ),
      },
    ],
    [onDownloadFile]
  );

  const handleFilter = (values: any) => {
    const payload: Partial<BackupSearchPayload> = {
      tableName: values.tableName,
      action: values.action,
      recordId: values.recordId,
    };
    if (values.range?.length === 2) {
      payload.fromDate = values.range[0].startOf("day").toISOString();
      payload.toDate = values.range[1].endOf("day").toISOString();
    }
    onSearch(payload);
  };

  return (
    <>
      <Card
        className="database-card"
        bodyStyle={{ padding: "16px 24px 20px 24px" }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="folder">
              📁
            </span>
            <strong style={{ fontSize: 22.5 }}>Tổng quan sao lưu</strong>
          </div>
        }
      >
        <Form
          layout="inline"
          form={filterForm}
          initialValues={{
            tableName: filters.tableName,
            action: filters.action,
            recordId: filters.recordId,
          }}
          onFinish={handleFilter}
          style={{ marginBottom: 16, rowGap: 16 }}
        >
          <Form.Item name="tableName">
            <Input placeholder="Tên bảng" prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item name="action">
            <Input placeholder="Hành động (IMPORT...)" />
          </Form.Item>
          <Form.Item name="recordId">
            <Input placeholder="Record ID" />
          </Form.Item>
          <Form.Item name="range">
            <RangePicker format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc dữ liệu
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey={(record) => record._id}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.totalItems,
            showSizeChanger: true,
            onChange: onPageChange,
          }}
        />
      </Card>

      <Modal
        open={!!detailRecord}
        title="Chi tiết bản ghi"
        onCancel={() => setDetailRecord(null)}
        footer={null}
        width={600}
      >
        {detailRecord && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Bảng">
              {detailRecord.tableName}
            </Descriptions.Item>
            <Descriptions.Item label="Hành động">
              {detailRecord.action}
            </Descriptions.Item>
            <Descriptions.Item label="Record ID">
              {detailRecord.recordId || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              {detailRecord.actionBy && typeof detailRecord.actionBy === "object"
                ? detailRecord.actionBy.fullName || detailRecord.actionBy.email
                : detailRecord.actionBy || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {detailRecord.note || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Data before">
              <pre
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  padding: 12,
                  borderRadius: 8,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(detailRecord.dataBefore || {}, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="Data after">
              <pre
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  padding: 12,
                  borderRadius: 8,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(detailRecord.dataAfter || {}, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default DatabaseOverview;
