import BaseService from "./BaseService";



class StatisticsService extends BaseService {
    constructor() {
        super("statistics");
    }

    async getDashboardStats(electionId?: string): Promise<any> {
        try {
            const url = electionId
                ? `${this.endpoint}/preside/elections/${electionId}`
                : `${this.endpoint}/preside`;
            const response = await this.api.get<any>(url);
            return response.data;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
    async getDashboardChart(): Promise<any[]> {
        try {
            const response = await this.api.get(
                `${this.endpoint}/preside/recent-participation`);
            // BaseService interceptor đã unwrap response.data, nên response đã là BaseResponse
            // Kiểm tra nếu response có thuộc tính data
            if (response && response.data) {
                // Nếu response.data là mảng, trả về trực tiếp
                if (Array.isArray(response.data)) {
                    return response.data;
                }
                // Nếu response.data là object có thuộc tính data (nested)
                if (response.data.data && Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }
            // Nếu response là mảng trực tiếp (trường hợp không có BaseResponse wrapper)
            if (Array.isArray(response)) {
                return response;
            }
            // Nếu không phải cả hai, trả về mảng rỗng
            console.warn("Chart data format unexpected:", response);
            return [];

        } catch (error) {
            console.error("Error fetching chart data:", error);
            throw error;
        }
    }

    async getDashBoardSecratary(id: string, electionId:string): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/secretary/elections/${electionId}/users/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }
    }

    async getOrganizerDashboard(): Promise<any> {
        try {
            const response = await this.api.get(`${this.endpoint}/organizer/dashboard`);
            return response.data;
        } catch (error) {
            console.error("Error fetching organizer dashboard:", error);
            throw error;
        }
    }

}

export default new StatisticsService();
