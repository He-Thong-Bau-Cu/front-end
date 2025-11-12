import { ApiResponse } from "@/types/ApiResponse.interface";
import BaseService from "./BaseService";
import { BallotCast } from "@/types/Ballot.interface";

class BallotService extends BaseService {
    constructor() {
        super("ballots");
    }




    async getBallotStatusCastByVoterId(id: string | number): Promise<BallotCast[]> {
        const response = await this.api.get(`${this.endpoint}/cast/voters/${id}`) as ApiResponse<BallotCast[]>;
        return response.data;
    }

}

export default new BallotService();
