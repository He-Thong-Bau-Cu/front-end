import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import ArchiveHeader from "../../components/board_of_control/reports-achive/ArchiveHeader";
import ArchiveSearchBar from "../../components/board_of_control/reports-achive/ArchiveSearchBar";
import ArchiveTable from "../../components/board_of_control/reports-achive/ArchiveTable";
import { ReportArchiveItem } from "../../types/ReportArchive.interface";
import "../../style/board-of-control/ReportArchive.model.css";
import removeVietnameseTones from "@/utils/removeVietnameseTones";

export default function ReportArchivePage() {
  // --- DỮ LIỆU GIẢ LẬP ---
  const allData: ReportArchiveItem[] = [
    {
      id: "AR-2024-001",
      name: "Kết quả cuối cùng: Bầu cử HĐQT 2024",
      type: "Kết quả Bầu cử",
      event: "Bầu cử HĐQT 2024",
      date: "25/12/2024",
      signer: "Nguyễn Văn A, ...",
    },
    {
      id: "AR-2024-002",
      name: "Báo cáo kiểm toán hệ thống Q4/2024",
      type: "Báo cáo Kiểm soát",
      event: "-",
      date: "15/12/2024",
      signer: "Trần Thị B",
    },
    {
      id: "AR-2024-003",
      name: "Biên bản họp Đại hội Cổ đông 2024",
      type: "Biên bản Họp",
      event: "ĐH Cổ đông 2024",
      date: "01/11/2024",
      signer: "Lê Văn C",
    },
    {
      id: "AR-2024-004",
      name: "Kết quả bầu cử Ban Kiểm soát 2023",
      type: "Kết quả Bầu cử",
      event: "Bầu cử BKS 2023",
      date: "25/12/2023",
      signer: "Nguyễn Văn D",
    },
  ];

  // --- STATE FILTER ---
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [type, setType] = useState("Tất cả");
  const [event, setEvent] = useState("Tất cả");

  // --- PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- LỌC DỮ LIỆU ---
  const filteredData = useMemo(() => {
    let result = [...allData];

    // 1️⃣ TÌM KIẾM KHÔNG DẤU + CÓ DẤU
    if (keyword.trim()) {
      const kw = removeVietnameseTones(keyword.trim().toLowerCase());
      result = result.filter((item) => {
        const name = removeVietnameseTones(item.name.toLowerCase());
        const id = removeVietnameseTones(item.id.toLowerCase());
        return name.includes(kw) || id.includes(kw);
      });
    }

    // 2️⃣ LỌC THEO KHOẢNG NGÀY
    if (startDate && endDate) {
      result = result.filter((item) => {
        const itemDate = dayjs(item.date, "DD/MM/YYYY");
        return (
          itemDate.isAfter(dayjs(startDate)) &&
          itemDate.isBefore(dayjs(endDate).add(1, "day"))
        );
      });
    }

    // 3️⃣ LỌC THEO LOẠI BÁO CÁO
    if (type !== "Tất cả") {
      result = result.filter((item) => item.type === type);
    }

    // 4️⃣ LỌC THEO SỰ KIỆN
    if (event !== "Tất cả") {
      result = result.filter((item) => item.event === event);
    }

    return result;
  }, [keyword, startDate, endDate, type, event]);

  // --- PHÂN TRANG ---
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage]);

  // --- HANDLERS ---
  const handleSearch = (values: any) => {
    setKeyword(values.keyword || "");
    setStartDate(values.startDate || null);
    setEndDate(values.endDate || null);
    setType(values.type || "Tất cả");
    setEvent(values.event || "Tất cả");
    setCurrentPage(1);
  };

  return (
    <div className="ra-page">
      <ArchiveHeader />
      <ArchiveSearchBar onSearch={handleSearch} />
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