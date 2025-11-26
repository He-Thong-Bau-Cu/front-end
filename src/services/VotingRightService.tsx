import BaseService from "./BaseService";

export class VotingRightService extends BaseService {
  constructor() {
    super("voting-rights");
  }
    async getById(id:string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            return response;
        } catch (error) {
            console.error("Error get voting right by id:", error);
            throw error;
        }
    }
    
     async upate(id:string,body: any): Promise<any> {
        try {
            const response = await this.api.put(`${this.endpoint}/${id}`,body);
            return response;
        } catch (error) {
            console.error("Error update voting right by id:", error);
            throw error;
        }
    }

     async getByElectionId(id:string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/elections/${id}`);
            return response;
        } catch (error) {
            console.error("Error get voting right by election id:", error);
            throw error;
        }
    }

     async getByVoterId(id:string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/voters/${id}`);
            return response;
        } catch (error) {
            console.error("Error get voting right by voter id:", error);
            throw error;
        }
    }

     async createVotingRight(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}`, body);
            return response;
        } catch (error) {
            console.error("Error create voting right:", error);
            throw error;
        }
    }

     async getVotingRightByElectionId(id: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/elections/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error create voting right:", error);
            throw error;
        }
    }




}

export default new VotingRightService();
