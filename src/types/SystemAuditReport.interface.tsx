export interface ReportInfo {
  id: string;
  createdDate: string;
  reportPeriod: string;
  status: string;
}

export interface ReportSummaryCard {
  title: string;
  value: string | number;
  color?: string;
  highlight?: boolean;
}

export interface ReportLogItem {
  time: string;
  user: string;
  action: string;
  details: string;
}

export interface SignatureInfo {
  signerName: string;
  signerRole: string;
  isConfirmed: boolean;
}
