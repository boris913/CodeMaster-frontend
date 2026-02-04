import { apiClient } from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const authApi = {
  // Authentification
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data; // Retourne directement response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  verifyToken: async (): Promise<{ message: string }> => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  // Mot de passe oublié
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  // Profil utilisateur
  me: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  // Vérifier si l'email est disponible
  checkEmail: async (email: string): Promise<{ available: boolean }> => {
    const response = await apiClient.get(`/users/check-email?email=${email}`);
    return response.data;
  },

  // Vérifier si le nom d'utilisateur est disponible
  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await apiClient.get(`/users/check-username?username=${username}`);
    return response.data;
  },
};
