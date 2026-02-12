'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { CourseCard } from '@/components/course/course-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp } from 'lucide-react';

export default function DashboardCurrentPage() {
  const { data: enrollments } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: () => coursesApi.getEnrolled(),
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => progressApi.getRecentActivity(5),
  });

  const inProgress = enrollments?.filter(e => e.progress > 0 && e.progress < 100) || [];
  const lastActivity = recentActivity?.[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">En cours d'apprentissage</h1>

      {lastActivity && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dernière activité</p>
                <p className="text-lg font-medium mt-1">{lastActivity.lessonTitle}</p>
                <p className="text-sm text-muted-foreground">{lastActivity.courseTitle}</p>
              </div>
              <Button asChild>
                <a href={`/learn/${lastActivity.courseId}/${lastActivity.lessonId}`}>
                  <Play className="mr-2 h-4 w-4" />
                  Reprendre
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {inProgress.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Aucun cours en cours</p>
            <p className="text-sm text-muted-foreground">
              Commencez un nouveau cours dès maintenant
            </p>
            <Button className="mt-4" asChild>
              <a href="/courses">Explorer les cours</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inProgress.map((enrollment) => (
            <CourseCard
              key={enrollment.id}
              course={enrollment.course}
              showProgress
              progress={enrollment.progress}
            />
          ))}
        </div>
      )}
    </div>
  );
}