import React from "react";
import { Card, Typography, Skeleton, Empty, List, Tag } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  ExpandOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  SystemReportEndpointStat,
  SystemReportTimelinePoint,
} from "@/types/SystemReport.interface";
import "../../../style/admin/SystemReport.model.css";

const { Text, Title } = Typography;

interface ReportChartCardProps {
  timeline: SystemReportTimelinePoint[];
  endpoints: SystemReportEndpointStat[];
  loading?: boolean;
}

const ReportChartCard: React.FC<ReportChartCardProps> = ({
  timeline,
  endpoints,
  loading,
}) => {
  return (
    <Card
      className="report-chart-card"
      bordered={false}
      title={
        <div className="report-chart-card-header">
          <div className="report-chart-card-title">
            <BarChartOutlined className="report-chart-card-title-icon" />
            Hiệu suất hệ thống
          </div>
          {/* <div className="report-chart-card-actions">
            <UserOutlined className="report-chart-card-action-icon" />
            <ExpandOutlined className="report-chart-card-action-icon" />
            <SettingOutlined className="report-chart-card-action-icon" />
          </div> */}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : timeline.length ? (
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis yAxisId="left" />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "ms", angle: -90, position: "insideRight" }}
              />
              <RechartsTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#2563eb"
                strokeWidth={2}
                yAxisId="left"
                name="Requests"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#ef4444"
                strokeWidth={2}
                yAxisId="left"
                name="Errors"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="avgResponseTime"
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
                yAxisId="right"
                name="Response (ms)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-placeholder">
          <Empty description="Chưa có dữ liệu biểu đồ" />
        </div>
      )}

      <div className="report-chart-endpoints">
        <Title level={5} style={{ marginBottom: 12 }}>
          Tốp endpoint được gọi nhiều
        </Title>
        {loading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : endpoints.length ? (
          <List
            dataSource={endpoints}
            renderItem={(item) => (
              <List.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <span>
                    <Tag color="blue" style={{ marginRight: 8 }}>
                      {item.method}
                    </Tag>
                    <Text strong>{item.endpoint}</Text>
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <Text type="secondary" style={{ display: "block" }}>
                      {item.requests} request • lỗi {item.errorRate}%
                    </Text>
                    <Text strong>{item.avgResponseTime} ms</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Không có dữ liệu endpoint" />
        )}
      </div>
    </Card>
  );
};

export default ReportChartCard;
