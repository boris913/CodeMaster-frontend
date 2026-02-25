'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { coursesApi } from '@/lib/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Download, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CourseEnrollmentsPage() {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { data: enrollments, isLoading, error } = useQuery({
    queryKey: ['course-enrollments', id],
    queryFn: () => coursesApi.getEnrollments(id as string),
  });

  const filtered = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.filter(e =>
      e.user?.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      e.user?.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [enrollments, debouncedSearch]);

  const escapeCSV = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const exportToCSV = () => {
    if (!enrollments || enrollments.length === 0) return;

    const headers = ['Nom d\'utilisateur', 'Email', 'Progression', 'Statut', 'Date d\'inscription'];
    const rows = enrollments.map(e => [
      escapeCSV(e.user?.username || ''),
      escapeCSV(e.user?.email || ''),
      `${e.progress}%`,
      e.completed ? 'Terminé' : 'En cours',
      escapeCSV(formatDate(e.enrolledAt)),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscriptions_cours_${id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des inscriptions. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inscriptions</h1>
        <Button variant="outline" onClick={exportToCSV} disabled={!enrollments?.length}>
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
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun étudiant trouvé
              </p>
            ) : (
              filtered.map((enrollment) => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}