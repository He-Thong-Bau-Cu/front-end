import React from "react";
import ReportHeader from "../../components/board_of_control/reports-control/ReportHeader";
import ReportSummary from "../../components/board_of_control/reports-control/ReportSummary";
import ReportTabs from "../../components/board_of_control/reports-control/ReportTabs";
import ReportSignature from "../../components/board_of_control/reports-control/ReportSignature";
import {
  ReportInfo,
  ReportSummaryCard,
  ReportLogItem,
  SignatureInfo,
} from "../../types/SystemAuditReport.interface";
import {
  DownloadOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "../../style/board-of-control/SystemAuditReport.model.css";
import { Button, Space } from "antd";

export default function SystemAuditReportPage() {
  const reportInfo: ReportInfo = {
    id: "BCKT-2025-09",
    createdDate: "01/10/2025",
    reportPeriod: "01/09/2025 - 30/09/2025",
    status: "Chờ ký duyệt",
  };

  const summaryCards: ReportSummaryCard[] = [
    { title: "Sự kiện An ninh", value: 3 },
    { title: "Hành động Quản trị", value: 12 },
    { title: "Tỷ lệ Uptime", value: "99.98%" },
    { title: "Toàn vẹn Dữ liệu", value: "HỢP LỆ", highlight: true },
  ];

  // 🔹 DỮ LIỆU MẪU ĐỂ TEST FILTER
  const reportLogs: ReportLogItem[] = [
    {
      time: "29/09/2025 14:30",
      user: "admin_A",
      action: "TẠO MỚI",
      details: 'Tạo cuộc bầu cử "Bầu cử HĐQT 2025".',
    },
    {
      time: "28/09/2025 10:00",
      user: "admin_B",
      action: "CẬP NHẬT",
      details: "Cập nhật danh sách cử tri cho sự kiện.",
    },
    {
      time: "26/09/2025 16:15",
      user: "security_bot",
      action: "CẢNH BÁO",
      details: "Phát hiện truy cập bất thường từ IP 192.168.1.10.",
    },
    {
      time: "25/09/2025 09:42",
      user: "admin_C",
      action: "XÓA DỮ LIỆU",
      details: "Xóa bản ghi lỗi trong nhật ký hệ thống.",
    },
    {
      time: "24/09/2025 11:20",
      user: "auditor_01",
      action: "KIỂM TRA",
      details: "Rà soát nhật ký hoạt động của tháng 9.",
    },
    {
      time: "23/09/2025 18:00",
      user: "admin_A",
      action: "CẬP NHẬT",
      details: "Thay đổi chính sách xác thực người dùng.",
    },
    {
      time: "21/09/2025 08:30",
      user: "security_team",
      action: "BÁO CÁO",
      details: "Gửi báo cáo sự kiện an ninh ngày 20/09.",
    },
    {
      time: "18/09/2025 15:10",
      user: "admin_B",
      action: "TẠO MỚI",
      details: "Tạo người dùng hệ thống mới cho Ban Kiểm soát.",
    },
    {
      time: "15/09/2025 09:00",
      user: "auditor_02",
      action: "KIỂM TRA",
      details: "Đối chiếu log truy cập từ ngày 10–14/09.",
    },
    {
      time: "12/09/2025 14:45",
      user: "admin_D",
      action: "CẬP NHẬT",
      details: "Chỉnh sửa thông tin cấu hình hệ thống mạng.",
    },
    {
      time: "09/09/2025 10:25",
      user: "security_bot",
      action: "CẢNH BÁO",
      details: "Hệ thống phát hiện đăng nhập sai mật khẩu 5 lần.",
    },
    {
      time: "05/09/2025 17:00",
      user: "admin_A",
      action: "XÓA DỮ LIỆU",
      details: "Xóa file backup cũ tháng 8 để giải phóng dung lượng.",
    },
  ];

  const signatureInfo: SignatureInfo = {
    signerName: "Nguyễn Văn A",
    signerRole: "Trưởng Ban Kiểm soát",
    isConfirmed: false,
  };

  return (
    <>
      {/* Top action bar */}
      <div className="sar-topbar">
        <Space>
          <Button icon={<DownloadOutlined />}>
            Tải xuống bản nháp
          </Button>
          <Button icon={<FileTextOutlined />}>In Báo cáo</Button>
          <Button danger icon={<CloseCircleOutlined />}>
            Từ chối & Gửi Phản hồi
          </Button>
        </Space>
      </div>
      <div className="sar-page">
        <ReportHeader info={reportInfo} />
        <ReportSummary cards={summaryCards} />
        <ReportTabs logs={reportLogs} />
        <ReportSignature info={signatureInfo} />
      </div></>
  );
}
