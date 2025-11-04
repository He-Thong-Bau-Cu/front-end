import BaseService from "./BaseService";

class VoterService extends BaseService {
    constructor() {
        super("voters");
    }
}

export default new VoterService();
