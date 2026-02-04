import { apiClient } from '@/lib/api-client';

export interface Notification {
  id: string;
  type: 'SYSTEM' | 'COURSE' | 'EXERCISE' | 'COMMENT' | 'ACHIEVEMENT';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationsApi = {
  // Récupérer toutes les notifications
  getAll: async (filters: NotificationFilters = {}): Promise<PaginatedNotifications> => {
    const response = await apiClient.get<PaginatedNotifications>('/notifications', { 
      params: filters 
    });
    return response.data;
  },

  // Récupérer une notification spécifique
  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  // Marquer comme lu
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  // Marquer toutes comme lues
  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await apiClient.patch<{ count: number }>('/notifications/read-all');
    return response.data;
  },

  // Supprimer une notification
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Supprimer toutes les notifications
  deleteAll: async (readOnly?: boolean): Promise<{ count: number }> => {
    const response = await apiClient.delete<{ count: number }>('/notifications', { 
      params: { readOnly } 
    });
    return response.data;
  },

  // Compter les non lues
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  // Créer une notification (admin/instructeur seulement)
  create: async (data: {
    type: 'SYSTEM' | 'COURSE' | 'EXERCISE' | 'COMMENT' | 'ACHIEVEMENT';
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> => {
    const response = await apiClient.post<Notification>('/notifications', data);
    return response.data;
  },

  // Envoyer une notification système (admin seulement)
  sendSystemNotification: async (data: {
    userIds: string[];
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<void> => {
    await apiClient.post('/notifications/system', data);
  },
};