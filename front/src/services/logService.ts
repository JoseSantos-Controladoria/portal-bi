import api from './api';
import { PaginationParams, PaginatedResponse, buildQueryParams } from './crudService';

export interface LogEntry {
  id: string;
  created_at: string;
  user_name: string;
  user_email: string;
  group_name?: string;
  report_name?: string;
  action: string;
}

export const logService = {

  logAction: async (userId: string | number, action: string, reportId?: number) => {
    try {
      await api.post('/logs', {
        userid: userId,
        reportid: reportId,
        action: action
      });
    } catch (error) {
      console.error("Erro silencioso ao registrar log:", error);
    }
  },

  getAll: async (params?: PaginationParams): Promise<LogEntry[]> => {
    try {

      const queryString = buildQueryParams(params);
      const response = await api.get(`/logs${queryString}`);

      if (response.data && response.data.items) {
          return response.data.items;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      return [];
    }
  }
};