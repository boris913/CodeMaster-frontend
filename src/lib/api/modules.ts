import { apiClient } from '@/lib/api-client';

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  lessons?: Array<{
    id: string;
    title: string;
    slug: string;
    duration: number;
    order: number;
    isFree: boolean;
    _count: {
      comments: number;
    };
  }>;
  _count?: {
    lessons: number;
  };
}

export interface CreateModuleData {
  title: string;
  description?: string;
  duration?: number;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  duration?: number;
}

export const modulesApi = {
  // Récupérer tous les modules d'un cours
  getByCourse: async (courseId: string): Promise<Module[]> => {
    const response = await apiClient.get<Module[]>(`/courses/${courseId}/modules`);
    return response.data;
  },

  // Récupérer un module par ID
  getById: async (courseId: string, moduleId: string): Promise<Module> => {
    const response = await apiClient.get<Module>(`/courses/${courseId}/modules/${moduleId}`);
    return response.data;
  },

  // Créer un module
  create: async (courseId: string, data: CreateModuleData): Promise<Module> => {
    const response = await apiClient.post<Module>(`/courses/${courseId}/modules`, data);
    return response.data;
  },

  // Mettre à jour un module
  update: async (courseId: string, moduleId: string, data: UpdateModuleData): Promise<Module> => {
    const response = await apiClient.patch<Module>(`/courses/${courseId}/modules/${moduleId}`, data);
    return response.data;
  },

  // Supprimer un module
  delete: async (courseId: string, moduleId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/modules/${moduleId}`);
  },

  // Réorganiser les modules
  reorder: async (courseId: string, moduleIds: string[]): Promise<Module[]> => {
    const response = await apiClient.put<Module[]>(`/courses/${courseId}/modules/reorder`, { moduleIds });
    return response.data;
  },

  // Calculer la durée d'un module
  calculateDuration: async (moduleId: string): Promise<number> => {
    const response = await apiClient.post<number>(`/modules/${moduleId}/calculate-duration`);
    return response.data;
  },
};