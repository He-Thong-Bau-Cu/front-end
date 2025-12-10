import BaseService from "./BaseService";
import type { BaseResponse } from "@/types/BaseResponse.interface";
import type {
  BoardAuditReportPayload,
  BoardVerificationPayload,
  BoardVotingOverview,
} from "@/types/BoardControl.interface";

class BoardControlService extends BaseService {
  constructor() {
    super("board-control");
  }

  async getVotingOverview(electionId: string): Promise<BaseResponse<BoardVotingOverview>> {
    return this.api.get(`${this.endpoint}/${electionId}/voting-overview`);
  }

  async getVerification(
    electionId: string
  ): Promise<BaseResponse<BoardVerificationPayload>> {
    return this.api.get(`${this.endpoint}/${electionId}/verification`);
  }

  async approveVerification(electionId: string): Promise<BaseResponse<any>> {
    return this.api.post(`${this.endpoint}/${electionId}/verification/approve`, {});
  }

  async getAuditReport(
    electionId: string
  ): Promise<BaseResponse<BoardAuditReportPayload>> {
    return this.api.get(`${this.endpoint}/${electionId}/audit-report`);
  }

  async rejectAuditReport(
    electionId: string,
    reason: string
  ): Promise<BaseResponse<any>> {
    return this.api.post(`${this.endpoint}/${electionId}/audit-report/reject`, { reason });
  }

  async rejectVerificationReport(
    electionId: string,
    reason: string
  ): Promise<BaseResponse<any>> {
    return this.api.post(`${this.endpoint}/${electionId}/verification/reject`, { reason });
  }

  async signAuditReport(electionId: string): Promise<BaseResponse<any>> {
    return this.api.post(`${this.endpoint}/${electionId}/audit-report/sign`, {});
  }

  async downloadAuditReport(electionId: string): Promise<Blob> {
    return this.api.get(
      `${this.endpoint}/${electionId}/audit-report/download`,
      { responseType: 'blob' }
    );
  }

  async downloadArchiveReport(electionId: string, reportId?: string): Promise<Blob> {
    const url = reportId
      ? `${this.endpoint}/${electionId}/archive-report/download?reportId=${reportId}`
      : `${this.endpoint}/${electionId}/archive-report/download`;
    return this.api.get(url, { responseType: 'blob' });
  }

  async checkRejectionStatus(electionId: string): Promise<BaseResponse<any>> {
    return this.api.get(`${this.endpoint}/${electionId}/rejection-status`);
  }

  async getAbnormalReport(electionId: string): Promise<BaseResponse<any>> {
    return this.api.get(`${this.endpoint}/${electionId}/abnormal-report`);
  }
}

export default new BoardControlService();

