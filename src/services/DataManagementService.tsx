import BaseService from "./BaseService";
import type {
  BackupExportPayload,
  BackupPagination,
  BackupSearchPayload,
} from "@/types/DataManagement.interface";
import type { BaseResponse } from "@/types/BaseResponse.interface";

class DataManagementService extends BaseService {
  constructor() {
    super("data-management");
  }

  async searchBackups(
    payload: BackupSearchPayload
  ): Promise<BaseResponse<BackupPagination>> {
    return this.api.post(`${this.endpoint}/search`, payload);
  }

  async importBackup(formData: FormData): Promise<BaseResponse<any>> {
    return this.api.post(`${this.endpoint}/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async exportBackups(params: BackupExportPayload): Promise<Blob> {
    return this.api.get(`${this.endpoint}/export`, {
      params,
      responseType: "blob",
    });
  }
}

export default new DataManagementService();

