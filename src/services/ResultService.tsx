import BaseService from "./BaseService";

class ResultService extends BaseService {
    constructor() {
        super("results");
    }

    async getAllResults(): Promise<any> {
        try {
            const response = await this.api.get<any>(`${this.endpoint}`);
            return response;
        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }
    }

    async getResultById(id: string, body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}/${id}`, body);
            return response;
        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }
    }

    // Lấy kết quả bầu cử theo electionId
    async getByElectionId(electionId: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/elections/${electionId}`);
            return response;
        } catch (error) {
            console.error("Error fetching results by electionId:", error);
            throw error;
        }
    }

    // Lấy kết quả Cumulative
    async getCumulativeResultsByElectionId(electionId: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/election-cumulative/${electionId}`);
            return response;
        } catch (error) {
            console.error("Error fetching cumulative results:", error);
            throw error;
        }
    }

    // Lấy kết quả Yes/No
    async getYesNoResultsByElectionId(electionId: string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/election-yes-no/${electionId}`);
            return response;
        } catch (error) {
            console.error("Error fetching yes/no results:", error);
            throw error;
        }
    }
}

export default new ResultService();
