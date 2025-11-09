import { ApiResponse } from "@/types/ApiResponse.interface";
import BaseService from "./BaseService";
import { DashboardVoterStats } from "@/types/Voter.interface";

class VoterService extends BaseService {
    constructor() {
        super("voters");
    }



    async getDashboardVoterByElectionId(id: string | number): Promise<DashboardVoterStats> {
        const response = await this.api.get(`${this.endpoint}/dashboard/${id}`) as ApiResponse<DashboardVoterStats>;
        return response.data;
    }

}

export default new VoterService();
