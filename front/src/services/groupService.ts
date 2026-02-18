import api from './api';
import { crudService, PaginationParams } from './crudService';
import { toast } from "sonner";

export interface Group {
  id: number;
  name: string;
  customer_id: number;
  customer?: string; 
  active: boolean;
  qty_users?: number; 
  last_update?: string;
}

export const groupService = {

  getAll: async (pagination?: PaginationParams) => {
    try {
      const response = await crudService.getAll<Group>('group', pagination);
      return response;
    } catch (error) {
      console.error("Erro ao listar grupos:", error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await crudService.getAll<Group>('group', undefined, { id: id });
      
      if (response.items && response.items.length > 0) {
        return response.items[0];
      }
      throw new Error("Grupo não encontrado.");
    } catch (error) {
      console.error(`[GroupService] Erro ao buscar grupo ${id}:`, error);
      throw error;
    }
  },

  getAuxiliaryData: async () => {
    try {
      const [customers, users] = await Promise.all([
        crudService.getAll('customer'), 
        crudService.getAll('user')      
      ]);

      return {
        customers: customers.items || [],
        users: users.items || []
      };
    } catch (error) {
      console.error("Erro ao carregar dados auxiliares:", error);
      return { customers: [], users: [] };
    }
  },

  getUsersByGroup: async (groupId: number) => {
    try {
      const response = await api.get(`/usersbygroup/${groupId}`);
      return response.data.users || [];
    } catch (error) {
      console.error(`Erro ao buscar usuários do grupo ${groupId}`, error);
      return [];
    }
  },

  save: async (groupData: Partial<Group>, selectedUserIds: number[]) => {
    let groupId = groupData.id;
    let isNewGroup = !groupId;

    try {
      if (groupId) {
        await crudService.update('group', groupId, groupData);
      } else {
        const res = await crudService.create('group', { ...groupData, active: true });
        groupId = res.id;
      }
    } catch (error) {
      console.error("Erro CRÍTICO ao salvar grupo:", error);
      throw error;
    }

    if (groupId) {
      try {
        if (isNewGroup && (!selectedUserIds || selectedUserIds.length === 0)) {
           return groupId;
        }

        await api.post('/usersbygroup', {
          groupid: groupId,
          users: selectedUserIds,
          action: 'DELETE_EXISTING_USERS' 
        });
      } catch (memberError) {
        console.error("Aviso: Grupo salvo, mas falha ao vincular usuários:", memberError);
        toast.warning("Grupo salvo, mas houve erro ao vincular os membros.");
      }
    }

    return groupId;
  },

  delete: async (id: number) => {
    return await crudService.update('group', id, { active: false });
  },

  reactivate: async (id: number) => {
    return await crudService.update('group', id, { active: true });
  }
};