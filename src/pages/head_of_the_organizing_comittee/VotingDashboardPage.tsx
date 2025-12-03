import React, { useEffect, useState, useCallback, useRef } from "react";
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
  // Lưu thông tin để tính toán lại thời gian còn lại
  const votingStartTimeRef = useRef<number | null>(null);
  const voteDurationSecondsRef = useRef<number>(0);
  // Sử dụng votingEndTimeRef làm nguồn truth cho countdown (vừa có thể là end dự kiến khi timeline đã bắt đầu,
  // vừa có thể là end của countdown bắt đầu từ client trước khi timeline.votingAt)
  const votingEndTimeRef = useRef<number | null>(null);
  // state để trigger/use trong effect (ref không trigger re-render)
  const [votingEndAt, setVotingEndAt] = useState<number | null>(null);

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

  // helper: chuẩn hoá config value -> minutes (1..1440)
  const normalizeVoteDurationMinutes = (configValue: any, defaultMinutes = 30): number => {
    if (configValue == null) return defaultMinutes;

    let rawNumber: number | null = null;

    if (typeof configValue === 'number') {
      rawNumber = configValue;
    } else if (typeof configValue === 'string') {
      const p = parseFloat(configValue);
      rawNumber = isNaN(p) ? null : p;
    } else if (typeof configValue === 'object' && configValue !== null) {
      if (typeof configValue.value === 'number') rawNumber = configValue.value;
      else if (typeof configValue.minutes === 'number') rawNumber = configValue.minutes;
      else if (typeof configValue.amount === 'number') rawNumber = configValue.amount;
      else if (typeof configValue.total === 'number') rawNumber = configValue.total;
      else {
        const first = Object.values(configValue)[0];
        if (typeof first === 'number') rawNumber = first;
        else if (typeof first === 'string') {
          const p = parseFloat(first as string);
          rawNumber = isNaN(p) ? null : p;
        }
      }
    }

    if (rawNumber == null) return defaultMinutes;

    // Detect units robustly:
    // - If value is very large (> 86400) assume milliseconds -> convert to minutes
    // - Else if value between 1000 and 86400 assume seconds -> convert to minutes
    // - Else treat as minutes
    if (rawNumber > 86400) {
      // milliseconds -> minutes
      rawNumber = rawNumber / 60000;
    } else if (rawNumber >= 1000 && rawNumber <= 86400) {
      // seconds -> minutes
      rawNumber = rawNumber / 60;
    }

    const minutes = Math.max(1, Math.min(Math.round(rawNumber), 1440));
    return minutes;
  };

  // Hàm tính toán thời gian còn lại từ thời gian thực
  const calculateTimeRemaining = useCallback((): number => {
    if (isVotingCompleted || !votingEndTimeRef.current) return 0;
    const now = Date.now();
    const timeRemainingMs = votingEndTimeRef.current - now;
    if (timeRemainingMs > 0) return Math.floor(timeRemainingMs / 1000);
    return 0;
  }, [isVotingCompleted]);

  const loadData = async () => {
    try {
      setLoading(true);
      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        message.warning("Vui lòng chọn cuộc bầu cử từ trang chủ");
        return;
      }

      const eventStatsResponse = await MeetingService.getEventManagementStats(electionId);
      const eventStats = eventStatsResponse?.data || eventStatsResponse;
      const election = eventStats?.election || {};
      const timeline = election.timeline || {};
      const stages = election.stages || {};

      const votingCompleted = stages.voting === 'COMPLETED';
      setIsVotingCompleted(votingCompleted);
      if (votingCompleted) {
        setAutoEndTriggered(false);
      }

      let seconds = 0;
      if (!votingCompleted && timeline.votingAt) {
        try {
          const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
          const config: any = configResponse?.data || configResponse;
          const configValue = (config?.data?.configValue !== undefined)
            ? config.data.configValue
            : config?.configValue;
          const voteDurationMinutes = normalizeVoteDurationMinutes(configValue, 30);
          const voteDurationSeconds = voteDurationMinutes * 60;

          if (voteDurationSeconds > 0) {
            const votingStartTime = new Date(timeline.votingAt).getTime();
            votingStartTimeRef.current = votingStartTime;
            voteDurationSecondsRef.current = voteDurationSeconds;

            const votingEndFromTimeline = votingStartTime + (voteDurationSeconds * 1000);
            const now = Date.now();
            const storageKey = `voting_end_time_${electionId || 'global'}`;

            if (votingStartTime > now) {
              let storedEnd: number | null = null;
              try {
                const raw = sessionStorage.getItem(storageKey);
                storedEnd = raw ? Number(raw) : null;
                if (storedEnd && isNaN(storedEnd)) storedEnd = null;
              } catch (e) {
                storedEnd = null;
              }

              if (storedEnd && storedEnd > now) {
                votingEndTimeRef.current = storedEnd;
                setVotingEndAt(storedEnd);
                seconds = Math.floor((storedEnd - now) / 1000);
              } else {
                const end = now + (voteDurationSeconds * 1000);
                votingEndTimeRef.current = end;
                setVotingEndAt(end);
                try { sessionStorage.setItem(storageKey, String(end)); } catch {}
                seconds = voteDurationSeconds;
              }
            } else {
              votingEndTimeRef.current = votingEndFromTimeline;
              setVotingEndAt(votingEndFromTimeline);
              try { sessionStorage.removeItem(storageKey); } catch {}
              if (votingEndFromTimeline > now) {
                seconds = Math.floor((votingEndFromTimeline - now) / 1000);
              } else {
                seconds = 0;
              }
            }
          } else {
            votingStartTimeRef.current = null;
            voteDurationSecondsRef.current = 0;
            votingEndTimeRef.current = null;
            setVotingEndAt(null);
            try { sessionStorage.removeItem(`voting_end_time_${electionId || 'global'}`); } catch {}
          }
        } catch (error: any) {
          if (election.endDate) {
            const endTime = new Date(election.endDate).getTime();
            const now = new Date().getTime();
            if (endTime > now) {
              seconds = Math.floor((endTime - now) / 1000);
            }
          }
        }
      } else {
        votingStartTimeRef.current = null;
        voteDurationSecondsRef.current = 0;
        votingEndTimeRef.current = null;
        setVotingEndAt(null);
        try { sessionStorage.removeItem(`voting_end_time_${localStorage.getItem("currentElectionId") || 'global'}`); } catch {}
      }

      const overviewResponse: any = await BoardControlService.getVotingOverview(electionId);
      const overview = overviewResponse?.data || overviewResponse;

      if (overview) {
        const summary = overview.summary || overview;
        setStats({
          percent: summary?.percent || 0,
          voted: summary?.voted || 0,
          total: summary?.total || 0,
          validVotes: summary?.validVotes || 0,
          speed: summary?.speed || 0,
        });

        if (!votingCompleted) {
          setTimeLeftSeconds(seconds);
          setTimeLeft(formatSecondsToClock(seconds));
        } else {
          setTimeLeftSeconds(0);
          setTimeLeft("00:00:00");
          votingEndTimeRef.current = null;
          setVotingEndAt(null);
          try { sessionStorage.removeItem(`voting_end_time_${localStorage.getItem("currentElectionId") || 'global'}`); } catch {}
        }
      }

      try {
        const resultsResponse = await ResultService.getByElectionId(electionId);
        const resultsData = resultsResponse?.data || resultsResponse || [];
        const resultsList = Array.isArray(resultsData) ? resultsData : [];

        const totalVotes = resultsList.reduce((sum: number, item: any) => sum + (item.votesCount || 0), 0);

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
        const ballotsResponse: any = await BallotService.getAllBallotsByElectionId(electionId);
        // Xử lý cả 2 trường hợp: ballotsResponse có thể là Ballot[] hoặc BaseResponse<Ballot[]>
        const ballotsData = Array.isArray(ballotsResponse)
            ? ballotsResponse
            : (ballotsResponse?.data || ballotsResponse || []);
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
        const config: any = configResponse?.data || configResponse;
        // Xử lý cả 2 trường hợp: config có thể là SystemConfig hoặc BaseResponse<SystemConfig>
        const configValue = (config?.data?.configValue !== undefined)
            ? config.data.configValue
            : config?.configValue;
        const timeVoteElection = (typeof configValue === 'object' && configValue?.value !== undefined)
            ? configValue.value
            : (typeof configValue === 'number' ? configValue : 0);
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

  // Timer đếm ngược mỗi giây - tính lại từ thời gian thực
  useEffect(() => {
    // Nếu không có end time, hiển thị 00:00:00
    if (isVotingCompleted || !votingEndAt) {
      if (timeLeftSeconds <= 0) setTimeLeft("00:00:00");
      return;
    }

    // Tính toán lại thời gian còn lại từ votingEndTimeRef mỗi giây
    const updateTimer = () => {
      const seconds = calculateTimeRemaining();
      if (seconds > 0) {
        setTimeLeftSeconds(seconds);
        setTimeLeft(formatSecondsToClock(seconds));
      } else {
        setTimeLeftSeconds(0);
        setTimeLeft("00:00:00");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    const handleVisibilityChange = () => {
      if (!document.hidden) updateTimer();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isVotingCompleted, calculateTimeRemaining, votingEndAt]);

  if (loading) {
    return (
      <div className="vd-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="vd-page">
      <Row gutter={[24, 24]} align="stretch">
        {/* LEFT SIDE - Main Content */}
        <Col xs={24} lg={15}>
          <div className="vd-left-column">
            <LiveResult candidates={candidates} />
            <LiveVoteFlow logs={voteLogs} />
          </div>
        </Col>

        {/* RIGHT SIDE - Controls & Stats */}
        <Col xs={24} lg={9}>
          <div className="vd-right-column">
            <CountdownControl
              timeLeft={timeLeft}
              onRefresh={loadData}
              isVotingCompleted={isVotingCompleted}
            />
            <SummaryStats stats={stats} />
          </div>
        </Col>
      </Row>
    </div>
  );
}
