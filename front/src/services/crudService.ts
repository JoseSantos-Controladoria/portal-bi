import api from './api';

export interface PaginationParams {
  page?: number;
  pagesize?: number;
  orderby?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pagesize: number;
  total_pages: number;
}

export const buildQueryParams = (params?: PaginationParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const crudService = {
  getAll: async <T>(table: string, pagination?: PaginationParams, filters?: Record<string, any>) => {
    let query = `?tablename=${table}`;

    if (pagination) {
      if (pagination.page) query += `&page=${pagination.page}`;
      if (pagination.pagesize) query += `&pagesize=${pagination.pagesize}`;
      if (pagination.orderby) query += `&orderby=${pagination.orderby}`;
    }

    if (filters) {
      Object.keys(filters).forEach(key => {

        const value = filters[key];
        if (value !== undefined && value !== null) {
            query += `&${key}=${encodeURIComponent(String(value))}`;
        }
      });
    }

    const response = await api.get(`/basictable${query}`);
    return response.data as PaginatedResponse<T>;
  },

  getById: async (table: string, id: string | number) => {

    const response = await api.get(`/basictable?tablename=${table}&id=[equal]${id}`);
    return response.data.items ? response.data.items[0] : null;
  },

  create: async (table: string, data: any) => {
    const response = await api.post(`/basictable?tablename=${table}`, data);
    return response.data;
  },

  update: async (table: string, id: string | number, data: any) => {

    const payload = { ...data, id: id };
    
    const response = await api.patch(`/basictable?tablename=${table}`, payload);
    return response.data;
  },

  delete: async (table: string, id: string | number) => {
    const response = await api.delete(`/basictable?tablename=${table}`, {
      data: { id: id } 
    });
    return response.data;
  }
};