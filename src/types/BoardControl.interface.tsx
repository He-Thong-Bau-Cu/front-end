import { SummaryData } from "./VottingProcess.interface";
import {
  CandidateResult,
  VoteLogItem,
  VoteSummaryCard,
  VerificationDetailData,
} from "./ElectionVerification.interface";
import {
  ReportInfo,
  ReportLogItem,
  ReportSummaryCard,
  SignatureInfo,
} from "./SystemAuditReport.interface";

export interface BoardVotingOverview {
  election: {
    id: string;
    title: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  };
  timer: {
    timeLeftSeconds: number;
    endDate?: string;
  };
  summary: SummaryData;
  ballots: {
    total: number;
    cast: number;
    invalid: number;
  };
}

export interface BoardVerificationPayload {
  election: {
    id: string;
    title: string;
  };
  candidates: CandidateResult[];
  summaryCards: VoteSummaryCard[];
  verification: VerificationDetailData & { isConfirmed: boolean };
  logs: VoteLogItem[];
  report: {
    status: string;
  };
}

export interface BoardAuditReportPayload {
  info: ReportInfo;
  summaryCards: ReportSummaryCard[];
  logs: ReportLogItem[];
  signature: SignatureInfo;
}

