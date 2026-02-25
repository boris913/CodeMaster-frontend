'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/lib/api/favorites';
import { CourseCard } from '@/components/course/course-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';

export default function DashboardSavedPage() {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading, isError } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getFavorites(),
  });

  const removeFavorite = useMutation({
    mutationFn: (courseId: string) => favoritesApi.removeFavorite(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (isError) return <div>Erreur de chargement</div>;

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Mes cours favoris</h1>
      {favorites?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg">Aucun favori pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites?.map((course) => (
            <div key={course.id} className="relative">
              <CourseCard course={course} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeFavorite.mutate(course.id)}
                disabled={removeFavorite.isPending}
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}