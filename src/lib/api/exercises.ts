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
  lesson?: {
    id: string;
    title: string;
    module: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  submissions?: Array<{
    id: string;
    status: string;
    passedTests: number;
    totalTests: number;
    createdAt: string;
  }>;
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
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  exercise?: {
    id: string;
    title: string;
    lesson: {
      module: {
        course: {
          id: string;
          title: string;
        };
      };
    };
  };
}

export interface SubmitExerciseData {
  code: string;
  language: 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP';
  customInput?: string;
}

export interface CreateExerciseData {
  title: string;
  instructions: string;
  starterCode: string;
  solution: string;
  tests: string;
  language: 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  hints?: string[];
  timeLimit?: number;
  memoryLimit?: number;
  points?: number;
  lessonId: string;
}

export interface UpdateExerciseData {
  title?: string;
  instructions?: string;
  starterCode?: string;
  solution?: string;
  tests?: string;
  language?: 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP';
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  hints?: string[];
  timeLimit?: number;
  memoryLimit?: number;
  points?: number;
}

export interface TestResult {
  name?: string;
  passed?: boolean;
  error?: string;
}

export interface ExecutionResult {
  output: string;
  error: string;
  executionTime: number;
  memoryUsed: number;
  passed: boolean;
  testResults?: TestResult[];
}

export const exercisesApi = {
  // Récupérer un exercice par ID
  getById: async (id: string): Promise<Exercise> => {
    const response = await apiClient.get<Exercise>(`/exercises/${id}`);
    return response.data;
  },

  // Récupérer un exercice par leçon
  getByLesson: async (lessonId: string): Promise<Exercise> => {
    const response = await apiClient.get<Exercise>(`/exercises/lesson/${lessonId}`);
    return response.data;
  },

  // Créer un exercice
  create: async (data: CreateExerciseData): Promise<Exercise> => {
    const response = await apiClient.post<Exercise>('/exercises', data);
    return response.data;
  },

  // Mettre à jour un exercice
  update: async (id: string, data: UpdateExerciseData): Promise<Exercise> => {
    const response = await apiClient.patch<Exercise>(`/exercises/${id}`, data);
    return response.data;
  },

  // Supprimer un exercice
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/exercises/${id}`);
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
  ): Promise<ExecutionResult> => {
    const response = await apiClient.post<ExecutionResult>(`/exercises/${exerciseId}/test`, { code, language });
    return response.data;
  },
};