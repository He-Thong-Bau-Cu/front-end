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


}

export default new ElectionEntitiesService();
