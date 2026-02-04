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
  module?: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      instructorId: string;
      isPublished: boolean;
    };
  };
  exercise?: {
    id: string;
    title: string;
    language: string;
    difficulty: string;
  };
  _count?: {
    comments: number;
    progress: number;
  };
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
  lastPosition?: number;
  lesson?: {
    id: string;
    title: string;
    module: {
      id: string;
      title: string;
      courseId: string;
    };
  };
}

export interface CreateLessonData {
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  isFree?: boolean;
}

export interface UpdateLessonData {
  title?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  isFree?: boolean;
}

export const lessonsApi = {
  // Récupérer une leçon par ID ou slug
  getByIdOrSlug: async (identifier: string): Promise<Lesson> => {
    const response = await apiClient.get<Lesson>(`/lessons/${identifier}`);
    return response.data;
  },

  // Récupérer toutes les leçons d'un module
  getByModule: async (moduleId: string): Promise<Lesson[]> => {
    const response = await apiClient.get<Lesson[]>(`/modules/${moduleId}/lessons`);
    return response.data;
  },

  // Créer une leçon
  create: async (moduleId: string, data: CreateLessonData): Promise<Lesson> => {
    const response = await apiClient.post<Lesson>(`/modules/${moduleId}/lessons`, data);
    return response.data;
  },

  // Mettre à jour une leçon
  update: async (lessonId: string, data: UpdateLessonData): Promise<Lesson> => {
    const response = await apiClient.patch<Lesson>(`/lessons/${lessonId}`, data);
    return response.data;
  },

  // Supprimer une leçon
  delete: async (lessonId: string): Promise<void> => {
    await apiClient.delete(`/lessons/${lessonId}`);
  },

  // Réorganiser les leçons
  reorder: async (moduleId: string, lessonIds: string[]): Promise<Lesson[]> => {
    const response = await apiClient.put<Lesson[]>(`/modules/${moduleId}/lessons/reorder`, { lessonIds });
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