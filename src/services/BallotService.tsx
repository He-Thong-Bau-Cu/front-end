import { ApiResponse } from "@/types/ApiResponse.interface";
import BaseService from "./BaseService";
import { Ballot, BallotCast, BallotStatistics } from "@/types/Ballot.interface";

class BallotService extends BaseService {
    constructor() {
        super("ballots");
    }

    async getBallotByVoterId(id: string | number): Promise<Ballot[]> {
        const response = await this.api.get(`${this.endpoint}/voters/${id}`) as ApiResponse<Ballot[]>;
        return response.data;
    }

    async getBallotStatusCastByVoterId(id: string | number): Promise<BallotCast[]> {
        const response = await this.api.get(`${this.endpoint}/cast/voters/${id}`) as ApiResponse<BallotCast[]>;
        return response.data;
    }

    async getAllBallotsByElectionId(id: string | number): Promise<Ballot[]> {
        const response = await this.api.get(`${this.endpoint}/elections/${id}`) as ApiResponse<Ballot[]>;
        return response.data;
    }

    async getBallotStatisticsByElectionId(id: string | number): Promise<BallotStatistics> {
        const response = await this.api.get(`${this.endpoint}/statistics/elections/${id}`) as ApiResponse<BallotStatistics>;
        return response.data;
    }

}

export default new BallotService();
