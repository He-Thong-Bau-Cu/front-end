import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { message } from "antd";
import ArchiveSearchBar from "../../components/board_of_control/reports-achive/ArchiveSearchBar";
import ArchiveTable from "../../components/board_of_control/reports-achive/ArchiveTable";
import { ReportArchiveItem, ReportArchiveFilter } from "../../types/ReportArchive.interface";
import "../../style/board-of-control/ReportArchive.model.css";
import removeVietnameseTones from "@/utils/removeVietnameseTones";
import ReportService from "@/services/ReportService.interface";
import { Report } from "@/types/Report.interface";
import { useLoading } from "@/contexts/LoadingContext";
import { formatServerDate } from "@/utils/date";

// Type mapping
const TYPE_MAP: Record<string, string> = {
  NORMAL: "Báo cáo Thường",
  ABNORMAL: "Báo cáo Bất thường",
  FINAL: "Kết quả Bầu cử",
};

// Map Report từ API sang ReportArchiveItem
const mapReportToArchiveItem = (report: Report): ReportArchiveItem => {
  const date = report.createdAt
    ? formatServerDate(report.createdAt, "DD/MM/YYYY", { fallback: "-" })
    : report.reviewedAt
      ? formatServerDate(report.reviewedAt, "DD/MM/YYYY", { fallback: "-" })
      : formatServerDate(new Date(), "DD/MM/YYYY", { adjustTimezone: false, fallback: "-" });

  const signer = report.signedBy?.fullName || report.signedBy?.username || "-";
  const event = report.electionId?.title || "-";
  const originalType = report.type || "-";
  const type = originalType ? TYPE_MAP[originalType] || originalType : "-";
  const name = report.description || `Báo cáo ${type}`;

  return {
    id: report._id || "",
    name,
    type,
    originalType,
    event,
    date,
    signer,
    // Thêm các field chi tiết
    description: report.description,
    summary: report.summary,
    fileUrl: report.fileUrl,
    status: report.status,
    severity: report.severity,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    reviewedAt: report.reviewedAt,
    createdBy: report.createdBy,
    electionId: report.electionId ? {
      _id: report.electionId._id,
      title: report.electionId.title,
      decisionNumber: report.electionId.decisionNumber,
      decisionName: report.electionId.decisionName,
      status: report.electionId.status,
      statusData: report.electionId.statusData,
    } : undefined,
  };
};

export default function ReportArchivePage() {
  const location = useLocation();
  const electionId = location.state?.electionId || localStorage.getItem("currentElectionId");

  const [allData, setAllData] = useState<ReportArchiveItem[]>([]);
  const { showLoading, hideLoading } = useLoading();

  // --- STATE FILTER ---
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("Tất cả");

  // --- PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- FETCH DATA FROM API ---
  useEffect(() => {
    const fetchReports = async () => {
      if (!electionId) {
        message.error("Không tìm thấy electionId");
        hideLoading();
        return;
      }

      try {
        showLoading();
        const reports = await ReportService.getAllReportByElectionId(electionId);
        const mappedData = reports.map(mapReportToArchiveItem);
        setAllData(mappedData);
      } catch (error: unknown) {
        console.error("Lỗi khi lấy danh sách báo cáo:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải danh sách báo cáo";
        message.error(errorMessage);
        setAllData([]);
      } finally {
        hideLoading();
      }
    };

    fetchReports();
  }, [electionId]);

  // --- LẤY DANH SÁCH LOẠI BÁO CÁO TỪ DATA (lấy từ originalType gốc) ---
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    allData.forEach((item) => {
      if (item.originalType && item.originalType !== "-") {
        // Lấy loại đã map sang tiếng Việt để hiển thị
        const displayType = TYPE_MAP[item.originalType] || item.originalType;
        types.add(displayType);
      }
    });
    return Array.from(types).sort();
  }, [allData]);

  // --- LỌC DỮ LIỆU ---
  const filteredData = useMemo(() => {
    let result = [...allData];

    // 1️⃣ TÌM KIẾM KHÔNG DẤU + CÓ DẤU
    if (keyword.trim()) {
      const kw = removeVietnameseTones(keyword.trim().toLowerCase());
      result = result.filter((item) => {
        const name = removeVietnameseTones(item.name.toLowerCase());
        return name.includes(kw);
      });
    }

    // 2️⃣ LỌC THEO LOẠI BÁO CÁO (so sánh với type đã map)
    if (type !== "Tất cả") {
      result = result.filter((item) => item.type === type);
    }

    return result;
  }, [allData, keyword, type]);

  // --- PHÂN TRANG ---
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage]);

  // --- HANDLERS ---
  const handleSearch = (values: Partial<ReportArchiveFilter>) => {
    setKeyword(values.keyword || "");
    setType(values.type || "Tất cả");
    setCurrentPage(1);
  };



  return (
    <div className="ra-page">
      <ArchiveSearchBar onSearch={handleSearch} availableTypes={availableTypes} />
      <ArchiveTable
        data={paginatedData}
        total={filteredData.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
