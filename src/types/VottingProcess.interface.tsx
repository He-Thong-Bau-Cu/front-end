// =======================
// VotingDashboard.interface.ts
// =======================

/** Ứng viên trong kết quả bầu cử */
export interface Candidate {
  id: number;
  name: string;
  votes: number;
  percent: number;
}

/** Bản ghi luồng bỏ phiếu trực tiếp */
export interface VoteLog {
  id: number;
  message: string;
  time: string;
}

/** Thống kê tổng quan cuộc bầu cử */
export interface SummaryData {
  percent: number;
  voted: number;
  total: number;
  validVotes: number;
  speed: number;
}

/** Props cho CountdownControl */
export interface CountdownProps {
  timeLeft: string; // định dạng "MM:SS"
}
