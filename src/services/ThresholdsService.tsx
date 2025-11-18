import { User } from "@/types/User.interface";
import BaseService from "./BaseService";
import { Threshols } from "@/types/Threshols.interface";



class ThresholdsService extends BaseService {
    constructor() {
        super("thresholds");
    }
    async getThresholdByCode(code: string): Promise<Threshols> {
        try {
            const response = await this.api.get(`${this.endpoint}/thresholdCode/${code}`);
            return response.data;
        } catch (error) {
            console.error("Error get thresholds by code:", error);
            throw error;
        }
    }

    async getThresholdById(id: string): Promise<Threshols> {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error get thresholds by id:", error);
            throw error;
        }
    }

     async updateThresholdById(id: string, body: any): Promise<any> {
        try {
            const response = await this.api.put(`${this.endpoint}/${id}`, body);
            return response;
        } catch (error) {
            console.error("Error update thresholds:", error);
            throw error;
        }
    }

    async searchThreshold(body: any): Promise<Threshols[]> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}/search`, body);
            return response.data.content;
        } catch (error) {
            console.error("Error update thresholds:", error);
            throw error;
        }
    }

    async createThreshold(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}`, body);
            return response;
        } catch (error) {
            console.error("Error update thresholds:", error);
            throw error;
        }
    }


}

export default new ThresholdsService();