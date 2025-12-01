import { useEffect, useState, useMemo } from "react";
import ReportCard from "./ReportCard";
import {
  BarChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Pagination, Spin, Empty, message } from "antd";
import "../../../style/preside/Reports.model.css";
import ReportService from "@/services/ReportService";
import removeVietnameseTones from "@/utils/removeVietnameseTones";
import ReportDetailModal from "./ReportDetailModal";
import FileService from "@/services/FileService";

interface ReportListProps {
  filter: string;
  searchValue: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Normal: <TeamOutlined />,
  Abnormal: <ReloadOutlined />,
  Final: <PieChartOutlined />,
};

const ReportList: React.FC<ReportListProps> = ({ filter, searchValue }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Modal detail state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // 👉 NEW: fetch detail by ID
  const openDetail = async (item: any) => {
    try {
      setLoading(true);
      const res = await ReportService.getReportById(item._id);
      setDetailData(res?.data || item);
      setDetailOpen(true);
    } catch (err) {
      console.error("Không thể tải chi tiết báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };
  const exportReport = async (item: any) => {
    try {
      const response = await FileService.getSignedFile(item.fileUrl);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.summary || item.title || "Báo_cáo"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải file!");
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailData(null);
  };

  // Load report list
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await ReportService.getAllReport();
        setReports(res?.data || []);
      } catch (err) {
        console.error("Không thể tải báo cáo:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter + Search
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const desc = (r.description || "").toLowerCase();
      const title = (r.summary || r.title || "").toLowerCase();

      const searchNormalized = removeVietnameseTones(searchValue.toLowerCase());
      const descNormalized = removeVietnameseTones(desc);
      const titleNormalized = removeVietnameseTones(title);

      const matchType =
        filter === "" || r.type?.toLowerCase() === filter.toLowerCase();

      const matchSearch =
        searchValue === "" ||
        descNormalized.includes(searchNormalized) ||
        titleNormalized.includes(searchNormalized);

      return matchType && matchSearch;
    });
  }, [reports, filter, searchValue]);

  // Paging
  const pagedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  if (loading) return <Spin style={{ marginTop: 40 }} />;
  if (filtered.length === 0) return <Empty description="Không có báo cáo nào" />;

  return (
    <>
      <div className="report-grid">
        {pagedReports.map((r) => (
          <ReportCard
            key={r._id || r.title}
            icon={iconMap[r.type] || <BarChartOutlined />}
            title={r.summary || r.title}
            description={`Bầu cử: ${r.electionId?.decisionName || "Không rõ"}`}
            onViewDetail={() => openDetail(r)}
            onExport={() => exportReport(r)}
          />
        ))}
      </div>

      {/* Pagination */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Pagination
          current={currentPage}
          total={filtered.length}
          pageSize={pageSize}
          showSizeChanger
          onChange={(p, s) => {
            setCurrentPage(p);
            setPageSize(s);
          }}
        />
      </div>

      {/* Modal detail */}
      <ReportDetailModal
        open={detailOpen}
        onClose={closeDetail}
        data={detailData}
      />
    </>
  );
};

export default ReportList;
