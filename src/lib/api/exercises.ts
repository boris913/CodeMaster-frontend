import { apiClient } from '@/lib/api-client';

export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  starterCode: string;
  solution: string;
  tests: string;
  language: 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  hints: string[];
  timeLimit: number;
  memoryLimit: number;
  points: number;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  code: string;
  language: 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP';
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'ERROR';
  result?: any;
  executionTime?: number;
  memoryUsed?: number;
  passedTests: number;
  totalTests: number;
  userId: string;
  exerciseId: string;
  createdAt: string;
}

export interface SubmitExerciseData {
  code: string;
  language: 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP';
  customInput?: string;
}

export const exercisesApi = {
  // Récupérer un exercice par ID
  getById: async (id: string): Promise<Exercise> => {
    const response = await apiClient.get<Exercise>(`/exercises/${id}`);
    return response.data;
  },

  // Soumettre une solution
  submit: async (exerciseId: string, data: SubmitExerciseData): Promise<Submission> => {
    const response = await apiClient.post<Submission>(`/exercises/${exerciseId}/submit`, data);
    return response.data;
  },

  // Récupérer les soumissions d'un utilisateur
  getSubmissions: async (
    exerciseId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Submission[]; meta: any }> => {
    const response = await apiClient.get<{ data: Submission[]; meta: any }>(`/exercises/${exerciseId}/submissions`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Récupérer le classement
  getLeaderboard: async (exerciseId: string, limit: number = 20): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/exercises/${exerciseId}/leaderboard`, {
      params: { limit },
    });
    return response.data;
  },

  // Tester un exercice (instructeur seulement)
  testExercise: async (
    exerciseId: string,
    code: string,
    language: 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP'
  ): Promise<any> => {
    const response = await apiClient.post(`/exercises/${exerciseId}/test`, { code, language });
    return response.data;
  },

  // Récupérer un exercice par leçon
  getByLesson: async (lessonId: string): Promise<Exercise> => {
    const response = await apiClient.get<Exercise>(`/exercises/lesson/${lessonId}`);
    return response.data;
  },
};