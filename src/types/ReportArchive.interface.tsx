export interface ReportArchiveFilter {
  keyword: string;
  startDate?: string;
  endDate?: string;
  type: string;
  event: string;
}

export interface ReportArchiveItem {
  id: string;
  name: string;
  type: string; // Loại đã map sang tiếng Việt
  originalType: string; // Loại gốc từ API (NORMAL, ABNORMAL, FINAL, etc.)
  event: string;
  date: string;
  signer: string;
  // Thêm các field chi tiết
  description?: string;
  summary?: string;
  fileUrl?: string;
  status?: string;
  severity?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  createdBy?: {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    position?: string;
  };
  electionId?: {
    _id: string;
    title?: string;
    decisionNumber?: string;
    decisionName?: string;
    status?: string;
    statusData?: string;
  };
}

export interface ReportArchiveSummary {
  total: number;
  results: ReportArchiveItem[];
}
