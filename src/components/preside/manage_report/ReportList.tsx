import FileService from "@/services/FileService";
import ReportService from "@/services/ReportService";
import removeVietnameseTones from "@/utils/removeVietnameseTones";
import { useNotification } from "@/contexts/NotificationContext";
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
  electionId?: string | null;
}


const { Title, Text } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  Verification: <TeamOutlined />,
  Abnormal: <ReloadOutlined />,
  Audit: <PieChartOutlined />,
};

const ReportList: React.FC<ReportListProps> = ({ filter, searchValue, electionId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSystemPreside, setIsSystemPreside] = useState(true);
  const [currentElectionId, setCurrentElectionId] = useState<string | undefined>(undefined);
  const [userFetched, setUserFetched] = useState(false);
  const { notify } = useNotification();

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
      const res = await ReportService.getReportById(item._id);
      setDetailData(res?.data || item);
      setDetailOpen(true);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
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
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
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
  // Filter + Search
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const summary = (r.summary || "").toLowerCase();
      const description = (r.description || "").toLowerCase();

      const searchNormalized = removeVietnameseTones(
        searchValue.toLowerCase()
      );
      const summaryNormalized = removeVietnameseTones(summary);
      const descNormalized = removeVietnameseTones(description);

      // Lọc theo type: verification / abnormal / audit
      const matchType =
        !filter || (r.type && r.type.toLowerCase() === filter.toLowerCase());

      // Tìm theo tiêu đề HOẶC mô tả
      const matchSearch =
        !searchValue ||
        summaryNormalized.includes(searchNormalized) ||
        descNormalized.includes(searchNormalized);

      const matchElection =
        !electionId ||
        r.electionId?._id === electionId ||
        r.electionId === electionId;

      return matchType && matchSearch && matchElection;
    });
  }, [reports, filter, searchValue, electionId]);


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
  );

  return (
    <>
      <div className="voting-history-content">
        <Card className="report-list-wrapper">
          <div className="report-grid">
            {pagedReports.map((r) => (
              <ReportCard
                key={r._id}
                icon={iconMap[r.type] || <BarChartOutlined />}
                title={r.summary ? `Báo cáo ${r.summary}` : "Báo cáo không tiêu đề"}
                description={`Bầu cử: ${r.electionId?.title || "Không rõ"}`}
                type={r.type}         // <-- thêm dòng này
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
        </Card>
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
