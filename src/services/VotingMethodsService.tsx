import { User } from "@/types/User.interface";
import BaseService from "./BaseService";



class VotingMethodsService extends BaseService {
    constructor() {
        super("voting-methods");
    }

    

}

export default new VotingMethodsService();