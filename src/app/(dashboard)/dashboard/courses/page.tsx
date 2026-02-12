'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { useAuthStore } from '@/stores/authStore';
import { CourseCard } from '@/components/course/course-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function DashboardCoursesPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: () => coursesApi.getEnrolled(),
    enabled: !!user,
  });

  const filtered = enrollments?.filter(e =>
    e.course.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tous ({enrollments?.length || 0})</TabsTrigger>
          <TabsTrigger value="in-progress">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Aucun cours trouvé</p>
                <p className="text-sm text-muted-foreground">
                  {search ? 'Essayez un autre terme' : 'Commencez par explorer le catalogue'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showProgress
                  progress={enrollment.progress}
                />
              ))}
            </div>
          )}
        </TabsContent>
        {/* autres onglets similaires */}
      </Tabs>
    </div>
  );
}