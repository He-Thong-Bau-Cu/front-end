import { CreateDelegationPayload, DelegationDetail, DelegationSearch } from "@/types/Delegate.interface";
import BaseService from "./BaseService";
import { ApiResponse } from "@/types/ApiResponse.interface";



class DelegationService extends BaseService {
    constructor() {
        super("delegations");
    }


    async getDelegation(delegatorId: string, electionId: string): Promise<DelegationDetail> {
        const response = await this.api.get(
            `${this.endpoint}/delegator/${delegatorId}/elections/${electionId}`
        ) as ApiResponse<DelegationDetail>;

        return response.data;
    }

    async getDelegationById(id: string): Promise<DelegationDetail> {
        const response = await this.api.get(
            `${this.endpoint}/${id}`
        ) as ApiResponse<DelegationDetail>;

        return response.data;
    }



    async searchAll(payload: { electionId: string; delegatorId: string }): Promise<DelegationSearch[]> {
        const response = await this.api.post(`${this.endpoint}/search`, payload) as ApiResponse<{ content: DelegationSearch[] }>;
        return response.data?.content || [];
    }


    async add(payload: any): Promise<any> {
        const response = await this.api.post(`${this.endpoint}`, payload) as ApiResponse<any>;
        return response.data;
    }
    async create(payload: CreateDelegationPayload) {
        const response = await this.api.post(`${this.endpoint}`, payload) as ApiResponse<CreateDelegationPayload>;
        return response.data;
    }


}


export default new DelegationService();