import { Decision } from "@/types/Decision.interface";
import BaseService from "./BaseService";

class DecisionService extends BaseService {
  constructor() {
    super("elections"); // Sử dụng endpoint meetings vì decisions có thể là meetings
  }

  async getAllDecisions(params?: { page?: number; limit?: number; textSearch?: string;  statusData?: string; decisionName?: string; decisionNumber?: string }): Promise<{
    content: Decision[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  }> {
    try {
      const searchParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        statusData: params?.statusData,
        textSearch: params?.textSearch,
        decisionName: params?.decisionName,
        decisionNumber: params?.decisionNumber,
      };

      const response = await this.api.post<any>(
        `${this.endpoint}/search`,
        searchParams 
      );
      
      if (response && response.data) {
        const result = response.data;
        return {
          content: result.content || [],
          page: result.page || 1,
          limit: result.limit || 10,
          totalItems: result.totalItems || 0,
          totalPages: result.totalPages || 1,
        };
      }
      
      return {
        content: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error("Error fetching decisions:", error);
      throw error;
    }
  }

  async getElectionById(id: string): Promise<any> {
     try {
            const response = await this.api.get(
                `${this.endpoint}/get/${id}`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }
  }

  

  async createDecision(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}`, body);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

  async updateDecision(id: string, body: any): Promise<any> {
   try {
            const response = await this.api.put<any>(`${this.endpoint}/update/${id}`, body);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

  }

  async deleteDecision(id: string): Promise<any> {
    try {
      const response = await this.api.delete(`${this.endpoint}/delete/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting decision:", error);
      throw error;
    }
  }
}

export default new DecisionService();

