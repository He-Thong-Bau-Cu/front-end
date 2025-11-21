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

  // Cập nhật trạng thái tham gia cuộc họp
  async updateStatusAttendance(
    meetingId: string,
    participantId: string,
    attended: boolean
  ): Promise<any> {
    return await this.api.patch(
      `${this.endpoint}/meetings/${meetingId}/participants/${participantId}/attendance`,
      { attended }
    );
  }

  // Lấy danh sách người tham gia theo meeting ID
  async getByMeetingId(meetingId: string): Promise<any> {
    return await this.api.get(`${this.endpoint}/meetings/${meetingId}`);
  }
}

export default new MeetingAttendeeService();

