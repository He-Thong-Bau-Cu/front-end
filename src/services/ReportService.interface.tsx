import { ApiResponse } from "@/types/ApiResponse.interface";
import BaseService from "./BaseService";
import { Report } from "@/types/Report.interface";

class ReportService extends BaseService {
    constructor() {
        super("reports");
    }




    async getAllReportByElectionId(id: string | number): Promise<Report[]> {
        const response = await this.api.get(`${this.endpoint}/elections/${id}`) as ApiResponse<Report[]>;
        return response.data;
    }

}

export default new ReportService();
