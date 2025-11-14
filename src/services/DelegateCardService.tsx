import { ApiResponse } from "@/types/ApiResponse.interface";
import BaseService from "./BaseService";
import { DelegateCard } from "@/types/DelegateCard.interface";

class DelegateCardService extends BaseService {
    constructor() {
        super("delegate-cards");
    }

    async getDelegateCardByVoterId(id: string | number): Promise<DelegateCard> {
        const response = await this.api.get(`${this.endpoint}/voters/${id}`) as ApiResponse<DelegateCard>;
        return response.data;
    }

}

export default new DelegateCardService();
