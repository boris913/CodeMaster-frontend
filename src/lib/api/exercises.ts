// src/lib/api/exercises.ts
//
// Service API pour les exercices — CodeMaster Frontend
// Couvre : création (via leçon), lecture, soumission, leaderboard, test instructor
//
// Adapté au pattern existant du projet (axios + intercepteur auth configuré dans src/lib/api/index.ts)
// BASE_URL = /api/v1 (versioning NestJS)

import { apiClient } from '@/lib/api-client'; // → axiosInstance configuré avec intercepteur JWT

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Language =
  | 'JAVASCRIPT'
  | 'TYPESCRIPT'
  | 'PYTHON'
  | 'HTML'
  | 'CSS'
  | 'JAVA'
  | 'CPP';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type SubmissionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'TIMEOUT'
  | 'ERROR';

export interface TestCase {
  id: string;
  description: string;
  code: string;
  points: number;
}

export interface CreateExercisePayload {
  title: string;
  instructions: string;         // Markdown
  starterCode: string;
  solution: string;
  tests: string;                // JSON.stringify(TestCase[])
  language: Language;
  difficulty?: Difficulty;
  hints?: string[];
  timeLimit?: number;           // secondes, défaut 30
  memoryLimit?: number;         // MB, défaut 128
  points?: number;              // défaut 10
  // lessonId optionnel ici : fourni en param URL via createExerciseForLesson
  lessonId?: string;
}

export interface UpdateExercisePayload extends Partial<CreateExercisePayload> {}

export interface ExerciseResponse {
  id: string;
  title: string;
  instructions: string;
  starterCode: string;
  language: Language;
  difficulty: Difficulty;
  hints: string[];
  timeLimit: number;
  memoryLimit: number;
  points: number;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  // solution et tests ne sont renvoyés que pour les instructeurs/admins
  solution?: string;
  tests?: string;
  lesson?: {
    id: string;
    title: string;
    module: {
      id: string;
      title: string;
      course: { id: string; title: string };
    };
  };
}

export interface TestResult {
  name?: string;
  passed: boolean;
  error?: string;
}

export interface ExecutionResult {
  output: string;
  error: string;
  executionTime: number;        // ms
  memoryUsed: number;           // KB
  passed: boolean;
  testResults: TestResult[];
}

export interface SubmitExercisePayload {
  code: string;
  language: Language;
  customInput?: string;
}

export interface SubmissionResponse {
  id: string;
  code: string;
  language: Language;
  status: SubmissionStatus;
  result: ExecutionResult | null;
  executionTime: number | null;
  memoryUsed: number | null;
  passedTests: number;
  totalTests: number;
  userId: string;
  exerciseId: string;
  createdAt: string;
}

export interface PaginatedSubmissions {
  data: SubmissionResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  passedTests: number;
  executionTime: number;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée un exercice via l'URL RESTful /exercises/lessons/:lessonId/exercise
 *
 * Route backend : POST /api/v1/exercises/lessons/:lessonId/exercise
 * Guards : JwtAuthGuard + RolesGuard (INSTRUCTOR | ADMIN)
 *
 * Le lessonId dans l'URL prend la priorité sur le body — c'est la route
 * appelée depuis la page /courses/by-id/[id]/modules/[mid]/lessons/[lid]/exercise/create
 */
export async function createExerciseForLesson(
  lessonId: string,
  payload: Omit<CreateExercisePayload, 'lessonId'>,
): Promise<ExerciseResponse> {
  // On ajoute lessonId au payload pour que la validation backend passe
  const fullPayload = { ...payload, lessonId };
  const { data } = await apiClient.post<ExerciseResponse>(
    `/exercises/lessons/${lessonId}/exercise`,
    fullPayload,
  );
  return data;
}

/**
 * Crée un exercice via la route générique (lessonId dans le body)
 *
 * Route backend : POST /api/v1/exercises
 * À utiliser si vous préférez passer le lessonId dans le body plutôt que l'URL.
 */
export async function createExercise(
  payload: CreateExercisePayload,
): Promise<ExerciseResponse> {
  const { data } = await apiClient.post<ExerciseResponse>(
    '/exercises',
    payload,
  );
  return data;
}

/**
 * Récupère un exercice par son ID
 *
 * Route backend : GET /api/v1/exercises/:id
 * Guards : JwtAuthGuard (solution/tests masqués pour les étudiants)
 */
export async function getExercise(
  exerciseId: string,
): Promise<ExerciseResponse> {
  const { data } = await apiClient.get<ExerciseResponse>(
    `/exercises/${exerciseId}`,
  );
  return data;
}

/**
 * Met à jour un exercice existant
 *
 * Route backend : PATCH /api/v1/exercises/:id
 * Guards : JwtAuthGuard + RolesGuard (INSTRUCTOR | ADMIN)
 */
export async function updateExercise(
  exerciseId: string,
  payload: UpdateExercisePayload,
): Promise<ExerciseResponse> {
  const { data } = await apiClient.patch<ExerciseResponse>(
    `/exercises/${exerciseId}`,
    payload,
  );
  return data;
}

/**
 * Supprime un exercice
 *
 * Route backend : DELETE /api/v1/exercises/:id
 * Guards : JwtAuthGuard + RolesGuard (INSTRUCTOR | ADMIN)
 */
export async function deleteExercise(exerciseId: string): Promise<void> {
  await apiClient.delete(`/exercises/${exerciseId}`);
}

/**
 * Soumet une solution à un exercice
 *
 * Route backend : POST /api/v1/exercises/:id/submit
 * Guards : JwtAuthGuard
 *
 * Retourne une submission avec status=PENDING immédiatement.
 * Pollez getSubmission() ou getSubmissions() pour le résultat final.
 */
export async function submitExercise(
  exerciseId: string,
  payload: SubmitExercisePayload,
): Promise<SubmissionResponse> {
  const { data } = await apiClient.post<SubmissionResponse>(
    `/exercises/${exerciseId}/submit`,
    payload,
  );
  return data;
}

/**
 * Récupère l'historique des soumissions d'un utilisateur pour un exercice
 *
 * Route backend : GET /api/v1/exercises/:id/submissions
 * Guards : JwtAuthGuard
 */
export async function getSubmissions(
  exerciseId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedSubmissions> {
  const { data } = await apiClient.get<PaginatedSubmissions>(
    `/exercises/${exerciseId}/submissions`,
    { params },
  );
  return data;
}

/**
 * Récupère le leaderboard d'un exercice
 *
 * Route backend : GET /api/v1/exercises/:id/leaderboard
 * Guards : JwtAuthGuard
 */
export async function getExerciseLeaderboard(
  exerciseId: string,
  limit?: number,
): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get<LeaderboardEntry[]>(
    `/exercises/${exerciseId}/leaderboard`,
    { params: { limit } },
  );
  return data;
}

/**
 * Teste du code contre les tests de l'exercice (instructeurs uniquement)
 *
 * Route backend : POST /api/v1/exercises/:id/test
 * Guards : JwtAuthGuard + RolesGuard (INSTRUCTOR | ADMIN)
 *
 * Utilisé dans la page de création pour valider la solution avant publication.
 */
export async function testExerciseCode(
  exerciseId: string,
  payload: { code: string; language: Language },
): Promise<ExecutionResult> {
  const { data } = await apiClient.post<ExecutionResult>(
    `/exercises/${exerciseId}/test`,
    payload,
  );
  return data;
}

/**
 * Récupère l'exercice associé à une leçon (null si aucun)
 *
 * Route backend : GET /api/v1/exercises/lessons/:lessonId
 * Guards : JwtAuthGuard
 *
 * Utilisé dans LearningPage pour afficher l'onglet exercice.
 * Le backend renvoie null/404 si la leçon n'a pas d'exercice —
 * on attrape le 404 pour retourner null proprement.
 */
export async function getExerciseByLesson(
  lessonId: string,
): Promise<ExerciseResponse | null> {
  try {
    const { data } = await apiClient.get<ExerciseResponse>(
      `/exercises/lessons/${lessonId}`,
    );
    return data;
  } catch (err: any) {
    // 404 = pas d'exercice pour cette leçon, ce n'est pas une erreur
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// exercisesApi — objet de compatibilité (même pattern que coursesApi, lessonsApi…)
// Importer depuis ce fichier : import { exercisesApi } from '@/lib/api/exercises'
// ─────────────────────────────────────────────────────────────────────────────
export const exercisesApi = {
  /** Récupère l'exercice lié à une leçon (null si aucun) */
  getByLesson: (lessonId: string) => getExerciseByLesson(lessonId),

  /** Récupère un exercice par son ID */
  getById: (exerciseId: string) => getExercise(exerciseId),

  /** Soumet une solution */
  submit: (exerciseId: string, payload: SubmitExercisePayload) =>
    submitExercise(exerciseId, payload),

  /** Récupère l'historique des soumissions */
  getSubmissions: (exerciseId: string, params?: { page?: number; limit?: number }) =>
    getSubmissions(exerciseId, params),

  /** Récupère le leaderboard */
  getLeaderboard: (exerciseId: string, limit?: number) =>
    getExerciseLeaderboard(exerciseId, limit),

  /** Crée un exercice via l'URL RESTful (INSTRUCTOR/ADMIN) */
  createForLesson: (lessonId: string, payload: Omit<CreateExercisePayload, 'lessonId'>) =>
    createExerciseForLesson(lessonId, payload),

  /** Met à jour un exercice (INSTRUCTOR/ADMIN) */
  update: (exerciseId: string, payload: UpdateExercisePayload) =>
    updateExercise(exerciseId, payload),

  /** Supprime un exercice (INSTRUCTOR/ADMIN) */
  delete: (exerciseId: string) => deleteExercise(exerciseId),

  /** Teste du code côté instructeur */
  testCode: (exerciseId: string, payload: { code: string; language: Language }) =>
    testExerciseCode(exerciseId, payload),
} as const;