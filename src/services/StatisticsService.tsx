import BaseService from "./BaseService";



class StatisticsService extends BaseService {
    constructor() {
        super("statistics/preside");
    }

    async getDashboardStats(): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}`);
            return response.data;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
    async getDashboardChart(): Promise<any[]> {
        try {
            const response = await this.api.get(
                `${this.endpoint}/recent-participation`);
            return response.data;

        } catch (error) {

            console.error("Error fetching decisions:", error);
            throw error;
        }


    }

}

export default new StatisticsService();