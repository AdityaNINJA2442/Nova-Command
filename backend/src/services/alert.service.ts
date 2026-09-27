import { alertRepository } from '../repositories/alert.repository';

export class AlertService {
  async getAllAlerts() {
    return alertRepository.getAll();
  }

  async getAlertById(id: string) {
    const alert = await alertRepository.getById(id);
    if (!alert) {
      throw new Error(`Alert ${id} not found`);
    }
    return alert;
  }

  async updateAlertStatus(id: string, status: string) {
    return alertRepository.updateStatus(id, status);
  }
}

export const alertService = new AlertService();
