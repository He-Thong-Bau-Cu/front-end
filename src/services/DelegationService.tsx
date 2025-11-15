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



    async getDelegationByVoterId(electionId: string, delegatorId: string): Promise<DelegationSearch[]> {
        const response = await this.api.get(`${this.endpoint}/delegator/${delegatorId}/elections/${electionId}`) as ApiResponse<DelegationSearch[]>;
        return response.data;
    }


    async add(payload: any): Promise<any> {
        const response = await this.api.post(`${this.endpoint}`, payload) as ApiResponse<any>;
        return response.data;
    }
    async create(payload: CreateDelegationPayload) {
        const response = await this.api.post(`${this.endpoint}`, payload) as ApiResponse<CreateDelegationPayload>;
        return response.data;
    }

    async getAllSummaryDelegation(body: any): Promise<any> {

        try {
            const response = await this.api.post(`${this.endpoint}/summary/preside/all`, body) as ApiResponse<any>;
            return response;

        } catch (error) {
            console.error("Error fetching delegations:", error);
            throw error;
        }
    }

    async getSummaryDelegationPdf(body: any): Promise<any> {

        try {
            const response = await this.api.post(`${this.endpoint}/summary/pdf`, body, { responseType: "blob", })
            return response;

        } catch (error) {
            console.error("Error fetching delegations:", error);
            throw error;
        }
    }

    async delegationApprove(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}/approve`, body)
            return response;

        } catch (error) {
            console.error("Error fetching delegations:", error);
            throw error;
        }
    }

}


export default new DelegationService();