import { ApiResponse } from "@/types/ApiResponse.interface";
import { Election } from "@/types/Election.interface";
import BaseService from "./BaseService";
import { BaseResponse } from "@/types/BaseResponse.interface";

class ElectionService extends BaseService {
  constructor() {
    super("elections");
  }

  async addElection(data: Partial<any>): Promise<any> {
    return await this.api.post(`${this.endpoint}/elections`, data);
  }

  async getElectionId(id: string | number): Promise<Election> {
    const response = (await this.api.get(
      `${this.endpoint}/get/${id}`
    )) as ApiResponse<Election>;
    return response.data;
  }

  // Tìm kiếm danh sách cuộc bầu cử
  async searchElections(params?: {
    textSearch?: string;
    page?: number;
    limit?: number;
  }): Promise<BaseResponse<Election[]>> {
    return await this.api.post(`${this.endpoint}/search`, {
      textSearch: params?.textSearch || "",
      page: params?.page || 1,
      limit: params?.limit || 100, // Lấy nhiều để hiển thị đầy đủ
    });
  }

  async bulkSaveDraft(body: any): Promise<any> {
    try {
      const response = await this.api.post<any>(
        `${this.endpoint}/bulk-save-draft`,
        body
      );
      return response;
    } catch (error) {
      console.error("Error bulk save draft:", error);
      throw error;
    }
  }

  async updateElection(id: string, body: any): Promise<any> {
    try {
      const response = await this.api.put<any>(
        `${this.endpoint}/update/${id}`,
        body
      );
      return response;
    } catch (error) {
      console.error("Error create election type :", error);
      throw error;
    }
  }

  async getElectionUser(): Promise<any> {
    try {
      const response = await this.api.post<any>(`${this.endpoint}/user-organizer`, {});
      return response.data;
    } catch (error) {
      console.error("Error get user:", error);
      throw error;
    }
  }

  async getElectionVoter(body: any): Promise<any> {
    try {
      const response = await this.api.post<any>(
        `${this.endpoint}/user-voter/valid`,
        body
      );
      return response.data;
    } catch (error) {
      console.error("Error get user:", error);
      throw error;
    }
  }

  async getDraftData(electionId: string): Promise<any> {
    try {
      const response = await this.api.get<any>(
        `${this.endpoint}/${electionId}/draft-data`
      );
      return response;
    } catch (error) {
      console.error("Error get draft data:", error);
      throw error;
    }
  }

  async previewPdf(electionId: string): Promise<Blob> {
    try {
      // Interceptor đã unwrap response, nên response chính là response.data (đã là Blob)
      const response = await this.api.get(
        `${this.endpoint}/preview-pdf/${electionId}`,
        {
          responseType: "blob",
        }
      );
      // Interceptor trả về response.data, nên response chính là Blob
      return response as unknown as Blob;
    } catch (error) {
      console.error("Error preview PDF:", error);
      throw error;
    }
  }

  // Kết thúc giai đoạn bỏ phiếu
  async endVotingStage(electionId: string): Promise<any> {
    try {
      const response = await this.api.post(
        `${this.endpoint}/${electionId}/end-voting-stage`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Error ending voting stage:", error);
      throw error;
    }
  }

  // Bắt đầu một giai đoạn
  async startStage(electionId: string, stage: string): Promise<any> {
    try {
      const response = await this.api.post(
        `${this.endpoint}/${electionId}/stages/${stage}/start`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Error starting stage:", error);
      throw error;
    }
  }

  // Kết thúc một giai đoạn
  async endStage(electionId: string, stage: string): Promise<any> {
    try {
      const response = await this.api.post(
        `${this.endpoint}/${electionId}/stages/${stage}/end`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Error ending stage:", error);
      throw error;
    }
  }

  // Lấy giai đoạn hiện tại của cuộc bầu cử
  async getCurrentStage(electionId: string): Promise<any> {
    try {
      const response = await this.api.get(
        `${this.endpoint}/${electionId}/current-stage`
      );
      return response;
    } catch (error) {
      console.error("Error getting current stage:", error);
      throw error;
    }
  }

  // Tạo yêu cầu cuộc bầu cử mới từ user
  async createElectionRequest(data: any): Promise<any> {
    try {
      const response = await this.api.post<any>(`${this.endpoint}/user-request`, data);
      return response;
    } catch (error) {
      console.error("Error create election request:", error);
      throw error;
    }
  }

  // Lấy danh sách yêu cầu tạo cuộc bầu cử của user
  async getMyElectionRequests(params?: { textSearch?: string; page?: number; limit?: number; statusData?: string }): Promise<BaseResponse<any>> {
    try {
      const response = await this.api.post<BaseResponse<any>>(`${this.endpoint}/my-requests`, {
        textSearch: params?.textSearch || "",
        page: params?.page || 1,
        limit: params?.limit || 10,
        statusData: params?.statusData,
      });
      return response as unknown as BaseResponse<any>;
    } catch (error) {
      console.error("Error get my election requests:", error);
      throw error;
    }
  }

  // Lấy danh sách yêu cầu cuộc bầu cử cần phê duyệt (cho chủ tọa)
  // Nếu có electionId thì chỉ lấy các election requests của cuộc bầu cử đó
  async getElectionRequestsForApproval(params?: { textSearch?: string; page?: number; limit?: number; electionId?: string }): Promise<BaseResponse<any>> {
    try {
      const response = await this.api.post<BaseResponse<any>>(`${this.endpoint}/requests-for-approval`, {
        textSearch: params?.textSearch || "",
        page: params?.page || 1,
        limit: params?.limit || 10,
        electionId: params?.electionId,
      });
      return response as unknown as BaseResponse<any>;
    } catch (error) {
      console.error("Error get election requests for approval:", error);
      throw error;
    }
  }

  // Duyệt yêu cầu cuộc bầu cử
  async approveElectionRequest(electionId: string, secretaryId?: string, boardOfControlId?: string): Promise<BaseResponse<any>> {
    try {
      const response = await this.api.post<BaseResponse<any>>(`${this.endpoint}/approve-request`, {
        electionId,
        secretaryId,
        boardOfControlId,
      });
      return response as unknown as BaseResponse<any>;
    } catch (error) {
      console.error("Error approve election request:", error);
      throw error;
    }
  }

  // Từ chối yêu cầu cuộc bầu cử
  async rejectElectionRequest(electionId: string, rejectReason: string): Promise<BaseResponse<any>> {
    try {
      const response = await this.api.post<BaseResponse<any>>(`${this.endpoint}/reject`, {
        electionId,
        rejectReason,
      });
      return response as unknown as BaseResponse<any>;
    } catch (error) {
      console.error("Error reject election request:", error);
      throw error;
    }
  }


  // Clone election để bầu cử lại
  async cloneForReelection(
    electionId: string,
    startDate: Date,
    endDate: Date,
    startStage: string
  ): Promise<BaseResponse<any>> {
    try {
      const response = await this.api.post<BaseResponse<any>>(
        `${this.endpoint}/${electionId}/clone-for-reelection`,
        {
          startDate,
          endDate,
          startStage,
        }
      );
      return response as unknown as BaseResponse<any>;
    } catch (error) {
      console.error("Error clone election for reelection:", error);
      }
  }

  async getVotersFromExcel(electionId: string): Promise<any> {
    try {
      const response = await this.api.get(
        `${this.endpoint}/${electionId}/voters-from-excel`
      );
      return response;
    } catch (error) {
      console.error("Error getting voters from excel:", error);

      throw error;
    }
  }
}

export default new ElectionService();
