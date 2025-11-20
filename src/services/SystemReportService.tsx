import BaseService from "./BaseService";
import type {
  SystemReportExportQuery,
  SystemReportOverview,
  SystemReportQuery,
} from "@/types/SystemReport.interface";
import type { BaseResponse } from "@/types/BaseResponse.interface";

class SystemReportService extends BaseService {
  constructor() {
    super("system-reports");
  }

  async getOverview(
    params?: SystemReportQuery
  ): Promise<BaseResponse<SystemReportOverview>> {
    return this.api.get(`${this.endpoint}/overview`, {
      params,
    });
  }

  async exportReport(params?: SystemReportExportQuery): Promise<Blob> {
    return this.api.get(`${this.endpoint}/export`, {
      params,
      responseType: "blob",
    });
  }
}

export default new SystemReportService();

