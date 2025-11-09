import { DelegationDetail } from "@/types/Delegate.interface";
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


}



export default new DelegationService();