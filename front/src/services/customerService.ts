import api from './api';
import { crudService, PaginationParams } from './crudService';
import { CustomerDashboard } from '@/types';

export const customerService = {
  getAll: (pagination?: PaginationParams) => crudService.getAll('customer', pagination),
  getById: (id: number) => crudService.getAll('customer', undefined, { id }),
  create: (data: any) => crudService.create('customer', data),
  update: (id: number, data: any) => crudService.update('customer', id, data),
  delete: (id: number) => crudService.delete('customer', id),

  getDashboardCustomers: async (): Promise<CustomerDashboard[]> => {
    try {
      const response = await api.get('/customers');
      
      if (response.data.status === 'SUCCESS' && response.data.customers) {
        return response.data.customers;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar dashboard de clientes:", error);
      throw error;
    }
  }
};