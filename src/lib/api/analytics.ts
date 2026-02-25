import { apiClient } from '../api-client';

export interface EnrollmentTrendPoint {
  period: string;
  count: number;
}

export interface ModuleCompletion {
  moduleId: string;
  title: string;
  completionRate: number;
}

export interface CourseAnalytics {
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalTimeSpent: number; // en minutes
  enrollmentTrend: EnrollmentTrendPoint[];
  moduleCompletion: ModuleCompletion[];
}

export const analyticsApi = {
  getCourseAnalytics: async (courseId: string): Promise<CourseAnalytics> => {
    const response = await apiClient.get<CourseAnalytics>(`/courses/${courseId}/analytics`);
    return response.data;
  },
};