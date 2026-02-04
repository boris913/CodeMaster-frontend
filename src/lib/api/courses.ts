import { apiClient } from '@/lib/api-client';

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructorId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  sortBy?: 'title' | 'createdAt' | 'rating' | 'totalStudents';
  sortOrder?: 'asc' | 'desc';
}

export interface Instructor {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  lessons?: Lesson[];
}

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
  exercise?: Exercise;
  comments?: Comment[];
}

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
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  instructorId: string;
  instructor: Instructor;
  tags: Array<{ id: string; name: string }>;
  modules: Module[];
  rating: number;
  totalStudents: number;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  enrolledAt: string;
  course: Course;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface CreateCourseData {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  tags?: string[];
}

export interface UpdateCourseData {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  tags?: string[];
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    lastLogin?: string;
  };
  progress: number;
  completed: boolean;
  completedAt?: string;
  enrolledAt: string;
}

export const coursesApi = {
  // Récupérer tous les cours
  getAll: async (filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<PaginatedResponse<Course>>('/courses', { params: filters });
    return response.data;
  },

  // Récupérer un cours par ID ou slug
  getByIdOrSlug: async (identifier: string): Promise<Course> => {
    const response = await apiClient.get<Course>(`/courses/${identifier}`);
    return response.data;
  },

  // Récupérer les cours d'un utilisateur courant
  getByInstructor: async (instructorId: string, filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<PaginatedResponse<Course>>('/courses/my-courses', {
      params: { ...filters, instructorId },
    });
    return response.data;
  },

  // Récupérer les cours auxquels l'utilisateur est inscrit
  getEnrolled: async (): Promise<Enrollment[]> => {
    const response = await apiClient.get<Enrollment[]>('/courses/enrolled');
    return response.data;
  },

  // S'inscrire à un cours
  enroll: async (courseId: string): Promise<Enrollment> => {
    const response = await apiClient.post<Enrollment>(`/courses/${courseId}/enroll`);
    return response.data;
  },

  // Se désinscrire d'un cours
  unenroll: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/enroll`);
  },

  // Mettre à jour la progression
  updateProgress: async (courseId: string, progress: number): Promise<Enrollment> => {
    const response = await apiClient.patch<Enrollment>(`/courses/${courseId}/progress`, { progress });
    return response.data;
  },

  // Récupérer les inscriptions d'un cours (instructeur/admin seulement)
  getEnrollments: async (courseId: string): Promise<Enrollment[]> => {
    const response = await apiClient.get<Enrollment[]>(`/courses/${courseId}/enrollments`);
    return response.data;
  },

  // Publier un cours
  publish: async (courseId: string): Promise<Course> => {
    const response = await apiClient.post<Course>(`/courses/${courseId}/publish`);
    return response.data;
  },

  // Dépublier un cours
  unpublish: async (courseId: string): Promise<Course> => {
    const response = await apiClient.post<Course>(`/courses/${courseId}/unpublish`);
    return response.data;
  },

  // Recherche de cours
  search: async (query: string, filters: Partial<CourseFilters> = {}): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<PaginatedResponse<Course>>('/courses', {
      params: { search: query, ...filters },
    });
    return response.data;
  },

    // Créer un cours
    create: async (data: CreateCourseData): Promise<Course> => {
      const response = await apiClient.post<Course>('/courses', data);
      return response.data;
    },
  
    // Mettre à jour un cours
    update: async (courseId: string, data: UpdateCourseData): Promise<Course> => {
      const response = await apiClient.patch<Course>(`/courses/${courseId}`, data);
      return response.data;
    },
  
    // Supprimer un cours
    delete: async (courseId: string): Promise<void> => {
      await apiClient.delete(`/courses/${courseId}`);
    },
};
