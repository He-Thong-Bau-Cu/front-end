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
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/socket";

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
  if (rawNumber > 86400) {
    rawNumber = rawNumber / 60000;
  } else if (rawNumber >= 1000 && rawNumber <= 86400) {
    rawNumber = rawNumber / 60;
  }

  const minutes = Math.max(1, Math.min(Math.round(rawNumber), 1440));
  return minutes;
};

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
  const votingStartTimeRef = useRef<number | null>(null);
  const voteDurationSecondsRef = useRef<number>(0);
  const votingEndTimeRef = useRef<number | null>(null);
  const [votingEndAt, setVotingEndAt] = useState<number | null>(null);

  const calculateTimeRemaining = useCallback((): number => {
    if (isVotingCompleted || !votingEndTimeRef.current) return 0;
    const now = Date.now();
    const timeRemainingMs = votingEndTimeRef.current - now;
    if (timeRemainingMs > 0) return Math.floor(timeRemainingMs / 1000);
    return 0;
  }, [isVotingCompleted]);

  const loadData = useCallback(async () => {
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
      }

      try {
        const ballotsResponse: any = await BallotService.getAllBallotsByElectionId(electionId);
        const ballotsData = Array.isArray(ballotsResponse)
            ? ballotsResponse
            : (ballotsResponse?.data || ballotsResponse || []);
        const ballotsList = Array.isArray(ballotsData) ? ballotsData : [];

        const castBallots = ballotsList
          .filter((ballot: any) => ballot.status === "CAST" && ballot.castAt)
          .sort((a: any, b: any) => {
            const timeA = new Date(a.castAt).getTime();
            const timeB = new Date(b.castAt).getTime();
            return timeB - timeA; // Mới nhất trước
          })
          .slice(0, 20); // Lấy 20 mục gần nhất

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
  }, [calculateTimeRemaining]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.on("connect", () => socket.emit("join", electionId));

    const handleRealtime = (data: any) => {
      console.log("[SOCKET transferData]", data);
      if (data.type === "ballot-cast" || data.type === "stage-started" || data.type === "stage-ended") {
        loadData();
      }
    };

    socket.on("transferData", handleRealtime);
    socket.on("transferStateDataRT", (data: any) => {
      console.log("[SOCKET transferStateDataRT]", data);
      if (data.type === "meeting-status-changed") {
        loadData();
      }
    });

    return () => {
      socket.off("transferData", handleRealtime);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const autoEndVoting = async () => {
      if (isVotingCompleted || autoEndTriggered || timeLeftSeconds > 0) {
        return;
      }

      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        return;
      }

      try {
        const eventStatsResponse = await MeetingService.getEventManagementStats(electionId);
        const eventStats = eventStatsResponse?.data || eventStatsResponse;
        const election = eventStats?.election || {};
        const timeline = election.timeline || {};

        if (!timeline.votingAt) {
          console.log("Voting stage chưa bắt đầu, không tự động kết thúc");
          return;
        }

        const votingStartTime = new Date(timeline.votingAt).getTime();
        const now = new Date().getTime();
        const timeSinceStart = (now - votingStartTime) / 1000; // seconds

        if (timeSinceStart < 2) {
          console.warn("Voting just started, skipping auto-end to avoid race condition");
          return;
        }

        const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
        const config: any = configResponse?.data || configResponse;
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
          loadData();
        } catch (error: any) {
          console.error("Error auto-ending voting stage:", error);
          message.error(error?.response?.data?.message || "Không thể tự động kết thúc giai đoạn bỏ phiếu");
          setAutoEndTriggered(false);
        }
      } catch (error: any) {
        console.error("Error checking voting status:", error);
      }
    };

    if (timeLeftSeconds === 0 && !isVotingCompleted && !autoEndTriggered && !loading) {
      const timeoutId = setTimeout(() => {
        autoEndVoting();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [timeLeftSeconds, isVotingCompleted, autoEndTriggered, loading]);

  useEffect(() => {
    if (isVotingCompleted || !votingEndAt) {
      if (timeLeftSeconds <= 0) setTimeLeft("00:00:00");
      return;
    }

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
