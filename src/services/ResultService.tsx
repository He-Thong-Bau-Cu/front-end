import BaseService from "./BaseService";



class ResultService extends BaseService {
    constructor() {
        super("results");
    }
     
     async getAllResults(): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
     async getResultById(id:string,body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/${id}`, body);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

     async getResultByElectionId(id:string): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}/elections/${id}`);
            return response.data;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

}

export default new ResultService();