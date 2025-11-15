import { ApiResponse } from "@/types/ApiResponse.interface";
import BaseService from "./BaseService";
import { DashboardVoterStats } from "@/types/Voter.interface";
import { BaseResponse } from "@/types/BaseResponse.interface";

class VoterService extends BaseService {

    constructor() {
        super("voters");
    }

    async getDashboardVoterByElectionId(id: string | number): Promise<DashboardVoterStats> {
        const response = await this.api.get(`${this.endpoint}/dashboard/${id}`) as ApiResponse<DashboardVoterStats>;
        return response.data;
    }

    // Lấy danh sách cử tri theo cuộc bầu cử
    async getByElectionId(electionId: string | number): Promise<any> {
        return await this.api.get(`${this.endpoint}/elections/${electionId}`);
    }

    // Cập nhật thông tin cử tri
    async update(id: string | number, data: Partial<any>): Promise<any> {
        return await this.api.put(`${this.endpoint}/${id}`, data);
    }

    // Xóa cử tri
    async delete(id: string | number): Promise<any> {
        return await this.api.delete(`${this.endpoint}/${id}`);
    }

    // Tạo mới cử tri
    async create(data: { electionId: string; userId: string; eligible: boolean; status?: string }): Promise<any> {
        return await this.api.post(`${this.endpoint}`, data);
    }

    // Tìm kiếm cử tri
    async search(payload: { keyword: string; electionId: string }): Promise<any> {
        // BaseService interceptor đã trả về response.data, nên response chính là BaseResponse
        return await this.api.post(`${this.endpoint}/search`, payload);
      }
}

export default new VoterService();
