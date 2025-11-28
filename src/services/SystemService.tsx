import BaseService from "./BaseService";

class SystemService extends BaseService {
  constructor() {
    super("system");
  }

  async getStatisticsCards(): Promise<any> {
    return await this.api.get(`${this.endpoint}/statistic-cards`);
  }

  async getParticipationRateChart(): Promise<any> {
    return await this.api.get(`${this.endpoint}/participation-rate-chart`);
  }

  async getResultDistributionChart(): Promise<any> {
    return await this.api.get(`${this.endpoint}/result-distribution-chart`);
  }

  async getOngoingPolls(): Promise<any> {
    return await this.api.get(`${this.endpoint}/ongoing-polls`);
  }

  async getRecentActivities(): Promise<any> {
    return await this.api.get(`${this.endpoint}/recent-activities`);
  }

  async getRole(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/roles/search`, body);
  }

  async getPermission(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/permissions/search`, body);
  }

  async getStatisticsChart(type: "week" | "month" | "year"): Promise<any> {
    return await this.api.get(`${this.endpoint}/system-logs/statistics`, {
      params: { type },
    });
  }

  async searchSystemLog(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/system-logs/search`, body);
  }

  async searchAuditLog(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/audit-logs/search`, body);
  }

  async getStatsRole(): Promise<any> {
    return await this.api.get(`${this.endpoint}/roles/statistics`);
  }

  async getStatsPermission(): Promise<any> {
    return await this.api.get(`${this.endpoint}/permissions/statistics`);
  }

  async searchRolePermission(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/role-permissions/search`, body);
  }

  async updateRolePermission(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/role-permissions/update`, body);
  }

  async getAllPermission(): Promise<any> {
    return await this.api.get(`${this.endpoint}/permissions/all`);
  }

  async exportSystemLog(body: any): Promise<any> {
    return await this.api.post(
      `${this.endpoint}/system-logs/export`,
      body,
      {
        responseType: 'blob',
      }
    );
  }

  async addRole(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/roles/create`, body);
  }

  async updateRole(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/roles/update`, body);
  }

  async deleteRole(id: string): Promise<any> {
    return await this.api.delete(`${this.endpoint}/roles/delete/${id}`);
  }

  async addPermission(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/permissions/create`, body);
  }

  async updatePermission(body: any): Promise<any> {
    return await this.api.post(`${this.endpoint}/permissions/update`, body);
  }

  async deletePermission(id: string): Promise<any> {
    return await this.api.delete(`${this.endpoint}/permissions/delete/${id}`);
  }
}

export default new SystemService();
