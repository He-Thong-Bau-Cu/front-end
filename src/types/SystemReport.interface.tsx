export type ReportInterval = "day" | "week" | "month";

export interface SystemReportSummary {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
}

export interface SystemReportTimelinePoint {
  label: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

export interface SystemReportEndpointStat {
  endpoint: string;
  method: string;
  requests: number;
  avgResponseTime: number;
  errorRate: number;
}

export interface SystemReportAuditActivity {
  module: string;
  action: string;
  user?: string | null;
  at: string;
}

export interface SystemReportAuditSummary {
  totalAudits: number;
  topModules: { module: string; count: number }[];
  latestActivities: SystemReportAuditActivity[];
}

export interface SystemReportBackupSummary {
  totalBackups: number;
  actions: Record<string, number>;
  lastBackupAt: string | null;
}

export interface SystemReportOverview {
  range: {
    fromDate: string;
    toDate: string;
  };
  summary: SystemReportSummary;
  timeline: SystemReportTimelinePoint[];
  topEndpoints: SystemReportEndpointStat[];
  auditSummary: SystemReportAuditSummary;
  backupSummary: SystemReportBackupSummary;
}

export interface SystemReportQuery {
  fromDate?: string;
  toDate?: string;
  interval?: ReportInterval;
}

export interface SystemReportExportQuery extends SystemReportQuery {
  format?: "json" | "csv";
}

