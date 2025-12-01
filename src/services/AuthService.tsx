import axios, { AxiosInstance } from "axios";

class AuthService {
  protected api: AxiosInstance;
  protected endpoint: string;
  constructor() {
    // Tự động detect nếu đang ở Netlify (production) thì dùng relative path /api
    const getBaseURL = () => {
      const envUrl = import.meta.env.VITE_API_URL;
      // Nếu đang ở Netlify (hostname chứa netlify.app) và không có VITE_API_URL hoặc là HTTP
      if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
        // Nếu VITE_API_URL là HTTP hoặc không được set, dùng relative path
        if (!envUrl || envUrl.startsWith('http://')) {
          return '/api';
        }
      }
      return envUrl || '/api';
    };

    this.api = axios.create({
      baseURL: getBaseURL(),
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
