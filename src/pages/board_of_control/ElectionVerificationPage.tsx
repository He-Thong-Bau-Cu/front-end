import React, { useEffect, useState } from "react";
import { Button, Space } from "antd";
import {
  DownloadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

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
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";

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

  useEffect(() => {
    const loadVerification = async () => {
      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
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

    loadVerification();
  }, []);

  const handleApprove = async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }
    try {
      setApproving(true);
      const response = await BoardControlService.approveVerification(electionId);
      if (response.success) {
        notify(response.message || "Đã xác nhận kết quả", "success");
        setVerification((prev) => ({
          ...prev,
          isConfirmed: true,
        }));
      } else {
        notify(response.message || "Không thể xác nhận", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể xác nhận kết quả", "error");
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      <div className="ev-topbar">
        <Space>
          <Button icon={<DownloadOutlined />}>Tải xuống</Button>
          <Button danger icon={<CloseCircleOutlined />}>
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
        <VoteVerificationDetail
          verification={verification}
          logs={logs}
          initialConfirmed={verification.isConfirmed}
          onApprove={handleApprove}
          approving={approving}
        />
      </div>
    </>
  );
}
