import axios, { AxiosInstance } from "axios";
import BaseService from "./BaseService";

class AuthService {
    protected api: AxiosInstance;
    protected endpoint: string;
    constructor() {
      this.api = axios.create({
      baseURL: `http://localhost:3000/`,
    });
    this.endpoint = 'auth';
    }

    async login(body: { username: string; password: string }): Promise<any> {
      return await this.api.post(`${this.endpoint}/login`, body);
    }

    async setupTwoFa(body: any): Promise<any> {
      return await this.api.post(`${this.endpoint}/2fa/setup`, body);
    }

    async verifyTwoFa(body: any): Promise<any> {
      return await this.api.post(`${this.endpoint}/2fa/verify`, body);
    }

    async twoFaLogin(body: any): Promise<any> {
      return await this.api.post(`${this.endpoint}/2fa/login`, body);
    }
}

export default new AuthService();
