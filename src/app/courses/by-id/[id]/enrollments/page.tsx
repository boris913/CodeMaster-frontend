'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Download } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CourseEnrollmentsPage() {
  const { id } = useParams();
  const [search, setSearch] = useState('');

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['course-enrollments', id],
    queryFn: () => coursesApi.getEnrollments(id as string),
  });

  const filtered = enrollments?.filter(e =>
    e.user?.username.toLowerCase().includes(search.toLowerCase()) ||
    e.user?.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inscriptions</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un étudiant..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} étudiant(s) inscrit(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={enrollment.user?.avatar} />
                    <AvatarFallback>
                      {enrollment.user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{enrollment.user?.username}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{enrollment.progress}%</div>
                    <div className="text-xs text-muted-foreground">progression</div>
                  </div>
                  <Badge variant={enrollment.completed ? 'default' : 'outline'}>
                    {enrollment.completed ? 'Terminé' : 'En cours'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Inscrit le {formatDate(enrollment.enrolledAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}