'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Heart, X } from 'lucide-react';

export default function DashboardSavedPage() {
  // Simulated – à remplacer par un vrai endpoint API
  const [savedCourses, setSavedCourses] = useState<string[]>([]);

  const { data: allCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll({ limit: 20 }),
  });

  const favorites = allCourses?.data.filter(c => savedCourses.includes(c.id)) || [];

  const removeFavorite = (id: string) => {
    setSavedCourses(prev => prev.filter(c => c !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bookmark className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Cours favoris</h1>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Aucun favori</p>
            <p className="text-sm text-muted-foreground">
              Ajoutez des cours à vos favoris pour les retrouver facilement
            </p>
            <Button className="mt-4" asChild>
              <a href="/courses">Explorer les cours</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map(course => (
            <Card key={course.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.shortDescription}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/courses/by-slug/${course.slug}`}>Voir</a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFavorite(course.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}