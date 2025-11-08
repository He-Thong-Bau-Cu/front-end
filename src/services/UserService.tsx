import BaseService from "./BaseService";
import { User } from "../types/User.interface";
import { ApiResponse } from "../types/ApiResponse.interface";

class UserService extends BaseService {
  constructor() {
    super("users");
  }

  async changePassword(data: any): Promise<any> {
    return await this.api.post(`auth/change-password`, data);
  }
}

export default new UserService();
