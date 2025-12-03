import { Card, Col, Row, Typography, Button, Dropdown, Space } from "antd";
import {
  DatabaseOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CloudUploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "@/style/admin/ManagementData.model.css";
import type { DataManagementStats } from "@/types/DataManagement.interface";
import type { MenuProps } from "antd";
import { formatDate } from "@/utils/format";

const { Text } = Typography;

interface DataStatsProps {
  stats: DataManagementStats;
  onRefresh?: () => void;
  onBackup?: (format: "csv" | "json") => void;
  backupLoading?: boolean;
}

const DataStats = ({ stats, onRefresh, onBackup, backupLoading }: DataStatsProps) => {
  const cards = [
    {
      icon: <DatabaseOutlined style={{ fontSize: 48, color: "#059669" }} />,
      title: stats.totalRecords.toLocaleString(),
      desc: "Bản ghi sao lưu",
      hint: "Tổng số hành động đã lưu",
      color: "#059669",
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: 48, color: "#2563eb" }} />,
      title: stats.uniqueTables,
      desc: "Bảng đang quản lý",
      hint: "Nguồn dữ liệu được bảo vệ",
      color: "#2563eb",
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 48, color: "#f97316" }} />,
      title: stats.latestBackupAt
        ? formatDate(new Date(stats.latestBackupAt))
        : "--",
      desc: "Sao lưu gần nhất",
      hint: stats.latestActionBy || "Chưa xác định",
      color: "#f97316",
    },
    {
      icon: <CloudUploadOutlined style={{ fontSize: 48, color: "#7c3aed" }} />,
      title: stats.attachmentCount,
      desc: "Tệp đính kèm",
      hint: stats.topAction
        ? `${stats.topAction.action} (${stats.topAction.count})`
        : "Chưa có thống kê",
      color: "#7c3aed",
    },
  ];

  const backupMenu: MenuProps = {
    items: [
      { key: "csv", label: "Backup Excel (.csv)" },
      { key: "json", label: "Backup JSON (.json)" },
    ],
    onClick: ({ key }) => onBackup?.(key as "csv" | "json"),
  };

  return (
    <div style={{ paddingTop: 30 }}>
      <div className="data-stats-header">
        <div>
          <Text strong style={{ fontSize: 20 }}>
            Hiệu suất dữ liệu
          </Text>
          <div style={{ color: "#64748b" }}>
            Giám sát nhanh hoạt động sao lưu
          </div>
        </div>
        <Space size={12}>
          <Dropdown.Button
            menu={backupMenu}
            icon={<CloudUploadOutlined />}
            type="primary"
            loading={!!backupLoading}
            onClick={() => onBackup?.("csv")}
          >
            Backup nhanh
          </Dropdown.Button>
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
            Làm mới
          </Button>
        </Space>
      </div>
      <Row gutter={[16, 16]}>
        {cards.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              bordered={false}
              className="stat-card"
              style={{
                borderTop: `4px solid ${item.color}`,
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {item.icon}
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 28,
                      lineHeight: "32px",
                      color: "#0f172a",
                    }}
                  >
                    {item.title}
                  </Text>
                  <div style={{ color: "#1e293b", fontSize: 14 }}>
                    {item.desc}
                  </div>
                  <div style={{ color: item.color, fontSize: 13 }}>
                    {item.hint}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DataStats;
