import { apiClient } from '@/lib/api-client';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  lessonId: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  };
  replies: Comment[];
}

export interface CreateCommentData {
  content: string;
  lessonId: string;
  parentId?: string;
}

export const commentsApi = {
  // Récupérer les commentaires d'une leçon
  getByLesson: async (
    lessonId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Comment[]; meta: any }> => {
    const response = await apiClient.get<{ data: Comment[]; meta: any }>(`/comments/lesson/${lessonId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Créer un commentaire
  create: async (data: CreateCommentData): Promise<Comment> => {
    const response = await apiClient.post<Comment>('/comments', data);
    return response.data;
  },

  // Répondre à un commentaire
  reply: async (commentId: string, data: CreateCommentData): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/comments/${commentId}/reply`, data);
    return response.data;
  },

  // Mettre à jour un commentaire
  update: async (commentId: string, content: string): Promise<Comment> => {
    const response = await apiClient.patch<Comment>(`/comments/${commentId}`, { content });
    return response.data;
  },

  // Supprimer un commentaire
  delete: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
