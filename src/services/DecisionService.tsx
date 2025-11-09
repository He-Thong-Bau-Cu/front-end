import { Decision } from "@/types/Decision.interface";
import BaseService from "./BaseService";

class DecisionService extends BaseService {
  constructor() {
    super("elections"); // Sử dụng endpoint meetings vì decisions có thể là meetings
  }

  async getAllDecisions(params?: { page?: number; limit?: number; textSearch?: string;  status?: string; decisionName?: string; decisionNumber?: string }): Promise<{
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
        status: params?.status,
        textSearch: params?.textSearch,
        decisionName: params?.decisionName,
        decisionNumber: params?.decisionNumber,
      };

      const response = await this.api.post<any>(
        `${this.endpoint}/search`,
        searchParams 
      );
      
      // BaseService interceptor đã trả về response.data, nên response chính là body của API
      // Response format: { status, success, message, data: { content: [], page, limit, totalItems, totalPages } }
      console.log("API Response:", response);
      
      if (response && response.data) {
        const result = response.data;
        console.log("Parsed data:", result);
        return {
          content: result.content || [],
          page: result.page || 1,
          limit: result.limit || 10,
          totalItems: result.totalItems || 0,
          totalPages: result.totalPages || 1,
        };
      }
      
      // Fallback nếu response format khác
      console.warn("Unexpected API response format:", response);
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

  async getElectionById(id: string): Promise<Decision> {
    try {
      const response: any = await this.api.get<any>(
        `${this.endpoint}/get/${id}`
      );
      
      // BaseService interceptor đã trả về response.data, nên response chính là body của API
      // Response format: { status, success, message, data: Decision }
      console.log("API Response for decision detail:", response);
      
      // Xử lý response format
      if (response && response.data) {
        // Nếu response có format { status, message, data: Decision }
        return response.data as Decision;
      }
      
      // Nếu response chính là Decision object (đã được unwrap)
      if (response && (response._id || response.decisionNumber || response.title)) {
        return response.data as Decision;
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error fetching decision:", error);
      throw error;
    }
  }

  async createDecision(data: any): Promise<any> {
    try {
      const response: any = await this.api.post<any>(
        `${this.endpoint}`,
        data
      );
      
      // BaseService interceptor đã trả về response.data, nên response chính là body của API
      // Response format: { status, success, message, data: Decision }
      console.log("API Response for create decision:", response);
      
      if (response && response.data) {
        return response as Decision;
      }
      
      // Nếu response chính là Decision object (đã được unwrap)
      if (response && (response._id || response.decisionNumber || response.title)) {
        return response as Decision;
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error creating decision:", error);
      throw error;
    }
  }

  async updateDecision(id: string, data: any): Promise<any> {
    try {
      const response: any = await this.api.put<any>(
        `${this.endpoint}/update/${id}`,
        data
      );
      
      // BaseService interceptor đã trả về response.data, nên response chính là body của API
      // Response format: { status, success, message, data: Decision }
      console.log("API Response for update decision:", response);
      
      if (response && response.data) {
        return response as Decision;
      }
      
      // Nếu response chính là Decision object (đã được unwrap)
      if (response && (response._id || response.decisionNumber || response.decisionName || response.title)) {
        return response as Decision;
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error updating decision:", error);
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

