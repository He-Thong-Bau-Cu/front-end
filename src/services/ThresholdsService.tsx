import { User } from "@/types/User.interface";
import BaseService from "./BaseService";



class ThresholdsService extends BaseService {
    constructor() {
        super("thresholds");
    }

    

}

export default new ThresholdsService();