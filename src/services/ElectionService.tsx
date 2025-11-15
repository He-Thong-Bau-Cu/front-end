
import { ApiResponse } from "@/types/ApiResponse.interface";
import { Election } from "@/types/Election.interface";
import BaseService from "./BaseService";

class ElectionService extends BaseService {
  constructor() {
    super("elections");
  }


  async getElectionId(id: string | number): Promise<Election> {
    const response = await this.api.get(`${this.endpoint}/get/${id}`) as ApiResponse<Election>;
    return response.data;
  }

}

export default new ElectionService();
