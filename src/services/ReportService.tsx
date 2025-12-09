import BaseService from "./BaseService";



class ReportService extends BaseService {
    constructor() {
        super("reports");
    }

    async createReport(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
    async getAllReport(electionId?: string): Promise<any> {
        try {
            const url = electionId
                ? `${this.endpoint}?electionId=${electionId}`
                : `${this.endpoint}`;
            const response = await this.api.get<any>(url);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

    async getReportById(id: string): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}/${id}`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

    async getReportByElectionId(id: string): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}/elections/${id}`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

}

export default new ReportService();
