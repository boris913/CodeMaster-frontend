'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { useAuthStore } from '@/stores/authStore';
import { CourseCard } from '@/components/course/course-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Calendar,
  Play,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function MyCoursesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('in-progress');

  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: () => coursesApi.getEnrolled(),
    enabled: isAuthenticated,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => progressApi.getRecentActivity(5),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Connectez-vous pour voir vos cours</h3>
            <p className="text-muted-foreground mt-2">
              Inscrivez-vous ou connectez-vous pour accéder à vos cours
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={() => router.push('/login')}>Se connecter</Button>
              <Button variant="outline" onClick={() => router.push('/register')}>
                S'inscrire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inProgressCourses = enrollments?.filter(e => e.progress < 100) || [];
  const completedCourses = enrollments?.filter(e => e.progress === 100) || [];
  const totalCourses = enrollments?.length || 0;
  const averageProgress = enrollments?.reduce((acc, e) => acc + e.progress, 0) / totalCourses || 0;

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Mes cours
        </h1>
        <p className="text-muted-foreground">
          Continuez votre apprentissage là où vous vous êtes arrêté
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cours suivis</p>
                <div className="text-2xl font-bold">{totalCourses}</div>
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
                <p className="text-sm text-muted-foreground">Progression moyenne</p>
                <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <div className="text-2xl font-bold">{inProgressCourses.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminés</p>
                <div className="text-2xl font-bold">{completedCourses.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Liste des cours */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="in-progress">
                En cours ({inProgressCourses.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Terminés ({completedCourses.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Tous les cours ({totalCourses})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoadingEnrollments ? (
                <div className="text-center py-12">
                  <div className="animate-pulse">Chargement...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === 'in-progress' ? inProgressCourses :
                    activeTab === 'completed' ? completedCourses : enrollments)?.map((enrollment) => (
                    <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{enrollment.course.title}</h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{enrollment.course.duration} heures</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Inscrit le {new Date(enrollment.enrolledAt).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Progression</span>
                                    <span className="font-medium">{enrollment.progress}%</span>
                                  </div>
                                  <Progress value={enrollment.progress} className="h-2" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => router.push(`/learn/${enrollment.courseId}/start`)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Continuer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/courses/${enrollment.course.slug}`)}
                            >
                              Détails
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activités récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
              <CardDescription>
                Votre historique d'apprentissage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity?.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.updatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.completed ? 'Terminé' : `${activity.timeSpent} min`}
                    </Badge>
                  </div>
                ))}
                {recentActivity?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle>Continuer à apprendre</CardTitle>
              <CardDescription>
                Reprenez votre progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inProgressCourses.slice(0, 2).map((enrollment) => (
                <div key={enrollment.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{enrollment.course.title}</h4>
                    <span className="text-xs font-medium">{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-1.5" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => router.push(`/learn/${enrollment.courseId}/start`)}
                  >
                    <Play className="mr-2 h-3 w-3" />
                    Reprendre
                  </Button>
                </div>
              ))}
              {inProgressCourses.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Commencez un nouveau cours !
                  </p>
                  <Button size="sm" onClick={() => router.push('/courses')}>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Explorer les cours
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}