'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  Edit, 
  Users, 
  BarChart3,
  Calendar,
  BookOpen,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('published');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses', activeTab, statusFilter, search],
    queryFn: () => coursesApi.getByInstructor(user?.id || '', {
      isPublished: activeTab === 'published' ? true : activeTab === 'drafts' ? false : undefined,
      search: search || undefined,
    }),
    enabled: !!user?.id,
  });

  const stats = {
    total: courses?.data.length || 0,
    published: courses?.data.filter(c => c.isPublished).length || 0,
    drafts: courses?.data.filter(c => !c.isPublished).length || 0,
    students: courses?.data.reduce((acc, course) => acc + course.totalStudents, 0) || 0,
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Mes cours
            </h1>
            <p className="text-muted-foreground">
              Gérez et suivez la performance de vos cours
            </p>
          </div>
          <Button onClick={() => router.push('/courses/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau cours
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publiés</p>
                <div className="text-2xl font-bold">{stats.published}</div>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Brouillons</p>
                <div className="text-2xl font-bold">{stats.drafts}</div>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Edit className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <div className="text-2xl font-bold">{stats.students}</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="drafts">Brouillons</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des cours */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous ({stats.total})</TabsTrigger>
          <TabsTrigger value="published">Publiés ({stats.published})</TabsTrigger>
          <TabsTrigger value="drafts">Brouillons ({stats.drafts})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Chargement...</div>
            </div>
          ) : courses?.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucun cours trouvé</h3>
                <p className="text-muted-foreground mt-2">
                  {activeTab === 'published' 
                    ? 'Vous n\'avez pas encore publié de cours'
                    : activeTab === 'drafts'
                    ? 'Vous n\'avez pas de brouillons'
                    : 'Commencez par créer votre premier cours'}
                </p>
                <Button className="mt-4" onClick={() => router.push('/courses/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un cours
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {courses?.data.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{course.title}</h3>
                              <div className="flex gap-1">
                                {course.isPublished ? (
                                  <Badge variant="default">Publié</Badge>
                                ) : (
                                  <Badge variant="secondary">Brouillon</Badge>
                                )}
                                {course.isFeatured && (
                                  <Badge variant="outline">⭐ Vedette</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.shortDescription}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{course.duration} heures</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{course.totalStudents} étudiants</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(course.updatedAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/courses/${course.slug}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/courses/${course.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Éditer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/courses/${course.id}/analytics`)}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Stats
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}