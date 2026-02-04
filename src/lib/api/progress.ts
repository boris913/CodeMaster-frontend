import { apiClient } from '@/lib/api-client';

export interface ModuleProgress {
  id: string;
  title: string;
  order: number;
  lessons: Array<{
    id: string;
    title: string;
    slug: string;
    duration: number;
    order: number;
    completed: boolean;
    completedAt?: string;
    timeSpent: number;
    lastPosition?: number;
  }>;
  completedLessons: number;
  totalLessons: number;
  progress: number;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  totalTimeSpent: number;
  modules: ModuleProgress[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  completedLessons: number;
  totalLessons: number;
  progress: number;
  enrolledAt: string;
  lastActivity: string;
}

export const progressApi = {
  // Récupérer la progression de l'utilisateur
  getUserProgress: async (courseId?: string): Promise<any[]> => {
    const response = await apiClient.get('/progress', {
      params: { courseId },
    });
    return response.data;
  },

  // Récupérer la progression d'un cours
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await apiClient.get(`/progress/course/${courseId}`);
    return response.data;
  },

  // Mettre à jour la progression d'une leçon
  updateLessonProgress: async (
    lessonId: string,
    data: {
      completed?: boolean;
      timeSpent?: number;
      lastPosition?: number;
    }
  ): Promise<any> => {
    const response = await apiClient.post(`/progress/lesson/${lessonId}`, data);
    return response.data;
  },

  // Récupérer les activités récentes - CORRECTION DE L'ENDPOINT
  getRecentActivity: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get('/progress/recent', {
      params: { limit },
    });
    return response.data;
  },

  // Récupérer le classement d'un cours
  getLeaderboard: async (courseId: string, limit: number = 10): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get(`/progress/leaderboard/${courseId}`, {
      params: { limit },
    });
    return response.data;
  },

  // Récupérer la progression d'une leçon
  getLessonProgress: async (lessonId: string): Promise<any> => {
    const response = await apiClient.get(`/progress/lesson/${lessonId}`);
    return response.data;
  },
};
