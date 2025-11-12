import { User } from "@/types/User.interface";
import BaseService from "./BaseService";
import { number } from "framer-motion";



class SigningService extends BaseService {
    constructor() {
        super("signing");
    }
     async SignPDF(): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/pdf`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

    async SignVerify(): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/verify`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
    async SignWord(): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/word`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
     async SignDoc(): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/doc`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

     async SignWordXML(): Promise<any> {
        try {
            const response = await this.api.post<any>(
                `${this.endpoint}/word-xml`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }

}

export default new SigningService();