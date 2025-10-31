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
  type: string;
  event: string;
  date: string;
  signer: string;
}

export interface ReportArchiveSummary {
  total: number;
  results: ReportArchiveItem[];
}
