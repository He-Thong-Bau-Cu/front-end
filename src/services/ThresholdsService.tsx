import { User } from "@/types/User.interface";
import BaseService from "./BaseService";



class ThresholdsService extends BaseService {
    constructor() {
        super("thresholds");
    }
    async getThresholdByCode(code: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/${code}`);
            return response;
        } catch (error) {
            console.error("Error get thresholds by code:", error);
            throw error;
        }
    }



}

export default new ThresholdsService();