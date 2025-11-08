import BaseService from "./BaseService";

class ElectionParticipantsService extends BaseService {
  constructor() {
    super("election-participants");
  }

  async getByUserId(userId: string): Promise<any> {
    return await this.api.get(`${this.endpoint}/users/${userId}`);
  }
}

export default new ElectionParticipantsService();
