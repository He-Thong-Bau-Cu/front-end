import AuditLogTable, { AuditLog } from "@/components/admin/statistics/AuditLogTable";
import RealTimeData from "@/components/admin/statistics/RealTimeData";
import StatisticsFilterBar from "@/components/admin/statistics/StatisticsFilterBar";
import StatisticsReportSection from "@/components/admin/statistics/StatisticsReportSection";
import StatisticsStats from "@/components/admin/statistics/StatisticsStats";
import SystemLogTable, {
  SystemLog,
} from "@/components/admin/statistics/SystemLogTable";
import { useLoading } from "@/contexts/LoadingContext";
import SystemService from "@/services/SystemService";
import { useEffect, useState } from "react";

type TimeRange = "week" | "month" | "year";

const Statistics = () => {
  const { showLoading, hideLoading } = useLoading();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [dataChart, setDataChart] = useState<any>(null);
  const [systemLogData, setSystemLogData] = useState<SystemLog[]>([]);
  const [totalSystemLog, setTotalSystemLog] = useState(0);
  const [auditLogData, setAuditLogData] = useState<AuditLog[]>([]);
  const [totalAuditLog, setTotalAuditLog] = useState(0);

  useEffect(() => {
    fetchDataChart(timeRange);
  }, [timeRange]);

  useEffect(() => {
    fetchDataSystemLog({ page: 1, limit: 10 });
    fetchAuditLogData({ page: 1, limit: 10 });
  }, []);

  const onChangeTimeRange = (timeRange: TimeRange) => {
    setTimeRange(timeRange);
    fetchDataChart(timeRange);
  };

  const fetchDataChart = async (timeRange: TimeRange) => {
    try {
      showLoading();
      const response = await SystemService.getStatisticsChart(timeRange);
      console.log(response);
      if (response.success) setDataChart(response.data);
      else setDataChart([]);
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  };

  const fetchDataSystemLog = async (values: any) => {
    try {
      showLoading();
      let body = {
        page: values.page,
        limit: values.limit,
      };
      const response = await SystemService.searchSystemLog(body);
      if (response.success) {
        setSystemLogData(response.data.content as SystemLog[]);
        setTotalSystemLog(response.data.totalItems as number);
      } else setSystemLogData([]);
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  };

  const fetchAuditLogData = async (values: any) => {
    try {
      showLoading();
      let body = {
        page: values.page,
        limit: values.limit,
      };
      const response = await SystemService.searchAuditLog(body);
      if (response.success) {
        setAuditLogData(response.data.content as AuditLog[]);
        setTotalAuditLog(response.data.totalItems);
      } else setAuditLogData([]);
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  };

  return (
    <div>
      {/* <StatisticsStats /> */}
      {/* <StatisticsReportSection /> */}
      {dataChart && (
        <RealTimeData
          dataMap={dataChart}
          onChangeTimeRange={onChangeTimeRange}
        />
      )}
      {systemLogData && (
        <SystemLogTable
          data={systemLogData}
          onSearch={fetchDataSystemLog}
          totalRecords={totalSystemLog}
        />
      )}
      {auditLogData && (
        <AuditLogTable
          data={auditLogData}
          onSearch={fetchAuditLogData}
          total={totalAuditLog}
        />
      )}
    </div>
  );
};

export default Statistics;
