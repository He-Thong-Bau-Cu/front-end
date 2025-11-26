import React, { useEffect, useState } from "react";
import { Row, Col, Spin, message } from "antd";
import LiveResult from "../../components/head_of_the_organizing_committee/voting_process/LiveResult";
import LiveVoteFlow from "../../components/head_of_the_organizing_committee/voting_process/LiveVoteFlow";
import CountdownControl from "../../components/head_of_the_organizing_committee/voting_process/CountdownControl";
import SummaryStats from "../../components/head_of_the_organizing_committee/voting_process/SummaryStats";
import {
  Candidate,
  VoteLog,
  SummaryData,
} from "../../types/VottingProcess.interface";
import BoardControlService from "@/services/BoardControlService";
import ResultService from "@/services/ResultService";
import BallotService from "@/services/BallotService";
import MeetingService from "@/services/MeetingService";
import SystemConfigService from "@/services/SystemConfigService";
import ElectionService from "@/services/ElectionService";
import "../../style/head-of-the-organizing-committee/VotingDashboard.model.css";

export default function VotingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteLogs, setVoteLogs] = useState<VoteLog[]>([]);
  const [stats, setStats] = useState<SummaryData>({
    percent: 0,
    voted: 0,
    total: 0,
    validVotes: 0,
    speed: 0,
  });
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isVotingCompleted, setIsVotingCompleted] = useState<boolean>(false);
  const [autoEndTriggered, setAutoEndTriggered] = useState<boolean>(false);

  const formatSecondsToClock = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        message.warning("Vui lòng chọn cuộc bầu cử từ trang chủ");
        return;
      }

      // Lấy election data với timeline và stages
      const eventStatsResponse = await MeetingService.getEventManagementStats(electionId);
      const eventStats = eventStatsResponse?.data || eventStatsResponse;
      const election = eventStats?.election || {};
      const timeline = election.timeline || {};
      const stages = election.stages || {};

      // Kiểm tra trạng thái voting stage
      const votingCompleted = stages.voting === 'COMPLETED';
      setIsVotingCompleted(votingCompleted);
      // Reset autoEndTriggered khi reload data
      if (votingCompleted) {
        setAutoEndTriggered(false);
      }

      // Tính thời gian còn lại dựa trên TIME_VOTE_ELECTION config
      let seconds = 0;
      if (!votingCompleted && timeline.votingAt) {
        try {
          // Lấy config TIME_VOTE_ELECTION (thời gian bầu cử tính bằng phút)
          const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
          const config = configResponse?.data || configResponse;
          const timeVoteElection = config?.configValue?.value || config?.configValue || 0; // Có thể là số hoặc object có value
          const voteDurationMinutes = typeof timeVoteElection === 'number' ? timeVoteElection : parseInt(timeVoteElection) || 0;
          const voteDurationSeconds = voteDurationMinutes * 60; // Chuyển đổi từ phút sang giây

          if (voteDurationSeconds > 0) {
            const votingStartTime = new Date(timeline.votingAt).getTime();
            const votingEndTime = votingStartTime + (voteDurationSeconds * 1000); // Thời gian kết thúc = thời gian bắt đầu + duration
            const now = new Date().getTime();

            // Tính thời gian còn lại từ now đến votingEndTime
            if (votingEndTime > now) {
              seconds = Math.floor((votingEndTime - now) / 1000);
            } else {
              seconds = 0;
            }
          }
        } catch (error: any) {
          console.error("Error loading TIME_VOTE_ELECTION config:", error);
          // Fallback: nếu không lấy được config, dùng logic cũ với endDate
          if (election.endDate) {
            const endTime = new Date(election.endDate).getTime();
            const now = new Date().getTime();
            if (endTime > now) {
              seconds = Math.floor((endTime - now) / 1000);
            }
          }
        }
      }

      // Lấy voting overview
      const overviewResponse = await BoardControlService.getVotingOverview(electionId);
      const overview = overviewResponse?.data || overviewResponse;

      if (overview) {
        // Cập nhật stats
        setStats({
          percent: overview.summary?.percent || 0,
          voted: overview.summary?.voted || 0,
          total: overview.summary?.total || 0,
          validVotes: overview.summary?.validVotes || 0,
          speed: overview.summary?.speed || 0,
        });

        // Cập nhật timer (chỉ nếu chưa completed)
        if (!votingCompleted) {
          setTimeLeftSeconds(seconds);
          setTimeLeft(formatSecondsToClock(seconds));
        } else {
          setTimeLeftSeconds(0);
          setTimeLeft("00:00:00");
        }
      }

      // Lấy kết quả bầu cử (candidates)
      try {
        const resultsResponse = await ResultService.getByElectionId(electionId);
        const resultsData = resultsResponse?.data || resultsResponse || [];
        const resultsList = Array.isArray(resultsData) ? resultsData : [];

        // Tính tổng votes để tính phần trăm
        const totalVotes = resultsList.reduce((sum: number, item: any) => sum + (item.votesCount || 0), 0);

        // Map results thành candidates
        const candidatesList: Candidate[] = resultsList
          .map((item: any, index: number) => {
            const entity = item?.entityId || {};
            const votes = item?.votesCount || 0;
            const percent = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(2)) : 0;

            return {
              id: index + 1,
              name: entity?.title || `Ứng viên ${index + 1}`,
              votes: votes,
              percent: percent,
            };
          })
          .sort((a, b) => b.votes - a.votes); // Sắp xếp theo số phiếu giảm dần

        setCandidates(candidatesList);
      } catch (error: any) {
        console.error("Error loading results:", error);
        // Nếu không có results, có thể thử lấy từ cumulative hoặc yes/no
      }

      // Lấy danh sách ballots đã cast để tạo vote logs
      try {
        const ballotsResponse = await BallotService.getAllBallotsByElectionId(electionId);
        const ballotsData = ballotsResponse?.data || ballotsResponse || [];
        const ballotsList = Array.isArray(ballotsData) ? ballotsData : [];

        // Filter chỉ lấy ballots đã cast và có castAt
        const castBallots = ballotsList
          .filter((ballot: any) => ballot.status === "CAST" && ballot.castAt)
          .sort((a: any, b: any) => {
            const timeA = new Date(a.castAt).getTime();
            const timeB = new Date(b.castAt).getTime();
            return timeB - timeA; // Mới nhất trước
          })
          .slice(0, 20); // Lấy 20 mục gần nhất

        // Map thành vote logs
        const logs: VoteLog[] = castBallots.map((ballot: any, index: number) => {
          const castTime = ballot.castAt ? new Date(ballot.castAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) : "";

          return {
            id: index + 1,
            message: "Một phiếu bầu mới vừa được ghi nhận.",
            time: castTime,
          };
        });

        setVoteLogs(logs);
      } catch (error: any) {
        console.error("Error loading vote logs:", error);
      }
    } catch (error: any) {
      console.error("Error loading voting dashboard:", error);
      message.error(error?.response?.data?.message || "Không thể tải dữ liệu bảng theo dõi bầu cử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tự động kết thúc giai đoạn bỏ phiếu khi hết thời gian
  useEffect(() => {
    const autoEndVoting = async () => {
      if (isVotingCompleted || autoEndTriggered || timeLeftSeconds > 0) {
        return;
      }

      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        return;
      }

      // Kiểm tra xem voting stage có thực sự đã bắt đầu chưa
      // Lấy lại election data để kiểm tra timeline.votingAt
      try {
        const eventStatsResponse = await MeetingService.getEventManagementStats(electionId);
        const eventStats = eventStatsResponse?.data || eventStatsResponse;
        const election = eventStats?.election || {};
        const timeline = election.timeline || {};

        if (!timeline.votingAt) {
          // Chưa bắt đầu voting stage, không tự động kết thúc
          console.log("Voting stage chưa bắt đầu, không tự động kết thúc");
          return;
        }

        // Chỉ tự động kết thúc nếu thời gian đã thực sự hết (đợi ít nhất 2 giây sau khi bắt đầu để tránh race condition)
        const votingStartTime = new Date(timeline.votingAt).getTime();
        const now = new Date().getTime();
        const timeSinceStart = (now - votingStartTime) / 1000; // seconds

        // Nếu mới bắt đầu (< 2 giây), không tự động kết thúc (có thể do tính toán sai)
        if (timeSinceStart < 2) {
          console.warn("Voting just started, skipping auto-end to avoid race condition");
          return;
        }

        // Lấy lại config để tính toán lại thời gian còn lại
        const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
        const config = configResponse?.data || configResponse;
        const timeVoteElection = config?.configValue?.value || config?.configValue || 0;
        const voteDurationMinutes = typeof timeVoteElection === 'number' ? timeVoteElection : parseInt(String(timeVoteElection)) || 0;
        const voteDurationSeconds = voteDurationMinutes * 60;

        if (voteDurationSeconds > 0) {
          const votingEndTime = votingStartTime + (voteDurationSeconds * 1000);
          const timeRemaining = votingEndTime - now;

          // Nếu vẫn còn thời gian (> 5 giây), không tự động kết thúc
          if (timeRemaining > 5000) {
            console.log("Vẫn còn thời gian, không tự động kết thúc");
            return;
          }
        }

        try {
          setAutoEndTriggered(true);
          await ElectionService.endStage(electionId, 'voting');
          message.success("Thời gian bỏ phiếu đã hết. Giai đoạn bỏ phiếu đã được tự động kết thúc.");
          setIsVotingCompleted(true);
          setTimeLeft("00:00:00");
          setTimeLeftSeconds(0);
          // Reload data để cập nhật trạng thái
          loadData();
        } catch (error: any) {
          console.error("Error auto-ending voting stage:", error);
          message.error(error?.response?.data?.message || "Không thể tự động kết thúc giai đoạn bỏ phiếu");
          setAutoEndTriggered(false); // Reset để có thể thử lại
        }
      } catch (error: any) {
        console.error("Error checking voting status:", error);
        // Không tự động kết thúc nếu có lỗi khi kiểm tra
      }
    };

    // Chỉ tự động kết thúc nếu đã load data xong và thời gian = 0
    if (timeLeftSeconds === 0 && !isVotingCompleted && !autoEndTriggered && !loading) {
      // Delay một chút để đảm bảo data đã load xong
      const timeoutId = setTimeout(() => {
        autoEndVoting();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftSeconds, isVotingCompleted, autoEndTriggered, loading]);

  // Timer đếm ngược mỗi giây (chỉ chạy khi voting chưa completed)
  useEffect(() => {
    if (isVotingCompleted || timeLeftSeconds <= 0) {
      if (timeLeftSeconds <= 0) {
        setTimeLeft("00:00:00");
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 0) {
          return 0;
        }
        const newSeconds = prev - 1;
        setTimeLeft(formatSecondsToClock(newSeconds));
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeftSeconds, isVotingCompleted]);

  if (loading) {
    return (
      <div className="vd-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="vd-page">
      <Row gutter={[20, 20]}>
        {/* LEFT */}
        <Col xs={24} lg={16}>
          <LiveResult candidates={candidates} />
          <LiveVoteFlow logs={voteLogs} />
        </Col>

        {/* RIGHT */}
        <Col xs={24} lg={8}>
          <CountdownControl
            timeLeft={timeLeft}
            onRefresh={loadData}
            isVotingCompleted={isVotingCompleted}
          />
          <SummaryStats stats={stats} />
        </Col>
      </Row>
    </div>
  );
}
