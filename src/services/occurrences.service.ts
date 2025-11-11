import { apiConfig, getAuthHeaders } from '@/config/api.config';
import { CreateOccurrenceDto, UpdateOccurrenceDto, FilterOccurrenceDto, Occurrence, PaginatedResponse } from '@/types/occurrence.types';

export const occurrencesApi = {
  async getAll(filters?: FilterOccurrenceDto): Promise<PaginatedResponse<Occurrence>> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.requesterName) params.append('requesterName', filters.requesterName);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${apiConfig.baseURL}/occurrences${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar ocorrências');
    }

    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${apiConfig.baseURL}/occurrences/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar ocorrência');
    }

    return response.json();
  },

  async getByRANumber(raNumber: string) {
    const response = await fetch(`${apiConfig.baseURL}/occurrences/ra/${raNumber}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar ocorrência');
    }

    return response.json();
  },

  async create(data: CreateOccurrenceDto) {
    const response = await fetch(`${apiConfig.baseURL}/occurrences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao criar ocorrência' }));
      throw new Error(error.message || 'Erro ao criar ocorrência');
    }

    return response.json();
  },

  async update(id: string, data: UpdateOccurrenceDto) {
    const response = await fetch(`${apiConfig.baseURL}/occurrences/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar ocorrência');
    }

    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${apiConfig.baseURL}/occurrences/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar ocorrência');
    }

    return response.json();
  },
};

