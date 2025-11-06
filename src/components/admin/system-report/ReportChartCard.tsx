import React from "react";
import { Card, Typography } from "antd";
import { BarChartOutlined, UserOutlined, ExpandOutlined, SettingOutlined } from "@ant-design/icons";
import "../../../style/admin/SystemReport.model.css";

const { Text } = Typography;

const ReportChartCard: React.FC = () => {
  return (
    <Card
      className="report-chart-card"
      bordered={false}
      title={
        <div className="report-chart-card-header">
          <div className="report-chart-card-title">
            <BarChartOutlined className="report-chart-card-title-icon" />
            Biểu đồ tham gia bầu cử
          </div>
          <div className="report-chart-card-actions">
            <UserOutlined className="report-chart-card-action-icon" />
            <ExpandOutlined className="report-chart-card-action-icon" />
            <SettingOutlined className="report-chart-card-action-icon" />
          </div>
        </div>
      }
    >
      <div className="chart-placeholder">
        <BarChartOutlined className="chart-placeholder-icon" />
        <Text type="secondary" className="chart-placeholder-text">
          Biểu đồ thống kê (Chart.js hoặc thư viện khác có thể được tích hợp ở đây)
        </Text>
      </div>
    </Card>
  );
};

export default ReportChartCard;
