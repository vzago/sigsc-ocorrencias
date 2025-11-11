import { apiConfig, getAuthHeaders } from '@/config/api.config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${apiConfig.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao fazer login' }));
      throw new Error(error.message || 'Erro ao fazer login');
    }

    return response.json();
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${apiConfig.baseURL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter dados do usuário');
    }

    return response.json();
  },
};

