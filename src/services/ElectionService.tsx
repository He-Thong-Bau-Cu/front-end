
import { ApiResponse } from "@/types/ApiResponse.interface";
import { Election } from "@/types/Election.interface";
import BaseService from "./BaseService";
import { BaseResponse } from "@/types/BaseResponse.interface";

class ElectionService extends BaseService {
  constructor() {
    super("elections");
  }

  async addElection(data: Partial<any>): Promise<any> {
    return await this.api.post(`${this.endpoint}/elections`, data);
  }

  async getElectionId(id: string | number): Promise<Election> {
    const response = await this.api.get(`${this.endpoint}/get/${id}`) as ApiResponse<Election>;
    return response.data;
  }

  // Tìm kiếm danh sách cuộc bầu cử
  async searchElections(params?: { textSearch?: string; page?: number; limit?: number }): Promise<BaseResponse<Election[]>> {
    return await this.api.post(`${this.endpoint}/search`, {
      textSearch: params?.textSearch || "",
      page: params?.page || 1,
      limit: params?.limit || 100, // Lấy nhiều để hiển thị đầy đủ
    });
  }
}

export default new ElectionService();
