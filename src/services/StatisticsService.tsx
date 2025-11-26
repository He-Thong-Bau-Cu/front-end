import BaseService from "./BaseService";



class StatisticsService extends BaseService {
    constructor() {
        super("statistics");
    }

    async getDashboardStats(): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}/preside`);
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
            return response.data;

        } catch (error) {

            console.error("Error fetching decisions:", error);
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
