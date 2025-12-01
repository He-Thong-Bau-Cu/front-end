import axios, { AxiosInstance } from "axios";

class AuthService {
  protected api: AxiosInstance;
  protected endpoint: string;
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
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

  async sendOtp(body: { email: string }): Promise<any> {
    return await this.api.post(`${this.endpoint}/send-otp`, body);
  }

  async verifyOtp(body: { email: string; otp: string }): Promise<any> {
    return await this.api.post(`${this.endpoint}/verify-otp`, body);
  }

  async forwardPassword(body: { email: string }): Promise<any> {
    return await this.api.post(`${this.endpoint}/forward-password`, body);
  }
}

export default new AuthService();
