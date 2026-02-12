'use client';

import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function DashboardProgressPage() {
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => progressApi.getUserProgress(),
  });

  const stats = {
    totalHours: (userProgress?.reduce((acc, p) => acc + p.totalTimeSpent, 0) || 0) / 60,
    avgProgress: userProgress?.length
      ? userProgress.reduce((acc, p) => acc + p.overallProgress, 0) / userProgress.length
      : 0,
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
              {Math.round(stats.totalHours)}h
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
              {userProgress?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail par cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {userProgress?.map((course) => (
            <div key={course.courseId} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{course.courseId}</span>
                <span>{course.overallProgress}%</span>
              </div>
              <Progress value={course.overallProgress} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{course.completedLessons}/{course.totalLessons} leçons</span>
                <span>⏱️ {formatDuration(course.totalTimeSpent * 60)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}