// ===============================
// 📘 INTERFACE: Election Verification
// ===============================

export interface CandidateResult {
  id: string;
  name: number;       // Số phiếu
  percent: number;
  votes: number;  // Tỷ lệ %
}

export interface VoteSummaryCard {
  title: string;       // Tên chỉ số (VD: Tỷ lệ tham gia)
  value: string;       // Giá trị hiển thị (VD: 94.0%)
  highlight?: boolean; // Nếu true -> in xanh đậm
}

export interface VoteLogItem {
  id: string;          // Mã phiếu
  time: string;        // Thời gian ghi nhận
  status: string;      // Trạng thái (Hợp lệ / Không hợp lệ)
}

export interface VerificationInfo {
  totalCheckin: number;
  totalVotes: number;
  dataChecksumBefore: string;
  dataChecksumAfter: string;
  isValid: boolean;
}

export interface SignatureState {
  isConfirmed: boolean;  // Đã tick xác nhận
}

export interface VerificationDetailData {
  totalCheckin: number;
  totalVotes: number;
  isDataValid: boolean;
  checksumBefore: string;
  checksumAfter: string;
}

export interface VoteVerificationProps {
  verification: VerificationDetailData;
  logs: VoteLogItem[];
}