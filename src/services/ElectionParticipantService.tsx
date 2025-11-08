import { User } from "@/types/User.interface";
import BaseService from "./BaseService";



class ElectionParticipantService extends BaseService {
    constructor() {
        super("election-participants");
    }

    async getElectionParticipantByElectionId(id: string | number): Promise<User[]> {
        const response = await this.api.get<User[]>(
            `${this.endpoint}/elections/${id}`
        );
        return response.data;
    }

}

export default new ElectionParticipantService();