import { apiClient } from '@/lib/api-client';

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  videoUrl?: string;
  videoType?: 'YOUTUBE' | 'VIMEO' | 'UPLOADED';
  duration: number;
  order: number;
  isFree: boolean;
  moduleId: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
  lastPosition?: number;
}

export const lessonsApi = {
  // Récupérer une leçon par ID ou slug
  getByIdOrSlug: async (identifier: string): Promise<Lesson> => {
    const response = await apiClient.get<Lesson>(`/lessons/${identifier}`);
    return response.data;
  },

  // Marquer une leçon comme terminée
  markAsCompleted: async (lessonId: string): Promise<LessonProgress> => {
    const response = await apiClient.post<LessonProgress>(`/lessons/${lessonId}/complete`);
    return response.data;
  },

  // Mettre à jour la position de la vidéo
  updateVideoPosition: async (lessonId: string, position: number): Promise<LessonProgress> => {
    const response = await apiClient.post<LessonProgress>(`/lessons/${lessonId}/position`, { position });
    return response.data;
  },

  // Récupérer la progression d'une leçon
  getProgress: async (lessonId: string): Promise<LessonProgress> => {
    const response = await apiClient.get<LessonProgress>(`/progress/lesson/${lessonId}`);
    return response.data;
  },
};