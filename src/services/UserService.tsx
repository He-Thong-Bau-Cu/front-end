import BaseService from "./BaseService";
import { User } from "../types/User.interface";
import { ApiResponse } from "../types/ApiResponse.interface";



class UserService extends BaseService {
    constructor() {
        super("users");
    }


    async getByUserId(id: string | number): Promise<User> {
        const response = await this.api.get<ApiResponse<User>>(
            `${this.endpoint}/${id}`
        );
        return response.data.data;
    }
}

export default new UserService();