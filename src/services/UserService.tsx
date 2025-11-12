import BaseService from "./BaseService";
import { User } from "../types/User.interface";

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
}

export default new UserService();
