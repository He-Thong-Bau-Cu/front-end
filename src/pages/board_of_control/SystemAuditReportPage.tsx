import React, { useEffect, useState } from "react";
import { Button, Space } from "antd";
import {
  DownloadOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
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
import "../../style/board-of-control/SystemAuditReport.model.css";
import BoardControlService from "@/services/BoardControlService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { BoardAuditReportPayload } from "@/types/BoardControl.interface";
import { downloadBlob } from "@/utils/file";

export default function SystemAuditReportPage() {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [reportData, setReportData] = useState<BoardAuditReportPayload | null>(
    null
  );
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
        return;
      }
      try {
        showLoading();
        const response = await BoardControlService.getAuditReport(electionId);
        if (response.success && response.data) {
          setReportData(response.data);
        } else {
          notify(response.message || "Không thể tải báo cáo kiểm soát", "error");
        }
      } catch (error) {
        console.error(error);
        notify("Không thể tải báo cáo kiểm soát", "error");
      } finally {
        hideLoading();
      }
    };

    loadReport();
  }, []);

  const handleSignReport = async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }
    try {
      setSigning(true);
      const response = await BoardControlService.signAuditReport(electionId);
      if (response.success) {
        notify(response.message || "Đã ký số báo cáo", "success");
        setReportData((prev) =>
          prev
            ? {
                ...prev,
                signature: {
                  ...prev.signature,
                  isConfirmed: true,
                },
              }
            : prev
        );
      } else {
        notify(response.message || "Không thể ký số báo cáo", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể ký số báo cáo", "error");
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadDraft = async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }
    try {
      showLoading();
      const blob = await BoardControlService.downloadAuditReport(electionId);
      const fileName = `bao-cao-kiem-soat-${electionId}-${Date.now()}.pdf`;
      downloadBlob(blob, fileName);
      notify("Tải xuống báo cáo thành công", "success");
    } catch (error) {
      console.error(error);
      notify("Không thể tải xuống báo cáo", "error");
    } finally {
      hideLoading();
    }
  };

  const handlePrintReport = async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }
    try {
      showLoading();
      const blob = await BoardControlService.downloadAuditReport(electionId);
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        notify("Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình chặn popup.", "warning");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể in báo cáo", "error");
    } finally {
      hideLoading();
    }
  };

  const reportInfo: ReportInfo = reportData?.info || {
    id: "---",
    createdDate: "--/--/----",
    reportPeriod: "--/--/---- - --/--/----",
    status: "Chờ ký duyệt",
  };
  const summaryCards: ReportSummaryCard[] = reportData?.summaryCards || [];
  const reportLogs: ReportLogItem[] = reportData?.logs || [];
  const signatureInfo: SignatureInfo = reportData?.signature || {
    signerName: "Ban Kiểm soát",
    signerRole: "Trưởng Ban Kiểm soát",
    isConfirmed: false,
  };

  return (
      <>
        <div className="sar-topbar">
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadDraft}>
              Tải xuống bản nháp
            </Button>
            <Button icon={<FileTextOutlined />} onClick={handlePrintReport}>
              In Báo cáo
            </Button>
            <Button danger icon={<CloseCircleOutlined />}>
              Từ chối & Gửi Phản hồi
            </Button>
          </Space>
        </div>
        <div className="sar-page">
          <ReportHeader info={reportInfo} />
          <ReportSummary cards={summaryCards} />
          <ReportTabs logs={reportLogs} />
          <ReportSignature
              info={signatureInfo}
              onConfirm={handleSignReport}
              loading={signing}
          />
        </div>
      </>
  );
}
