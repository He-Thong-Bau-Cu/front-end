import { User } from "@/types/User.interface";
import BaseService from "./BaseService";



class ElectionEntitisSevice extends BaseService {
    constructor() {
        super("election-entities");
    }
    async getById(id: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            return response;
        } catch (error) {
            console.error("Error get election entities by id:", error);
            throw error;
        }
    }
    async updateById(id: string, body: any): Promise<any> {
        try {
            const response = await this.api.put(`${this.endpoint}/${id}`, body);
            return response;
        } catch (error) {
            console.error("Error update election entities by id:", error);
            throw error;
        }
    }

    async getByElectionId(id: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/elections/${id}`);
            return response;
        } catch (error) {
            console.error("Error get election entities by election id:", error);
            throw error;
        }
    }

    async createElectionEntities(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}`, body);
            return response;
        } catch (error) {
            console.error("Error create election entities:", error);
            throw error;
        }
    }


}

export default new ElectionEntitisSevice();