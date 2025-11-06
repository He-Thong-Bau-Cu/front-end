import BaseService from "./BaseService";

class ElectionService extends BaseService {
  constructor() {
    super("elections");
  }

  async addElection(data: Partial<any>): Promise<any> {
    return await this.api.post(`${this.endpoint}/elections`, data);
  }
}

export default new ElectionService();
