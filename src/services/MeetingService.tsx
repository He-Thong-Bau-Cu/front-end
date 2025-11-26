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

    // Lấy thông tin cuộc họp theo ID
    async getById(meetingId: string): Promise<any> {
        return await this.api.get(`${this.endpoint}/${meetingId}`);
    }

    // Lấy thống kê điều hành sự kiện theo electionId
    async getEventManagementStats(electionId: string): Promise<any> {
        return await this.api.get(`${this.endpoint}/elections/${electionId}/event-management-stats`);
    }

    // Cập nhật trạng thái cuộc họp (pause/resume/stop)
    async updateStatus(meetingId: string, status: string): Promise<any> {
        return await this.api.patch(`${this.endpoint}/${meetingId}/status`, { status });
    }
}

export default new MeetingService();
