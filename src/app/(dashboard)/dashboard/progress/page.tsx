'use client';

import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function DashboardProgressPage() {
  const { data: userProgress, isLoading, isError } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => progressApi.getUserProgress(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Impossible de charger vos données de progression. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  // Transformer les données pour avoir le titre du cours et l'ID du cours
  const enrichedProgress = userProgress?.map(progress => {
    const courseId = progress.lesson?.module?.course?.id;
    const courseTitle = progress.lesson?.module?.course?.title || 'Cours inconnu';
    return {
      ...progress,
      courseId,
      courseTitle,
    };
  }) || [];

  // Calcul des statistiques globales
  const totalTimeSpentMinutes = userProgress?.reduce((acc, p) => acc + p.timeSpent, 0) || 0;
  const totalHours = totalTimeSpentMinutes / 60;
  
  // Pour la progression moyenne, on doit agréger par cours, car plusieurs leçons par cours.
  // Mais userProgress est une liste de leçons, pas une agrégation par cours.
  // On doit donc d'abord agréger par cours.
  const coursesMap = new Map();
  enrichedProgress.forEach(progress => {
    const courseId = progress.courseId;
    if (!courseId) return;
    if (!coursesMap.has(courseId)) {
      coursesMap.set(courseId, {
        courseId,
        courseTitle: progress.courseTitle,
        totalLessons: 0,
        completedLessons: 0,
        totalTimeSpent: 0,
        overallProgress: 0,
      });
    }
    const course = coursesMap.get(courseId);
    course.totalLessons++;
    if (progress.completed) {
      course.completedLessons++;
    }
    course.totalTimeSpent += progress.timeSpent;
  });

  // Calculer le pourcentage pour chaque cours
  coursesMap.forEach(course => {
    course.overallProgress = course.totalLessons > 0 
      ? Math.round((course.completedLessons / course.totalLessons) * 100) 
      : 0;
  });

  const coursesProgress = Array.from(coursesMap.values());

  const avgProgress = coursesProgress.length
    ? coursesProgress.reduce((acc, c) => acc + c.overallProgress, 0) / coursesProgress.length
    : 0;

  const stats = {
    totalHours,
    avgProgress,
    courseCount: coursesProgress.length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Progression globale</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Temps total</span>
            </div>
            <div className="mt-3 text-2xl font-bold">
              {Math.round(stats.totalHours)}min
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Progression moyenne</span>
            </div>
            <div className="mt-3 text-2xl font-bold">
              {Math.round(stats.avgProgress)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Cours suivis</span>
            </div>
            <div className="mt-3 text-2xl font-bold">
              {stats.courseCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail par cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {coursesProgress.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune progression pour le moment. Commencez un cours !
            </p>
          ) : (
            coursesProgress.map((course) => (
              <div key={course.courseId} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{course.courseTitle}</span>
                  <span>{course.overallProgress}%</span>
                </div>
                <Progress value={course.overallProgress} className="h-2" />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{course.completedLessons}/{course.totalLessons} leçons</span>
                  <span>⏱️ {formatDuration(course.totalTimeSpent)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}