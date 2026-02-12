'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminCoursesPage() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses', search],
    queryFn: () => coursesApi.getAll({ search, isPublished: undefined, limit: 50 }),
  });

  const publishMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.publish(courseId),
    onSuccess: () => toast({ title: 'Cours publié' }),
  });

  const unpublishMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.unpublish(courseId),
    onSuccess: () => toast({ title: 'Cours dépublié' }),
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Modération des cours</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un cours..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{courses?.meta?.total || 0} cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses?.data.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{course.title}</span>
                    <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                      {course.isPublished ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {course.instructor?.username} • {course.totalStudents} étudiants • ⭐ {course.rating}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/courses/by-slug/${course.slug}`}>
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  {course.isPublished ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unpublishMutation.mutate(course.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Dépublier
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => publishMutation.mutate(course.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Publier
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}