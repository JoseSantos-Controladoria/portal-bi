import api from './api'; 
import { crudService, PaginationParams } from './crudService';

export interface Report {
  id: number;
  workspace_id: number;
  customer_id?: number;
  title: string;
  description: string;
  embedded_url: string;
  active: boolean;
  last_update?: string;
}

export const reportService = {

  getAll: async (pagination?: PaginationParams) => {
    return await crudService.getAll<Report>('report', pagination);
  },

  getById: async (id: number) => {
    try {
      const response = await crudService.getAll<Report>('report', undefined, { id: id });
      
      if (response.items && response.items.length > 0) {
        return response.items[0];
      }
      throw new Error("Relatório não encontrado.");
    } catch (error) {
      console.error(`Erro ao buscar relatório ${id}:`, error);
      throw error;
    }
  },

  getAuxiliaryData: async () => {
    try {
      const workspaces = await crudService.getAll('workspace');
      return { workspaces: workspaces.items || [] };
    } catch (error) {
      console.error("Erro workspaces:", error);
      return { workspaces: [] };
    }
  },

  save: async (data: Partial<Report>) => {
    if (data.id) {
      return await crudService.update('report', data.id, data);
    } else {
      // Garante que novos relatórios nasçam ativos
      return await crudService.create('report', { ...data, active: true });
    }
  },

  // MUDANÇA: Soft Delete (Inativação)
  delete: async (id: number) => {
    // Ao invés de excluir, atualizamos para active: false
    return await crudService.update('report', id, { active: false });
  },

  // Método auxiliar para reativar, caso precise explícito
  reactivate: async (id: number) => {
    return await crudService.update('report', id, { active: true });
  },

  getMyReports: async (userId: number | string) => {
    try {
      const response = await api.get(`/myreports/${userId}`);
      return response.data.items || [];
    } catch (error) {
      console.error("Erro ao buscar meus relatórios:", error);
      return [];
    }
  },

  getReportGroups: async (reportId: number) => {
    try {
      const response = await api.get(`/groupsbyreport/${reportId}`);
      return response.data.groups || [];
    } catch (error) {
      console.error("Erro ao buscar grupos do relatório:", error);
      return [];
    }
  },

  saveGroups: async (reportId: number, groupIds: number[]) => {
    await api.post('/groupsbyreport', {
      reportid: reportId,
      groups: groupIds,
      action: 'DELETE_EXISTING_GROUPS' 
    });
  }  
};