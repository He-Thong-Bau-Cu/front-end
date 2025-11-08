import { Election } from "@/types/Election.interface";
import BaseService from "./BaseService";
import { ApiResponse } from "@/types/ApiResponse.interface";

class ElectionService extends BaseService {
  constructor() {
    super("elections");
  }

  async addElection(data: Partial<any>): Promise<any> {
    return await this.api.post(`${this.endpoint}/elections`, data);
  }


  async getElectionId(id: string | number): Promise<Election> {
    const response = await this.api.get(`${this.endpoint}/get/${id}`) as ApiResponse<Election>;
    return response.data;
  }

}

export default new ElectionService();
