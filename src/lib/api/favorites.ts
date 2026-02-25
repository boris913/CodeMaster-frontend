import { apiClient } from '../api-client';
import { Course } from './courses';

export interface Favorite {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  course: Course;
}

export const favoritesApi = {
  /**
   * Récupère la liste des cours favoris de l'utilisateur connecté.
   */
  getFavorites: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/favorites');
    return response.data;
  },

  /**
   * Ajoute un cours aux favoris.
   * @param courseId Identifiant du cours
   */
  addFavorite: async (courseId: string): Promise<void> => {
    await apiClient.post(`/favorites/${courseId}`);
  },

  /**
   * Retire un cours des favoris.
   * @param courseId Identifiant du cours
   */
  removeFavorite: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/favorites/${courseId}`);
  },
};