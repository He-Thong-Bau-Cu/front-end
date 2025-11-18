import { User } from "@/types/User.interface";
import BaseService from "./BaseService";
import { number } from "framer-motion";



class ElectionDocumentService extends BaseService {
    constructor() {
        super("election-documents");
    }
    async getDocumentByElectionId(id: string): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}/elections/${id}`);
            return response.data;

        } catch (error) {
            console.error("Error fetching documents:", error);
            throw error;
        }

    }

    async CreateDocument(body: any): Promise<any> {
        try {
            const response = await this.api.post<any>(`${this.endpoint}`, body);
            return response;

        } catch (error) {
            console.error("Error fetching documents:", error);
            throw error;
        }

    }
    async getDocumentById(id: string): Promise<any> {
        try {
            const response = await this.api.get<any>(
                `${this.endpoint}/${id}`);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }
    async UpdateDocumentById(id: string, body: any): Promise<any> {
        try {
            const response = await this.api.put<any>(
                `${this.endpoint}/${id}`, body);
            return response;

        } catch (error) {
            console.error("Error fetching decisions:", error);
            throw error;
        }

    }






}

export default new ElectionDocumentService();