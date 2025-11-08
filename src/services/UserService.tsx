import BaseService from "./BaseService";
import { User } from "../types/User.interface";



class UserService extends BaseService {
    constructor() {
        super("users");
    }


    async getByUserId(id: string | number): Promise<User> {
        const response = await this.api.get<User>(
            `${this.endpoint}/${id}`
        );
        return response.data ;
    }
}

export default new UserService();