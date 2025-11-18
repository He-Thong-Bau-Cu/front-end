import { ElectionEntities } from "@/types/ElectionEntities.interface";
import BaseService from "./BaseService";
import { ApiResponse } from "@/types/ApiResponse.interface";

class ElectionEntitiesService extends BaseService {
    constructor() {
        super("election-entities");
    }

    async getElectionEntitiesByElectionId(id: string | number): Promise<ElectionEntities[]> {
        const response = await this.api.get(`${this.endpoint}/elections/${id}`) as ApiResponse<ElectionEntities[]>;
        return response.data;
    }

    async updateElectionEntities(id: string, body: any): Promise<any> {
        const response = await this.api.post(`${this.endpoint}/${id}`, body);
        return response;
    }

    async getElectionEntitiesById(id: string): Promise<ElectionEntities> {
        const response = await this.api.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    async createElectionEntities(body:any): Promise<any> {
        const response = await this.api.post<any>(`${this.endpoint}`, body);
        return response;
    }


}

export default new ElectionEntitiesService();
