import BaseService from "./BaseService";

class ElectionService extends BaseService {
  constructor() {
    super("elections");
  }
}

export default new ElectionService();
