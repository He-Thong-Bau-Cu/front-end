import BaseService from "./BaseService";

class MeetingService extends BaseService {
    constructor() {
        super("meetings");
    }

    // Tạo cuộc họp mới
    async add(data: any): Promise<any> {
        return await this.api.post(`${this.endpoint}`, data);
    }

    // Lấy danh sách cuộc họp theo electionId
    async getByElectionId(electionId: string | number): Promise<any> {
        return await this.api.get(`${this.endpoint}/elections/${electionId}`);
    }

   
}

export default new MeetingService();
