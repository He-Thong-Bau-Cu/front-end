import BaseService from "./BaseService";
import type {
  SystemConfig,
  SystemConfigSearchPayload,
  SystemConfigUpsertPayload,
} from "@/types/SystemConfig.interface";
import type { BaseResponse } from "@/types/BaseResponse.interface";

class SystemConfigService extends BaseService {
  constructor() {
    super("system-config");
  }

  async search(
    payload: SystemConfigSearchPayload
  ): Promise<BaseResponse<{
    content: SystemConfig[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  }>> {
    return this.api.post(`${this.endpoint}/search`, payload);
  }

  async create(
    payload: SystemConfigUpsertPayload
  ): Promise<BaseResponse<SystemConfig>> {
    return this.api.post(`${this.endpoint}`, payload);
  }

  async update(
    id: string,
    payload: SystemConfigUpsertPayload
  ): Promise<BaseResponse<SystemConfig>> {
    return this.api.put(`${this.endpoint}/${id}`, payload);
  }

  async remove(id: string): Promise<BaseResponse<SystemConfig>> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  async getByKey(key: string): Promise<BaseResponse<SystemConfig>> {
    return this.api.get(`${this.endpoint}/key/${key}`);
  }
}

export default new SystemConfigService();

