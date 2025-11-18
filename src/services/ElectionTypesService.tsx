import BaseService from "./BaseService";
import { ElectionTypes } from "@/types/ElectionTypes.interface";



class ElectionTypesService extends BaseService {
    constructor() {
        super("election-types");
    }

    async getElectionTypeByCode(code: string): Promise<ElectionTypes> {
        try {
            const response = await this.api.get(`${this.endpoint}/typeCode/${code}`);
            return response.data;
        } catch (error) {
            console.error("Error get election type by code:", error);
            throw error;
        }
    }

     async getElectionTypeById(id: string): Promise<ElectionTypes> {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error get election type by id:", error);
            throw error;
        }
    }

      async updateElectionTypeById(id: string, body: any): Promise<any> {
        try {
            const response = await this.api.put(`${this.endpoint}/${id}`, body);
            return response;
        } catch (error) {
            console.error("Error get election type by id:", error);
            throw error;
        }
    }

    async searchElectionType(body: any): Promise<ElectionTypes[]> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}/search`, body);
            return response.data.content;
        } catch (error) {
            console.error("Error search election type :", error);
            throw error;
        }
    }

    async createElectionType(body: any): Promise<any> {
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