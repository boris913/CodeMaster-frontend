export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type Language = 'JAVASCRIPT' | 'TYPESCRIPT' | 'PYTHON' | 'HTML' | 'CSS' | 'JAVA' | 'CPP';
export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type VideoType = 'YOUTUBE' | 'VIMEO' | 'UPLOADED';
export type SubmissionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'ERROR';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  duration: number;
  order: number;
  isFree?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order?: number;
  duration?: number;
  lessons?: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty: Difficulty;
  duration: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  instructorId: string;
  instructor: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  tags: Array<{ id: string; name: string }>;
  modules?: Module[];
  totalLessons: number;
  rating: number;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  starterCode: string;
  solution: string;
  tests: string;
  language: Language;
  difficulty: Difficulty;
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
  language: Language;
  status: SubmissionStatus;
  result?: any;
  executionTime?: number;
  memoryUsed?: number;
  passedTests: number;
  totalTests: number;
  userId: string;
  exerciseId: string;
  createdAt: string;
}