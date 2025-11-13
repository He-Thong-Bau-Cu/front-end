import { User } from "@/types/User.interface";
import BaseService from "./BaseService";



class ElectionTypesService extends BaseService {
    constructor() {
        super("election-types");
    }

    

}

export default new ElectionTypesService();