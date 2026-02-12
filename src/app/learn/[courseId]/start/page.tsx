// src/app/learn/[courseId]/start/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { Loader2 } from 'lucide-react';

export default function CourseStartPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  // 1. Vérifier l'authentification
//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       router.push(`/login?redirect=/learn/${courseId}/start`);
//     }
//   }, [isAuthenticated, authLoading, router, courseId]);

  // 2. Récupérer les inscriptions de l'utilisateur
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => coursesApi.getEnrolled(),
    enabled: isAuthenticated,
  });

  // 3. Récupérer les détails du cours (pour obtenir les modules/leçons si besoin)
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getByIdOrSlug(courseId),
    enabled: !!courseId,
  });

  // 4. Récupérer la progression détaillée du cours (si l'utilisateur est inscrit)
  const isEnrolled = enrollments?.some((e) => e.courseId === courseId);
  const { data: courseProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressApi.getCourseProgress(courseId),
    enabled: isAuthenticated && isEnrolled,
  });

  // Logique de redirection
  useEffect(() => {
    if (authLoading || enrollmentsLoading || courseLoading || progressLoading) {
      return; // Attendre que toutes les données soient chargées
    }

    // Vérifier si l'utilisateur est inscrit
    if (!isEnrolled) {
      // Option : rediriger vers la page du cours pour permettre l'inscription
      router.push(`/courses/by-slug/${courseId}`);
      return;
    }

    // Déterminer la leçon vers laquelle rediriger
    let targetLessonId: string | null = null;

    // 1. Si l'utilisateur a déjà une progression, reprendre la dernière activité
    if (courseProgress?.lastActivity?.lessonId) {
      targetLessonId = courseProgress.lastActivity.lessonId;
    }
    // 2. Sinon, trouver la première leçon non terminée (ou la première leçon du cours)
    else if (course?.modules && course.modules.length > 0) {
      const firstModule = course.modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        targetLessonId = firstModule.lessons[0].id;
      }
    }

    // Si aucune leçon n'est trouvée, rediriger vers la page du cours
    if (!targetLessonId) {
      router.push(`/courses/by-slug/${courseId}`);
      return;
    }

    // Rediriger vers la page d'apprentissage de la leçon
    router.push(`/learn/${courseId}/${targetLessonId}`);
  }, [
    authLoading,
    enrollmentsLoading,
    courseLoading,
    progressLoading,
    isEnrolled,
    courseProgress,
    course,
    courseId,
    router,
  ]);

  // Affichage pendant le chargement
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Préparation de votre apprentissage...
        </p>
      </div>
    </div>
  );
}