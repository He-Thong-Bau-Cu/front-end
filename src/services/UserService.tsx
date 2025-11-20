import BaseService from "./BaseService";
import { User } from "../types/User.interface";
import { ApiResponse } from "@/types/ApiResponse.interface";

class UserService extends BaseService {
  constructor() {
    super("users");
  }

  async statistics(): Promise<any> {
    return await this.api.get(`${this.endpoint}/statistics/get`);
  }

  async changePassword(data: any): Promise<any> {
    return await this.api.post(`auth/change-password`, data);
  }

  /**
  * Upload avatar cho user
  * @param file - File object từ input
  * @returns Trả về { key, url } để hiển thị ngay
  */
  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    return await this.api.post(`${this.endpoint}/avatar/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async getAllUser(): Promise<User[]> {
    const response = await this.api.get(`${this.endpoint}/`) as ApiResponse<User[]>;
    return response.data;
  }

   async getNonVoter(): Promise<User[]> {
    const response = await this.api.get(`${this.endpoint}/non-voters`) as ApiResponse<User[]>;
    return response.data;
  }

  async importFromExcel(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.api.post(`${this.endpoint}/import/excel`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async exportToExcel(): Promise<Blob> {
    return this.api.get(`${this.endpoint}/export/excel`, {
      responseType: "blob",
    });
  }

}

export default new UserService();
