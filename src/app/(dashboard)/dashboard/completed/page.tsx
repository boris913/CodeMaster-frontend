'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { CourseCard } from '@/components/course/course-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';

export default function DashboardCompletedPage() {
  const { data: enrollments } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: () => coursesApi.getEnrolled(),
  });

  const completed = enrollments?.filter(e => e.progress === 100) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cours terminés</h1>
        <Button variant="outline" disabled={completed.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exporter mes certificats
        </Button>
      </div>

      {completed.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Aucun cours terminé</p>
            <p className="text-sm text-muted-foreground">
              Continuez à apprendre et vous verrez vos réussites ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completed.map((enrollment) => (
            <div key={enrollment.id} className="relative">
              <CourseCard
                course={enrollment.course}
                showProgress
                progress={100}
              />
              <div className="absolute top-2 right-2">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Terminé
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}