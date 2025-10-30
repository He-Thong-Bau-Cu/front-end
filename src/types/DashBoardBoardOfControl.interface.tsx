/** Thông tin người dùng trong header */
export interface BKSUserInfo {
  name: string;
  role: string;
  department: string;
}

/** Dữ liệu từng yêu cầu ký số */
export interface SignatureRequest {
  title: string;
  time: string;
  type: string;
}

/** Dữ liệu cho phần báo cáo giám sát trực tiếp */
export interface LiveMonitor {
  title: string;
  participationRate: number;
  totalVotes: number;
  remainingTime: string;
  isLive: boolean;
}

/** Dữ liệu cho phần kho báo cáo */
export interface ReportStorageFilter {
  search: string;
  category: string;
}

/** Dữ liệu cho phần nhật ký ký số */
export interface SignatureLog {
  content: string;
  time: string;
}
