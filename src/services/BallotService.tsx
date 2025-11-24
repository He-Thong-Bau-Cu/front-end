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

    async updateBallot(id: string, payload: any): Promise<Ballot> {
        const response = await this.api.put(
            `${this.endpoint}/${id}`,
            payload
        ) as ApiResponse<Ballot>;

        return response.data;
    }

    async verifyOtp(id: string, payload: { email: string; otp: string }) {
        const response = await this.api.post(
            `${this.endpoint}/verify-otp/${id}`,
            payload
        ) as ApiResponse<any>;

        return response.data;
    }


    async signBallot(id: string, file: File, password: string) {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("file", file);
        formData.append("password", password);

        const res = await this.api.post(
            `${this.endpoint}/sign`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );

        return res.data;
    }


    async getBallotById(id: string): Promise<Ballot> {
        const response = await this.api.get(`${this.endpoint}/${id}`) as ApiResponse<Ballot>;
        return response.data;
    }


}

export default new BallotService();
