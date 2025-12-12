import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  DatePicker,
  Button,
  Row,
  Col,
  Select,
  Space,
  Tooltip,
} from "antd";
import {
  BarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { formatServerDate } from "@/utils/date";

import ReportStatsCard from "@/components/admin/system-report/ReportStatsCard";
import ReportChartCard from "@/components/admin/system-report/ReportChartCard";
import ReportActivityCard from "@/components/admin/system-report/ReportActivityCard";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import SystemReportService from "@/services/SystemReportService";
import type {
  ReportInterval,
  SystemReportOverview,
  SystemReportQuery,
} from "@/types/SystemReport.interface";
import { downloadBlob } from "@/utils/file";

import "@/style/admin/SystemReport.model.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DEFAULT_INTERVAL: ReportInterval = "day";

const SystemReport: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  const [overview, setOverview] = useState<SystemReportOverview | null>(null);
  const [filters, setFilters] = useState<SystemReportQuery>({
    fromDate: dayjs().subtract(30, "day").startOf("day").toISOString(),
    toDate: dayjs().endOf("day").toISOString(),
    interval: DEFAULT_INTERVAL,
  });
  const [rangeValue, setRangeValue] = useState<[Dayjs, Dayjs]>([
    dayjs(filters.fromDate),
    dayjs(filters.toDate),
  ]);
  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchOverview = async (
    override?: Partial<SystemReportQuery>,
    baseFilters?: SystemReportQuery
  ) => {
    const currentFilters = baseFilters || filters;
    const nextFilters = {
      ...currentFilters,
      ...override,
    };

    setIsFetching(true);
    showLoading();
    try {
      const response = await SystemReportService.getOverview(nextFilters);
      if (response.success && response.data) {
        setOverview(response.data);
        setFilters(nextFilters);
        if (response.data.range) {
          setRangeValue([
            dayjs(response.data.range.fromDate),
            dayjs(response.data.range.toDate),
          ]);
        }
      } else {
        notify(response.message || "Không thể tải báo cáo hệ thống", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể tải báo cáo hệ thống", "error");
    } finally {
      setIsFetching(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchOverview({}, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIntervalChange = (value: ReportInterval) => {
    fetchOverview({ interval: value });
  };

  const handleApplyDateRange = () => {
    if (!rangeValue || rangeValue.length !== 2) {
      notify("Vui lòng chọn khoảng thời gian hợp lệ", "warning");
      return;
    }

    const [from, to] = rangeValue;
    fetchOverview({
      fromDate: from.startOf("day").toISOString(),
      toDate: to.endOf("day").toISOString(),
    });
  };

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    showLoading();
    try {
      const blob = await SystemReportService.exportReport({
        ...filters,
        format,
      });
      downloadBlob(
        blob,
        `system-report-${dayjs().format("YYYYMMDD-HHmmss")}.${format}`
      );
      notify("Xuất báo cáo thành công", "success");
    } catch (error) {
      console.error(error);
      notify("Xuất báo cáo thất bại", "error");
    } finally {
      setIsExporting(false);
      hideLoading();
    }
  };

  const subtitle = useMemo(() => {
    if (!overview?.range) return "Tổng quan và phân tích dữ liệu hệ thống bầu cử";
    const from = formatServerDate(overview.range.fromDate, { fallback: "--/--/----" });
    const to = formatServerDate(overview.range.toDate, { fallback: "--/--/----" });
    return `Thống kê từ ${from} đến ${to}`;
  }, [overview?.range]);

  return (
    <div className="system-report-container">
      <div className="system-report-header">
        <div className="system-report-header-left">
          <Title level={2} className="system-report-main-title">
            <BarChartOutlined className="system-report-title-icon" />
            Báo cáo Hệ thống
          </Title>
          <Text className="system-report-subtitle">{subtitle}</Text>
        </div>
        <div className="system-report-header-right">
          <Space size={12} align="start" wrap>
            <RangePicker
              value={rangeValue}
              format="DD/MM/YYYY"
              onChange={(values) => {
                if (!values || values.length !== 2) {
                  setRangeValue([dayjs().subtract(30, "day"), dayjs()]);
                  return;
                }
                setRangeValue(values as [Dayjs, Dayjs]);
              }}
            />
            <Select<ReportInterval>
              value={filters.interval || DEFAULT_INTERVAL}
              style={{ width: 140 }}
              onChange={handleIntervalChange}
              options={[
                { value: "day", label: "Theo ngày" },
                { value: "week", label: "Theo tuần" },
                { value: "month", label: "Theo tháng" },
              ]}
            />
            <Button
              onClick={handleApplyDateRange}
              icon={<ReloadOutlined />}
              disabled={isFetching}
            >
              Áp dụng
            </Button>
            <Tooltip title="Xuất báo cáo CSV">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={isExporting}
                onClick={() => handleExport("csv")}
              >
                Xuất CSV
              </Button>
            </Tooltip>
            <Button onClick={() => handleExport("json")} disabled={isExporting}>
              Xuất JSON
            </Button>
          </Space>
        </div>
      </div>

      <div className="system-report-stats-section">
        <ReportStatsCard
          summary={overview?.summary}
          backupSummary={overview?.backupSummary}
          loading={isFetching}
        />
      </div>

      <Row gutter={[24, 24]} className="system-report-bottom-section">
        <Col xs={24} lg={16} className="chart-col">
          <ReportChartCard
            timeline={overview?.timeline || []}
            endpoints={overview?.topEndpoints || []}
            loading={isFetching}
          />
        </Col>
        <Col xs={24} lg={8} className="activity-col">
          <ReportActivityCard
            auditSummary={overview?.auditSummary}
            loading={isFetching}
          />
        </Col>
      </Row>
    </div>
  );
};

export default SystemReport;
