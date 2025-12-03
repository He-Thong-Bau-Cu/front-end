import React, { useEffect, useState } from "react";
import { Button, Space, message, Alert } from "antd";
import {
  DownloadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { SOCKET_URL } from "@/config/socket";

import VoteResultChart from "../../components/board_of_control/verify_result/VoteResultChart";
import VoteSummary from "../../components/board_of_control/verify_result/VoteSummary";
import VoteVerificationDetail from "../../components/board_of_control/verify_result/VoteVerificationDetail";
import {
  CandidateResult,
  VoteSummaryCard,
  VerificationDetailData,
  VoteLogItem,
} from "../../types/ElectionVerification.interface";

import "../../style/board-of-control/ElectionVerification.model.css";
import BoardControlService from "@/services/BoardControlService";
import ElectionService from "@/services/ElectionService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import ResultService from "@/services/ResultService";
import DigitalSignModal from "../digitalSignature/DigitalSignModal";

const defaultVerification: VerificationDetailData & { isDataValid: boolean; isConfirmed?: boolean } =
{
  totalCheckin: 0,
  totalVotes: 0,
  isDataValid: true,
  checksumBefore: "--",
  checksumAfter: "--",
};

export default function ElectionVerificationPage() {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [summaryCards, setSummaryCards] = useState<VoteSummaryCard[]>([]);
  const [verification, setVerification] = useState(defaultVerification);
  const [logs, setLogs] = useState<VoteLogItem[]>([]);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [approving, setApproving] = useState(false);
  const [canSign, setCanSign] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [stageInfo, setStageInfo] = useState<{
    currentStage: string;
    stageStatus: string;
    message: string;
  } | null>(null);
  const [signModalOpen, setSignModalOpen] = useState(false);


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

  // Kiểm tra trạng thái stage để cho phép ký
  const checkSignatureStage = async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      setCanSign(false);
      setStageInfo({
        currentStage: 'unknown',
        stageStatus: 'NOT_STARTED',
        message: 'Không tìm thấy cuộc bầu cử hiện tại'
      });
      return { currentStage: 'unknown', stageStatus: 'NOT_STARTED', canLoadData: false };
    }

    try {
      const stageResponse = await ElectionService.getCurrentStage(electionId);
      const stageData = stageResponse?.data || stageResponse;

      const timeline = stageData?.timeline || {};
      const stages = stageData?.stages || {};
      const { currentStage, stageStatus } = calculateCurrentStage(timeline, stages);

      // Chỉ cho phép ký khi stage "result" đã STARTED
      const canSignResult = currentStage === 'result' && stageStatus === 'STARTED';
      // Cho phép load data khi stage là result hoặc completed
      const canLoadData = currentStage === 'result' || currentStage === 'completed';
      // Kiểm tra nếu đã completed
      const completed = currentStage === 'completed' || stages.result === 'COMPLETED';

      setCanSign(canSignResult);
      setIsCompleted(completed);

      let message = '';
      if (!canSignResult) {
        if (currentStage === 'not_started' || currentStage === 'checkin' || currentStage === 'report') {
          message = 'Vui lòng đợi đến giai đoạn công bố kết quả mới có thể ký xác nhận.';
        } else if (currentStage === 'voting') {
          message = 'Giai đoạn bỏ phiếu đang diễn ra. Vui lòng đợi đến giai đoạn công bố kết quả.';
        } else if (stages.result === 'COMPLETED' || currentStage === 'completed') {
          message = 'Giai đoạn công bố kết quả đã hoàn tất.';
        } else {
          message = 'Chưa đến giai đoạn công bố kết quả.';
        }
      }

      setStageInfo({
        currentStage,
        stageStatus,
        message
      });

      return { currentStage, stageStatus, canLoadData };
    } catch (error: any) {
      console.error("Error checking signature stage:", error);
      setCanSign(false);
      setStageInfo({
        currentStage: 'error',
        stageStatus: 'ERROR',
        message: 'Không thể kiểm tra trạng thái giai đoạn.'
      });
      return { currentStage: 'error', stageStatus: 'ERROR', canLoadData: false };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
        return;
      }

      // Kiểm tra stage trước, chỉ gọi API nếu stage là result hoặc completed
      const stageCheckResult = await checkSignatureStage();

      // Nếu chưa đến stage thì không gọi API
      if (!stageCheckResult.canLoadData) {
        return;
      }

      try {
        showLoading();
        const response = await BoardControlService.getVerification(electionId);
        if (response.success && response.data) {
          setCandidates(response.data.candidates || []);
          setSummaryCards(response.data.summaryCards || []);
          setVerification(response.data.verification || defaultVerification);
          setLogs(response.data.logs || []);
          setEventTitle(response.data.election?.title || "");
        } else {
          notify(response.message || "Không thể tải dữ liệu xác minh", "error");
        }
      } catch (error) {
        console.error(error);
        notify("Không thể tải dữ liệu xác minh", "error");
      } finally {
        hideLoading();
      }
    };

    loadData();
  }, []);

  // Setup socket listener để nhận cập nhật realtime
  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected for verification signature:", socket.id);
      socket.emit("join", electionId);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Lắng nghe cập nhật trạng thái giai đoạn
    socket.on("transferData", async (data: any) => {
      if (data.type === "stage-started" || data.type === "stage-ended") {
        console.log("📊 Received stage update:", data);
        const stageCheckResult = await checkSignatureStage();

        // Nếu stage đã đạt result/completed thì load data
        if (stageCheckResult.canLoadData) {
          const electionId = localStorage.getItem("currentElectionId");
          if (electionId) {
            try {
              const response = await BoardControlService.getVerification(electionId);
              if (response.success && response.data) {
                setCandidates(response.data.candidates || []);
                setSummaryCards(response.data.summaryCards || []);
                setVerification(response.data.verification || defaultVerification);
                setLogs(response.data.logs || []);
                setEventTitle(response.data.election?.title || "");
              }
            } catch (error) {
              console.error("Error loading verification data:", error);
            }
          }
        }
      }
    });

    // Lắng nghe socket transferStateDataRT khi trạng thái cuộc họp thay đổi
    socket.on("transferStateDataRT", async (data: any) => {
      if (data.type === "meeting-status-changed" && data.payload) {
        console.log("📊 Received meeting status update:", data);

        const payload = data.payload;
        if (payload.election) {
          const election = payload.election;
          const timeline = election.timeline || {};
          const stages = election.stages || {};
          const { currentStage, stageStatus } = calculateCurrentStage(timeline, stages);

          // Chỉ cho phép ký khi stage "result" đã STARTED
          const canSignResult = currentStage === 'result' && stageStatus === 'STARTED';
          const canLoadData = currentStage === 'result' || currentStage === 'completed';
          const completed = currentStage === 'completed' || stages.result === 'COMPLETED';

          setCanSign(canSignResult);
          setIsCompleted(completed);

          let message = '';
          if (!canSignResult) {
            if (currentStage === 'not_started' || currentStage === 'checkin' || currentStage === 'report') {
              message = 'Vui lòng đợi đến giai đoạn công bố kết quả mới có thể ký xác nhận.';
            } else if (currentStage === 'voting') {
              message = 'Giai đoạn bỏ phiếu đang diễn ra. Vui lòng đợi đến giai đoạn công bố kết quả.';
            } else if (stages.result === 'COMPLETED' || currentStage === 'completed') {
              message = 'Giai đoạn công bố kết quả đã hoàn tất.';
            } else {
              message = 'Chưa đến giai đoạn công bố kết quả.';
            }
          }

          setStageInfo({
            currentStage,
            stageStatus,
            message
          });

          // Load data nếu stage đã đạt result/completed
          if (canLoadData) {
            const electionId = localStorage.getItem("currentElectionId");
            if (electionId) {
              try {
                const response = await BoardControlService.getVerification(electionId);
                if (response.success && response.data) {
                  setCandidates(response.data.candidates || []);
                  setSummaryCards(response.data.summaryCards || []);
                  setVerification(response.data.verification || defaultVerification);
                  setLogs(response.data.logs || []);
                  setEventTitle(response.data.election?.title || "");
                }
              } catch (error) {
                console.error("Error loading verification data:", error);
              }
            }
          }
        }
      }
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected for verification signature");
    };
  }, []);
  const handleApprove = () => {
    setSignModalOpen(true);
  };


  const handleDigitalSign = async ({ file, password }) => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }

    try {
      showLoading();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      formData.append("electionId", electionId);

      const res = await ResultService.signElectionResult(formData);

      if (!res?.success) {
        notify("Ký số thất bại! Kiểm tra mật khẩu hoặc chứng thư số.", "error");
        return;
      }

      notify("Ký số & công bố kết quả thành công!", "success");

      setVerification((prev) => ({
        ...prev,
        isConfirmed: true,
      }));


      setSignModalOpen(false);

    } catch (err) {
      notify("Ký số thất bại!", "error");
    } finally {
      hideLoading();
    }
  };


  return (
    <>
      <div className="ev-topbar">
        <Space>
          <Button icon={<DownloadOutlined />} disabled={isCompleted}>Tải xuống</Button>
          <Button danger icon={<CloseCircleOutlined />} disabled={isCompleted}>
            Từ chối Kết quả
          </Button>
        </Space>
      </div>
      <div className="ev-page">
        <h2 className="ev-title">Xác minh Kết quả Bầu cử</h2>
        <p className="ev-subtitle">
          Sự kiện: {eventTitle || "Chưa có thông tin cuộc bầu cử"}
        </p>

        <VoteResultChart data={candidates} />
        <VoteSummary cards={summaryCards} />

        {/* Hiển thị thông báo khi chưa đến stage */}
        {stageInfo && !canSign && stageInfo.message && (
          <Alert
            message="Chưa thể ký xác nhận kết quả"
            description={stageInfo.message}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <VoteVerificationDetail
          verification={verification}
          logs={logs}
          initialConfirmed={verification.isConfirmed}
          onApprove={handleApprove}
          approving={approving}
          canSign={canSign && !isCompleted}
        />

        <DigitalSignModal
          open={signModalOpen}
          onClose={() => setSignModalOpen(false)}
          onSubmit={handleDigitalSign}
        />

      </div>
    </>
  );
}
