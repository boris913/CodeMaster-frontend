import { apiClient } from '@/lib/api-client';

export interface CommunityCategory {
  id: string;
  name: string;
  description?: string;
  discussionCount: number;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  voteCount: number;
  answerCount: number;
  viewCount: number;
  isPinned: boolean;
  isSolved: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
  category?: CommunityCategory;
}

export interface Contributor {
  id: string;
  username: string;
  avatar?: string;
  answerCount: number;
  likeCount: number;
  discussionCount: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  participantCount: number;
  isOnline: boolean;
  location?: string;
  link?: string;
}

export interface CommunityStats {
  totalMembers: number;
  totalDiscussions: number;
  totalAnswers: number;
  resolutionRate: number;
}

export interface DiscussionFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: 'createdAt' | 'votes' | 'answers' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export const communityApi = {
  getCategories: async (): Promise<CommunityCategory[]> => {
    const response = await apiClient.get<CommunityCategory[]>('/community/categories');
    return response.data;
  },

  getDiscussions: async (filters: DiscussionFilters = {}): Promise<{ data: Discussion[]; meta: any }> => {
    const response = await apiClient.get<{ data: Discussion[]; meta: any }>('/community/discussions', {
      params: filters,
    });
    return response.data;
  },

  getDiscussion: async (id: string): Promise<Discussion> => {
    const response = await apiClient.get<Discussion>(`/community/discussions/${id}`);
    return response.data;
  },

  createDiscussion: async (data: { title: string; content: string; categoryId: string }): Promise<Discussion> => {
    const response = await apiClient.post<Discussion>('/community/discussions', data);
    return response.data;
  },

  voteDiscussion: async (discussionId: string): Promise<void> => {
    await apiClient.post(`/community/discussions/${discussionId}/vote`);
  },

  getTopContributors: async (limit: number = 5): Promise<Contributor[]> => {
    const response = await apiClient.get<Contributor[]>('/community/contributors/top', {
      params: { limit },
    });
    return response.data;
  },

  getUpcomingEvents: async (): Promise<CommunityEvent[]> => {
    const response = await apiClient.get<CommunityEvent[]>('/community/events/upcoming');
    return response.data;
  },

  getStats: async (): Promise<CommunityStats> => {
    const response = await apiClient.get<CommunityStats>('/community/stats');
    return response.data;
  },
};