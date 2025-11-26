import BaseService from "./BaseService";

class MeetingAttendeeService extends BaseService {
  constructor() {
    super("meeting-attendees");
  }

  // Tạo người tham gia trong cuộc họp
  async create(data: {
    meetingId: string;
    participantId: string;
    checkInTime: Date;
    attended: boolean;
  }): Promise<any> {
    return await this.api.post(`${this.endpoint}`, data);
  }

  // Check-in đại biểu (chỉ cần electionId và userId)
  async checkIn(electionId: string, userId: string): Promise<any> {
    return await this.api.post(`${this.endpoint}/checkin`, {
      electionId,
      userId,
    });
  }

  // Cập nhật trạng thái tham gia cuộc họp
  async updateStatusAttendance(
    meetingId: string,
    participantId: string,
    attended: boolean
  ): Promise<any> {
    return await this.api.patch(
      `${this.endpoint}/meetings/${meetingId}/participants/${participantId}/attendances/${attended}`,
      {}
    );
  }

  // Lấy danh sách người tham gia theo meeting ID
  async getByMeetingId(meetingId: string): Promise<any> {
    return await this.api.get(`${this.endpoint}/meetings/${meetingId}`);
  }

  // Lấy danh sách người tham gia đã check-in theo election ID
  async getAttendedByElectionId(electionId: string): Promise<any> {
    return await this.api.get(`${this.endpoint}/attended/elections/${electionId}`);
  }

  // Lấy danh sách người tham gia chưa check-in theo election ID
  async getNotAttendedByElectionId(electionId: string): Promise<any> {
    return await this.api.get(`${this.endpoint}/not-attended/elections/${electionId}`);
  }
}

export default new MeetingAttendeeService();

