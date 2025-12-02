import React, { useEffect, useState } from "react";
import { Button, Space, Alert } from "antd";
import {
  DownloadOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { SOCKET_URL } from "@/config/socket";
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
import ElectionService from "@/services/ElectionService";
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
  const [canSign, setCanSign] = useState<boolean>(false);
  const [stageInfo, setStageInfo] = useState<{
    currentStage: string;
    stageStatus: string;
    message: string;
  } | null>(null);

  // Tính toán currentStage từ timeline và stages
  const calculateCurrentStage = (timeline: any, stages: any) => {
    let currentStage = 'not_started';
    let stageStatus = 'NOT_STARTED';

    if (timeline.checkinAt && stages.checkin !== 'COMPLETED') {
      currentStage = 'checkin';
      stageStatus = 'STARTED';
    } else if (stages.checkin === 'COMPLETED' && timeline.reportAt && stages.report !== 'COMPLETED') {
      currentStage = 'report';
      stageStatus = 'STARTED';
    } else if (stages.report === 'COMPLETED' && timeline.votingAt && stages.voting !== 'COMPLETED') {
      currentStage = 'voting';
      stageStatus = 'STARTED';
    } else if (stages.voting === 'COMPLETED' && timeline.resultAnnouncedAt && stages.result !== 'COMPLETED') {
      currentStage = 'result';
      stageStatus = 'STARTED';
    } else if (stages.result === 'COMPLETED' && timeline.closingAt && stages.closing !== 'COMPLETED') {
      currentStage = 'closing';
      stageStatus = 'STARTED';
    } else if (stages.closing === 'COMPLETED') {
      currentStage = 'completed';
      stageStatus = 'COMPLETED';
    }

    return { currentStage, stageStatus };
  };

  // Kiểm tra trạng thái stage để cho phép ký báo cáo
  // Ký báo cáo có thể được ký sau khi voting completed
  const checkSignatureStage = async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      setCanSign(false);
      setStageInfo({
        currentStage: 'unknown',
        stageStatus: 'NOT_STARTED',
        message: 'Không tìm thấy cuộc bầu cử hiện tại'
      });
      return;
    }

    try {
      const stageResponse = await ElectionService.getCurrentStage(electionId);
      const stageData = stageResponse?.data || stageResponse;

      const timeline = stageData?.timeline || {};
      const stages = stageData?.stages || {};
      const { currentStage, stageStatus } = calculateCurrentStage(timeline, stages);

      // Cho phép ký báo cáo sau khi voting đã completed (từ stage result trở đi)
      const canSignReport = stages.voting === 'COMPLETED' ||
                            (currentStage === 'result' && stageStatus === 'STARTED') ||
                            (currentStage === 'closing' && stageStatus === 'STARTED') ||
                            (currentStage === 'completed' && stageStatus === 'COMPLETED');

      setCanSign(canSignReport);

      let message = '';
      if (!canSignReport) {
        if (currentStage === 'not_started' || currentStage === 'checkin' || currentStage === 'report') {
          message = 'Vui lòng đợi đến sau khi kết thúc giai đoạn bỏ phiếu mới có thể ký báo cáo.';
        } else if (currentStage === 'voting' && stageStatus === 'STARTED') {
          message = 'Giai đoạn bỏ phiếu đang diễn ra. Vui lòng đợi đến sau khi kết thúc giai đoạn bỏ phiếu.';
        } else {
          message = 'Chưa đến thời điểm có thể ký báo cáo kiểm soát.';
        }
      }

      setStageInfo({
        currentStage,
        stageStatus,
        message
      });
    } catch (error: any) {
      console.error("Error checking signature stage:", error);
      setCanSign(false);
      setStageInfo({
        currentStage: 'error',
        stageStatus: 'ERROR',
        message: 'Không thể kiểm tra trạng thái giai đoạn.'
      });
    }
  };

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
    checkSignatureStage();
  }, []);

  // Setup socket listener để nhận cập nhật realtime
  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected for report signature:", socket.id);
      socket.emit("join", electionId);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Lắng nghe cập nhật trạng thái giai đoạn
    socket.on("transferData", (data: any) => {
      if (data.type === "stage-started" || data.type === "stage-ended") {
        console.log("📊 Received stage update:", data);
        checkSignatureStage();
      }
    });

    // Lắng nghe socket transferStateDataRT khi trạng thái cuộc họp thay đổi
    socket.on("transferStateDataRT", (data: any) => {
      if (data.type === "meeting-status-changed" && data.payload) {
        console.log("📊 Received meeting status update:", data);

        const payload = data.payload;
        if (payload.election) {
          const election = payload.election;
          const timeline = election.timeline || {};
          const stages = election.stages || {};
          const { currentStage, stageStatus } = calculateCurrentStage(timeline, stages);

          // Cho phép ký báo cáo sau khi voting đã completed
          const canSignReport = stages.voting === 'COMPLETED' ||
                                (currentStage === 'result' && stageStatus === 'STARTED') ||
                                (currentStage === 'closing' && stageStatus === 'STARTED') ||
                                (currentStage === 'completed' && stageStatus === 'COMPLETED');

          setCanSign(canSignReport);

          let message = '';
          if (!canSignReport) {
            if (currentStage === 'not_started' || currentStage === 'checkin' || currentStage === 'report') {
              message = 'Vui lòng đợi đến sau khi kết thúc giai đoạn bỏ phiếu mới có thể ký báo cáo.';
            } else if (currentStage === 'voting' && stageStatus === 'STARTED') {
              message = 'Giai đoạn bỏ phiếu đang diễn ra. Vui lòng đợi đến sau khi kết thúc giai đoạn bỏ phiếu.';
            } else {
              message = 'Chưa đến thời điểm có thể ký báo cáo kiểm soát.';
            }
          }

          setStageInfo({
            currentStage,
            stageStatus,
            message
          });
        }
      }
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected for report signature");
    };
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

          {/* Hiển thị thông báo khi chưa đến stage */}
          {stageInfo && !canSign && stageInfo.message && (
            <Alert
              message="Chưa thể ký báo cáo"
              description={stageInfo.message}
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <ReportSignature
              info={signatureInfo}
              onConfirm={handleSignReport}
              loading={signing}
              canSign={canSign}
          />
        </div>
      </>
  );
}
