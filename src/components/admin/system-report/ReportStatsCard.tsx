import React, { useMemo } from "react";
import { Row, Col, Typography, Skeleton, Empty } from "antd";
import {
  BarChartOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloudUploadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "@/style/admin/SystemReport.model.css";
import type {
  SystemReportBackupSummary,
  SystemReportSummary,
} from "@/types/SystemReport.interface";
import { formatDate } from "@/utils/format";

const { Title, Text } = Typography;

interface ReportStatsCardProps {
  summary?: SystemReportSummary;
  backupSummary?: SystemReportBackupSummary;
  loading?: boolean;
}

const ReportStatsCard: React.FC<ReportStatsCardProps> = ({
  summary,
  backupSummary,
  loading,
}) => {
  const stats = useMemo(
    () => [
      {
        title: "TỔNG REQUEST",
        value: summary?.totalRequests?.toLocaleString() ?? "--",
        hint: "Số lượng request ghi nhận",
        icon: <BarChartOutlined />,
        iconColor: "#2563eb",
        iconBg: "#dbeafe",
      },
      {
        title: "THÀNH CÔNG",
        value: summary?.successCount?.toLocaleString() ?? "--",
        hint: `Tỷ lệ thành công ${summary?.successRate ?? 0}%`,
        icon: <CheckCircleFilled />,
        iconColor: "#16a34a",
        iconBg: "#dcfce7",
      },
      {
        title: "LỖI HỆ THỐNG",
        value: summary?.errorCount?.toLocaleString() ?? "--",
        hint: `Tỷ lệ lỗi ${summary?.errorRate ?? 0}%`,
        icon: <WarningFilled />,
        iconColor: "#dc2626",
        iconBg: "#fee2e2",
      },
      {
        title: "PHẢN HỒI TRUNG BÌNH",
        value: summary?.avgResponseTime
          ? `${summary.avgResponseTime}ms`
          : "--",
        hint: "Thời gian xử lý trung bình",
        icon: <ThunderboltOutlined />,
        iconColor: "#f97316",
        iconBg: "#ffedd5",
      },
      {
        title: "BẢN SAO LƯU",
        value: backupSummary?.totalBackups?.toLocaleString() ?? "0",
        hint: `${Object.keys(backupSummary?.actions || {}).length} hành động`,
        icon: <CloudUploadOutlined />,
        iconColor: "#0ea5e9",
        iconBg: "#e0f2fe",
      },
      {
        title: "SAO LƯU GẦN NHẤT",
        value: backupSummary?.lastBackupAt
          ? formatDate(new Date(backupSummary.lastBackupAt))
          : "Chưa có",
        hint: "Thời gian backup cuối",
        icon: <ClockCircleOutlined />,
        iconColor: "#7c3aed",
        iconBg: "#ede9fe",
      },
    ],
    [summary, backupSummary]
  );

  if (loading) {
    return (
      <div className="report-stats-container">
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (!summary && !backupSummary) {
    return (
      <div className="report-stats-container">
        <Empty description="Chưa có dữ liệu thống kê" />
      </div>
    );
  }

  return (
    <div className="report-stats-container">
      <Row gutter={[16, 16]} className="stats-row">
        {stats.map((item, index) => (
          <Col key={index} xs={24} sm={12} md={8} className="stats-col">
            <div
              className="report-stat-card"
              style={{
                borderLeft: `4px solid ${item.iconColor}`,
                paddingLeft: "16px",
              }}
            >
              <Text className="report-stat-title">{item.title}</Text>
              <div
                className="report-stat-icon-wrapper"
                style={{ backgroundColor: item.iconBg }}
              >
                <div
                  className="report-stat-icon"
                  style={{ color: item.iconColor }}
                >
                  {item.icon}
                </div>
              </div>
              <Title level={2} className="report-stat-value">
                {item.value}
              </Title>
              <div className="report-stat-change" style={{ color: "#6b7280" }}>
                {item.hint}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ReportStatsCard;
