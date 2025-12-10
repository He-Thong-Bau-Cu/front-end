import React from "react";
import { Card, Typography, Tag, Empty, Skeleton, List } from "antd";
import {
  StarOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "../../../style/admin/SystemReport.model.css";
import type { SystemReportAuditSummary } from "@/types/SystemReport.interface";
import { formatDate } from "@/utils/format";

const { Text } = Typography;

interface ReportActivityCardProps {
  auditSummary?: SystemReportAuditSummary;
  loading?: boolean;
}

const ReportActivityCard: React.FC<ReportActivityCardProps> = ({
  auditSummary,
  loading,
}) => {
  const activities = auditSummary?.latestActivities || [];
  const topModules = auditSummary?.topModules || [];

  return (
    <Card
      className="report-activity-card"
      bordered={false}
      title={
        <div className="report-activity-card-header">
          <div className="report-activity-card-title">
            <StarOutlined className="report-activity-card-title-icon" />
            Hoạt động gần đây
          </div>
          {/* <ReloadOutlined className="report-activity-card-refresh-icon" /> */}
        </div>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">Top module</Text>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {topModules.length ? (
            topModules.map((module) => (
              <Tag color="processing" key={module.module}>
                {module.module} ({module.count})
              </Tag>
            ))
          ) : (
            <Text type="secondary">Chưa có thống kê</Text>
          )}
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : activities.length ? (
        <List
          className="report-activity-list"
          dataSource={activities}
          renderItem={(item) => (
            <List.Item className="report-activity-item">
              <div className="report-activity-icon-wrapper">
                <div className="report-activity-icon">
                  <ClockCircleOutlined />
                </div>
              </div>
              <div className="report-activity-content">
                <Text strong className="report-activity-title">
                  {item.module}
                </Text>
                <Text type="secondary" className="report-activity-desc">
                  {item.action} {item.user ? `- ${item.user}` : ""}
                </Text>
              </div>
              <Text type="secondary" className="report-activity-time">
                {formatDate(new Date(item.at))}
              </Text>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Không có hoạt động gần đây" />
      )}
    </Card>
  );
};

export default ReportActivityCard;
