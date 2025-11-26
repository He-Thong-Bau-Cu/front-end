import BaseService from "./BaseService";

class NotificationService extends BaseService {
  constructor() {
    super("notification");
  }

  async getUserNotifications(userId: string): Promise<any> {
    return this.api.get(`${this.endpoint}/${userId}`);
  }

  async markReadOne(body: any): Promise<any> {
    return this.api.post(`${this.endpoint}/mark-read-one`, body);
  }

  async markReadAll(body: any): Promise<any> {
    return this.api.post(`${this.endpoint}/mark-read-all`, body);
  }

  async deleteAllNotifications(body: any): Promise<any> {
    return this.api.post(`${this.endpoint}/delete-all`, body);
  }

  // Gửi thông báo broadcast đến tất cả participants trong election
  async broadcastAnnouncement(electionId: string, message: string): Promise<any> {
    return this.api.post(`${this.endpoint}/broadcast`, {
      electionId,
      message,
    });
  }
}

export default new NotificationService();
