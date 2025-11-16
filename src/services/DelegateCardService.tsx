import { ApiResponse } from "@/types/ApiResponse.interface";
import BaseService from "./BaseService";
import { DelegateCard } from "@/types/DelegateCard.interface";
import { BaseResponse } from "@/types/BaseResponse.interface";

class DelegateCardService extends BaseService {
    constructor() {
        super("delegate-cards");
    }

    async getDelegateCardByVoterId(id: string | number): Promise<DelegateCard> {
        const response = await this.api.get(`${this.endpoint}/voters/${id}`) as ApiResponse<DelegateCard>;
        return response.data;
    }
    // Lấy thông tin thẻ đại biểu bằng token
    async getByToken(token: string): Promise<BaseResponse<any>> {
        // BaseService interceptor đã trả về response.data, nên response chính là BaseResponse
        // Token đã được JWT service xử lý, không cần encode
        try {
            const response = await this.api.get(`${this.endpoint}/token/${token}`) as BaseResponse<any>;
            return response;
        } catch (error: any) {
            console.error("❌ Error in getByToken:", error);
            throw error;
        }
    }

    // Lấy thông tin thẻ đại biểu bằng ID
    async getById(id: string): Promise<any> {
        return await this.api.get(`${this.endpoint}/${id}`);
    }

    // Tạo mã QR cho thẻ đại biểu
    async generateQRCode(id: string): Promise<any> {
        return await this.api.get(`${this.endpoint}/qrcode/${id}`);
    }
}

export default new DelegateCardService();

