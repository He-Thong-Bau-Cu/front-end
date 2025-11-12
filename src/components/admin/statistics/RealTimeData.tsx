import React, { useState } from "react";
import { Card, Select, Typography } from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import "../../../style/admin/Statistics.model.css";

const { Text } = Typography;
const { Option } = Select;

interface DataPoint {
  time: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

interface MockDataType {
  week: DataPoint[];
  month: DataPoint[];
  year: DataPoint[];
}

type TimeRange = "week" | "month" | "year";
type ChartType = "line" | "bar";

interface RequestLogChartProps {
  dataMap?: any;
  onChangeTimeRange?: (timeRange: TimeRange) => void;
}

const RequestLogChart: React.FC<RequestLogChartProps> = ({
  dataMap = [],
  onChangeTimeRange,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [chartType, setChartType] = useState<ChartType>("line");

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
    if (onChangeTimeRange) onChangeTimeRange(value);
  };

  const currentData: DataPoint[] = dataMap;

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
  }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, marginBottom: "8px" }}>
            {payload[0]?.payload?.time}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: "4px 0", color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString()}
              {entry.name === "Thời gian phản hồi TB" ? "ms" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="realtime-card">
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "22px",
            }}
          >
            <Text strong style={{ fontSize: "16px", marginLeft: "12px" }}>
              📊 Thống kê Request Log
            </Text>
            <div style={{ display: "flex", gap: "12px", marginRight: "12px" }}>
              <Select
                value={timeRange}
                onChange={(value: TimeRange) => handleTimeRangeChange(value)}
                style={{ width: 120 }}
              >
                <Option value="week">Tuần này</Option>
                <Option value="month">Tháng này</Option>
                <Option value="year">Năm này</Option>
              </Select>
              <Select
                value={chartType}
                onChange={(value: ChartType) => setChartType(value)}
                style={{ width: 120 }}
              >
                <Option value="line">Đường</Option>
                <Option value="bar">Cột</Option>
              </Select>
            </div>
          </div>
        }
        style={{ marginBottom: "24px" }}
      >
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "line" ? (
            <LineChart
              data={currentData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="requests"
                stroke="#1890ff"
                strokeWidth={2}
                name="Số requests"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="errors"
                stroke="#ff4d4f"
                strokeWidth={2}
                name="Lỗi"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgResponseTime"
                stroke="#52c41a"
                strokeWidth={2}
                name="Thời gian phản hồi TB"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={currentData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="requests"
                fill="#1890ff"
                name="Số requests"
              />
              <Bar yAxisId="left" dataKey="errors" fill="#ff4d4f" name="Lỗi" />
              <Bar
                yAxisId="right"
                dataKey="avgResponseTime"
                fill="#52c41a"
                name="Thời gian phản hồi TB"
              />
            </BarChart>
          )}
        </ResponsiveContainer>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: 600, color: "#1890ff" }}
            >
              {currentData
                .reduce((sum, item) => sum + item.requests, 0)
                .toLocaleString()}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>Tổng requests</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: 600, color: "#ff4d4f" }}
            >
              {currentData
                .reduce((sum, item) => sum + item.errors, 0)
                .toLocaleString()}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>Tổng lỗi</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: 600, color: "#52c41a" }}
            >
              {Math.round(
                currentData.reduce(
                  (sum, item) => sum + item.avgResponseTime,
                  0
                ) / currentData.length
              )}
              ms
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>
              Thời gian phản hồi TB
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: 600, color: "#faad14" }}
            >
              {(
                (currentData.reduce((sum, item) => sum + item.errors, 0) /
                  currentData.reduce((sum, item) => sum + item.requests, 0)) *
                100
              ).toFixed(2)}
              %
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>Tỷ lệ lỗi</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RequestLogChart;
