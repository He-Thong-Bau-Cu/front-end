import BaseService from "./BaseService";

class MeetingService extends BaseService {
    constructor() {
        super("meetings");
    }

    // Tạo cuộc họp mới
    async add(data: any): Promise<any> {
        return await this.api.post(`${this.endpoint}`, data);
    }
}

export default new MeetingService();
