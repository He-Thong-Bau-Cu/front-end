import { VotingRight } from "@/types/VotingRights.interface";
import BaseService from "./BaseService";
import { ApiResponse } from "@/types/ApiResponse.interface";



class VotingRightsService extends BaseService {
    constructor() {
        super("voting-rights");
    }

    async getVotingRightsByVoterId(id: string | number): Promise<VotingRight[]> {
        const response = await this.api.get(`${this.endpoint}/voters/${id}`) as ApiResponse<VotingRight[]>;
        return response.data;
    }

}

export default new VotingRightsService();