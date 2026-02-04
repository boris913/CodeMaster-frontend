export * from './auth';
export * from './client';
export * from './comments';
export * from './courses';
export * from './exercises';
export * from './lessons';
export * from './modules';
export * from './notifications';
export * from './progress';
export * from './users';

// Types globaux
export type { LoginCredentials, RegisterData, AuthResponse, UserProfile } from './auth';
export type { Course, CourseFilters, Enrollment } from './courses';
export type { Exercise, Submission } from './exercises';
export type { Lesson, LessonProgress } from './lessons';
export type { Module } from './modules';
export type { Notification } from './notifications';
export type { CourseProgress, LeaderboardEntry } from './progress';
export type { UserProfile as User } from './users';