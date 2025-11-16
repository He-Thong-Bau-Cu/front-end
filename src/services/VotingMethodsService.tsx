import { User } from "@/types/User.interface";
import BaseService from "./BaseService";



class VotingMethodsService extends BaseService {
    constructor() {
        super("voting-methods");
    }

    async getVotingMethodByCode(code: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/${code}`);
            return response;
        } catch (error) {
            console.error("Error get voting method by code:", error);
            throw error;
        }
    }
    async searchVotingMethod(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}/search`, body);
            return response;
        } catch (error) {
            console.error("Error search voting method:", error);
            throw error;
        }
    }





}

export default new VotingMethodsService();