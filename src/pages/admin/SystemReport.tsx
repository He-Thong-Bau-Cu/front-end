import React from "react";
import { Typography, DatePicker, Button, Row, Col } from "antd";
import { BarChartOutlined, DownloadOutlined } from "@ant-design/icons";
import ReportStatsCard from "@/components/admin/system-report/ReportStatsCard";
import ReportChartCard from "@/components/admin/system-report/ReportChartCard";
import ReportActivityCard from "@/components/admin/system-report/ReportActivityCard";
import dayjs from "dayjs";
import "@/style/admin/SystemReport.model.css";

const { Title, Text } = Typography;

const SystemReport: React.FC = () => {
  return (
    <div className="system-report-container">
      {/* Page Header */}
      <div className="system-report-header">
        <div className="system-report-header-left">
          <Title level={2} className="system-report-main-title">
            <BarChartOutlined className="system-report-title-icon" />
            Báo cáo Hệ thống
          </Title>
          <Text className="system-report-subtitle">
            Tổng quan và phân tích dữ liệu hệ thống bầu cử
          </Text>
        </div>
        <div className="system-report-header-right">
          <Text className="system-report-date-label">Tháng này</Text>
          <DatePicker
            defaultValue={dayjs("2024-03-29", "YYYY-MM-DD")}
            format="MM/DD/YYYY"
            className="system-report-date-picker"
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            className="system-report-export-btn"
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="system-report-stats-section">
        <ReportStatsCard />
      </div>

      {/* Chart and Activity Side by Side */}
      <Row gutter={[0, 20]} className="system-report-bottom-section">
        <Col xs={24} lg={16} className="chart-col">
          <ReportChartCard />
        </Col>
        <Col xs={24} lg={8} className="activity-col">
          <ReportActivityCard />
        </Col>
      </Row>
    </div>
  );
};

export default SystemReport;
