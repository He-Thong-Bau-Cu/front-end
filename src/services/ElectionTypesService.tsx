import { User } from "@/types/User.interface";
import BaseService from "./BaseService";
import { ElectionTypes } from "@/types/ElectionTypes.interface";



class ElectionTypesService extends BaseService {
    constructor() {
        super("election-types");
    }

    async getElectionTypeByCode(typeBody: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}/`, typeBody);
            return response;
        } catch (error) {
            console.error("Error get election type by code:", error);
            throw error;
        }
    }

    async searchElectionType(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}/search`, body);
            return response;
        } catch (error) {
            console.error("Error search election type :", error);
            throw error;
        }
    }

    async createElectionType(body: ElectionTypes): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}`, body);
            return response;
        } catch (error) {
            console.error("Error create election type :", error);
            throw error;
        }
    }



}

export default new ElectionTypesService();