import FileService from "@/services/FileService";
import ReportService from "@/services/ReportService";
import removeVietnameseTones from "@/utils/removeVietnameseTones";
import {
  BarChartOutlined,
  InboxOutlined,
  PieChartOutlined,
  ReloadOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { Card, message, Pagination, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import "../../../style/preside/Reports.model.css";
import ReportCard from "./ReportCard";
import ReportDetailModal from "./ReportDetailModal";
import { getUserLogin } from "@/utils/auth";

interface ReportListProps {
  filter: string;
  searchValue: string;
}


const { Title, Text } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  Normal: <TeamOutlined />,
  Abnormal: <ReloadOutlined />,
  Final: <PieChartOutlined />,
};

const ReportList: React.FC<ReportListProps> = ({ filter, searchValue }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSystemPreside, setIsSystemPreside] = useState(true);
  const [currentElectionId, setCurrentElectionId] = useState<string | undefined>(undefined);
  const [userFetched, setUserFetched] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Modal detail state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // Lấy thông tin user và electionId
  useEffect(() => {
    const fetchUserAndElectionId = async () => {
      try {
        // Clear data trước khi fetch user để tránh hiển thị data sai
        setReports([]);

        const userData = await getUserLogin();
        const isSystemPresideValue = userData?.chairmanOfTheBoardOfDirectors === true;
        setIsSystemPreside(isSystemPresideValue);

        // Nếu không phải system preside, lấy electionId từ localStorage
        if (!isSystemPresideValue) {
          const electionId = localStorage.getItem("currentElectionId") || undefined;
          setCurrentElectionId(electionId);
        } else {
          setCurrentElectionId(undefined);
        }
        setUserFetched(true);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserFetched(true);
      }
    };
    fetchUserAndElectionId();
  }, []);

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
    // Chỉ load khi đã fetch user xong
    if (!userFetched) return;

    const load = async () => {
      try {
        setLoading(true);
        // Nếu không phải system preside, truyền electionId vào API
        const res = await ReportService.getAllReport(!isSystemPreside ? currentElectionId : undefined);
        setReports(res?.data || []);
      } catch (err) {
        console.error("Không thể tải báo cáo:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userFetched, isSystemPreside, currentElectionId]);

  // Filter + Search
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const title = (r.summary || "").toLowerCase();

      const searchNormalized = removeVietnameseTones(searchValue.toLowerCase());
      const titleNormalized = removeVietnameseTones(title);

      const matchType =
        filter === "" || r.summary?.toLowerCase() === filter.toLowerCase();

      const matchSearch =
        searchValue === "" ||
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
  if (filtered.length === 0) return (
    <div className="voting-history-content">
      <Card className="voting-single-card no-voting-card">
        <div className="no-voting-container">
          <div className="no-voting-icon">
            <InboxOutlined />
          </div>
          <Title level={4} className="no-voting-title">
            Không có báo cáo nào
          </Title>
          <Text type="secondary" className="no-voting-description">
            Hiện tại bạn chưa có báo cáo nào.
          </Text>

        </div>
      </Card>
    </div>
  );;

  return (
    <>
      <div className="report-grid">
        {pagedReports.map((r) => (
          <ReportCard
            key={r._id}
            icon={iconMap[r.type] || <BarChartOutlined />}
            title={r.summary? `Báo cáo ${r.summary}` : "Báo cáo không tiêu đề"}
            description={`Bầu cử: ${r.electionId?.title || "Không rõ"}`}
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
