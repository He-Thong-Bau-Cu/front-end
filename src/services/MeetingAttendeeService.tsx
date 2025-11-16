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
}

export default new MeetingAttendeeService();

