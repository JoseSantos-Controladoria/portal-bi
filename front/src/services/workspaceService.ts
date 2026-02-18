import { crudService, PaginationParams } from './crudService';

export interface Workspace {
  id: number;
  name: string;
  url: string;
  active: boolean; // Adicionado para suportar o soft delete
  last_update?: string;
}

export const workspaceService = {

  getAll: async (pagination?: PaginationParams) => {
    try {
      return await crudService.getAll<Workspace>('workspace', pagination);
    } catch (error) {
      console.error("Erro ao listar workspaces:", error);
      throw error;
    }
  },

  save: async (data: Partial<Workspace>) => {
    try {
      if (data.id) {
        await crudService.update('workspace', data.id, data);
      } else {
        // Novos workspaces nascem ativos
        await crudService.create('workspace', { ...data, active: true });
      }
    } catch (error) {
      console.error("Erro ao salvar workspace:", error);
      throw error;
    }
  },

  // MUDANÇA: Soft Delete (Inativação)
  delete: async (id: number) => {
    return await crudService.update('workspace', id, { active: false });
  },

  // NOVO: Reativar
  reactivate: async (id: number) => {
    return await crudService.update('workspace', id, { active: true });
  }
};