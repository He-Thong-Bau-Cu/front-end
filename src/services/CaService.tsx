import BaseService from "./BaseService";



class CaService extends BaseService {
    constructor() {
        super("ca");
    }
     
     async ca(): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/init`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
     async CaIssue(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/issue`, body);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

}

export default new CaService();