import BaseService from "./BaseService";

class MeetingService extends BaseService {
    constructor() {
        super("meetings");
    }
}

export default new MeetingService();
