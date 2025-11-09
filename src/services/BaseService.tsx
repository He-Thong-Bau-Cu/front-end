import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export default class BaseService<T = any> {
  protected api: AxiosInstance;
  protected endpoint: string;

  constructor(endpoint: string) {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
    });
    this.endpoint = endpoint;

    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Unauthorized! Token có thể đã hết hạn.");

          // ✅ Chỉ redirect nếu KHÔNG đang ở trang login
          if (window.location.pathname !== "/login") {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
          }
        }

        console.error("API Error:", error.response.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // GET toàn bộ
  async getAll(params?: Record<string, any>): Promise<T[]> {
    return await this.api.get(`${this.endpoint}`, { params });
  }

  // GET theo id
  async getById(id: string | number): Promise<T> {
    return await this.api.get(`${this.endpoint}/get-by-id/${id}`);
  }

  // SEARCH
  async search(body: Partial<T>): Promise<T[]> {
    return await this.api.post(`${this.endpoint}/search`, body);
  }

  // CREATE
  async add(data: Partial<T>): Promise<T> {
    return await this.api.post(`${this.endpoint}`, data);
  }

  // UPDATE
  async update(id: string, data: Partial<T>): Promise<T> {
    return await this.api.put(`${this.endpoint}/update/${id}`, data);
  }

  // DELETE
  async delete(id: string | number): Promise<void> {
    return await this.api.delete(`${this.endpoint}/delete/${id}`);
  }

  async detail(id: string | number): Promise<T> {
    return await this.api.get(`${this.endpoint}/detail/${id}`);
  }
}
