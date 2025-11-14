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

  async getByUserId(userId: string): Promise<any> {
    return await this.api.get(`${this.endpoint}/users/${userId}`);
  }

  async createParticipant(body: any): Promise<any> {
    try {
      const response = await this.api.post(`${this.endpoint}`, body);
      return response;

    } catch (error) {
      console.error("Error fetching decisions:", error);
      throw error;
    }
  }

  async getParticipantById(id: string): Promise<any> {
     try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }
  }

}

export default new ElectionParticipantService();