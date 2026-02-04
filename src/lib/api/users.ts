import { apiClient } from '@/lib/api-client';

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
  githubId?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  stats?: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalSubmissions: number;
    averageExerciseScore: number;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
}

export interface UserStats {
  userId: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalSubmissions: number;
  successfulSubmissions: number;
  averageExerciseScore: number;
  totalTimeSpent: number;
}

export interface UserEnrollment {
  id: string;
  courseId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    instructor: {
      id: string;
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    tags: Array<{ id: string; name: string }>;
    totalLessons: number;
  };
}

export const usersApi = {
  // Récupérer le profil de l'utilisateur connecté
  me: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/me');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/users/me', data);
    return response.data;
  },

  // Télécharger un avatar
  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.put<UserProfile>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer l'avatar
  deleteAvatar: async (): Promise<UserProfile> => {
    const response = await apiClient.delete<UserProfile>('/users/me/avatar');
    return response.data;
  },

  // Récupérer les statistiques de l'utilisateur
  getStats: async (userId: string): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>(`/users/${userId}/stats`);
    return response.data;
  },

  // Récupérer les inscriptions de l'utilisateur
  getEnrollments: async (userId: string, page: number = 1, limit: number = 10): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}/enrollments`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Récupérer les soumissions de l'utilisateur
  getSubmissions: async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}/submissions`, {
      params: { page, limit, status },
    });
    return response.data;
  },

    // Rechercher des utilisateurs (admin seulement)
    search: async (query: string, page: number = 1, limit: number = 20): Promise<any> => {
      const response = await apiClient.get(`/users/search`, {
        params: { query, page, limit },
      });
      return response.data;
    },
  
    // Mettre à jour le rôle d'un utilisateur (admin seulement)
    updateRole: async (userId: string, data: { role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' }): Promise<UserProfile> => {
      const response = await apiClient.patch<UserProfile>(`/users/${userId}/role`, data);
      return response.data;
    },
  
    // Désactiver/réactiver un compte (admin seulement)
    toggleActiveStatus: async (userId: string, isActive: boolean): Promise<UserProfile> => {
      const response = await apiClient.patch<UserProfile>(`/users/${userId}/status`, { isActive });
      return response.data;
    },
  
    // Supprimer définitivement un utilisateur (admin seulement)
    delete: async (userId: string): Promise<void> => {
      await apiClient.delete(`/users/${userId}`);
    },
  
    // Vérifier la disponibilité d'un email
    checkEmail: async (email: string): Promise<{ available: boolean }> => {
      const response = await apiClient.get<{ available: boolean }>(`/users/check-email/${email}`);
      return response.data;
    },
  
    // Vérifier la disponibilité d'un nom d'utilisateur
    checkUsername: async (username: string): Promise<{ available: boolean }> => {
      const response = await apiClient.get<{ available: boolean }>(`/users/check-username/${username}`);
      return response.data;
    },
};
