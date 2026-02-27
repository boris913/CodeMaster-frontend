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

// ✅ Plus de refreshToken dans le body (cookie httpOnly)
export interface AuthResponse {
  accessToken: string;
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

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// ✅ Interfaces pour les retours typés explicitement
interface VerifyTokenResponse {
  message: string;
}

interface CheckAvailabilityResponse {
  available: boolean;
}

export const authApi = {

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // ✅ Plus de refreshToken dans le body — le cookie est envoyé automatiquement
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // ✅ Refresh via cookie httpOnly — body vide
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {});
    return response.data;
  },

  // ✅ Type explicite <VerifyTokenResponse> pour corriger l'erreur ligne 74
  verifyToken: async (): Promise<VerifyTokenResponse> => {
    const response = await apiClient.get<VerifyTokenResponse>('/auth/verify');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  me: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  // ✅ Type explicite <CheckAvailabilityResponse> pour corriger les erreurs lignes 95 et 101
  checkEmail: async (email: string): Promise<CheckAvailabilityResponse> => {
    const response = await apiClient.get<CheckAvailabilityResponse>(
      `/users/check-email?email=${email}`
    );
    return response.data;
  },

  checkUsername: async (username: string): Promise<CheckAvailabilityResponse> => {
    const response = await apiClient.get<CheckAvailabilityResponse>(
      `/users/check-username?username=${username}`
    );
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },
};
