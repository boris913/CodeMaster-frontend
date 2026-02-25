'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api/progress';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  Trophy,
  Award,
  BookOpen,
  Code2,
  Users,
  Activity,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function StatsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Récupérer toutes les progressions par leçon
  const { data: allProgress, isLoading: isLoadingProgress, isError: isErrorProgress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => progressApi.getUserProgress(),
    enabled: !!user,
  });

  const { data: userStats, isLoading: isLoadingStats, isError: isErrorStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => usersApi.getStats(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: recentActivity, isLoading: isLoadingActivity, isError: isErrorActivity } = useQuery({
    queryKey: ['recent-activity-stats'],
    queryFn: () => progressApi.getRecentActivity(20),
    enabled: !!user,
  });

  // Regrouper les progressions par cours
  const coursesProgress = useMemo(() => {
    if (!allProgress) return [];

    const coursesMap = new Map();
    allProgress.forEach(p => {
      const course = p.lesson?.module?.course;
      if (!course) return;

      const courseId = course.id;
      if (!coursesMap.has(courseId)) {
        coursesMap.set(courseId, {
          courseId,
          courseTitle: course.title,
          lessons: [],
        });
      }
      coursesMap.get(courseId).lessons.push(p);
    });

    return Array.from(coursesMap.values()).map(course => {
      const totalLessons = course.lessons.length;
      const completedLessons = course.lessons.filter(l => l.completed).length;
      const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return {
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        totalLessons,
        completedLessons,
        overallProgress,
      };
    });
  }, [allProgress]);

  // Statistiques globales
  const overallStats = useMemo(() => {
    const totalCourses = coursesProgress.length;
    const completedCourses = coursesProgress.filter(c => c.overallProgress === 100).length;
    const totalTime = allProgress?.reduce((acc, p) => acc + p.timeSpent, 0) || 0;
    const avgProgress = totalCourses > 0
      ? coursesProgress.reduce((acc, c) => acc + c.overallProgress, 0) / totalCourses
      : 0;

    return {
      totalCourses,
      completedCourses,
      totalTime,
      averageProgress: avgProgress,
    };
  }, [coursesProgress, allProgress]);

  // Statistiques de temps
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  const dailyTotal = recentActivity?.filter(a => 
    new Date(a.updatedAt) > new Date(now.getTime() - oneDay)
  ).reduce((sum, a) => sum + a.timeSpent, 0) || 0;

  const weeklyTotal = recentActivity?.filter(a => 
    new Date(a.updatedAt) > new Date(now.getTime() - oneWeek)
  ).reduce((sum, a) => sum + a.timeSpent, 0) || 0;

  const monthlyTotal = recentActivity?.filter(a => 
    new Date(a.updatedAt) > new Date(now.getTime() - oneMonth)
  ).reduce((sum, a) => sum + a.timeSpent, 0) || 0;

  const timeStats = {
    daily: dailyTotal,
    weekly: weeklyTotal,
    monthly: monthlyTotal,
    total: overallStats.totalTime,
  };

  // Activité quotidienne pour le graphique
  const activityByDay: Record<string, number> = {};
  recentActivity?.forEach(activity => {
    const date = new Date(activity.updatedAt).toLocaleDateString('fr-FR');
    activityByDay[date] = (activityByDay[date] || 0) + activity.timeSpent;
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('fr-FR');
  }).reverse();

  // Badges dynamiques (exemple)
  const badges = useMemo(() => [
    {
      title: 'Premier cours',
      description: 'Commencer un premier cours',
      icon: BookOpen,
      unlocked: coursesProgress.length > 0,
    },
    {
      title: 'Persévérant',
      description: '10h d\'apprentissage',
      icon: Clock,
      unlocked: overallStats.totalTime >= 600, // 10h = 600 minutes
    },
    {
      title: 'Perfectionniste',
      description: 'Terminer un cours à 100%',
      icon: Trophy,
      unlocked: overallStats.completedCourses >= 1,
    },
    {
      title: 'Programmeur',
      description: 'Réussir 10 exercices',
      icon: Code2,
      unlocked: (userStats?.successfulSubmissions || 0) >= 10,
    },
    {
      title: 'Étudiant actif',
      description: '7 jours consécutifs',
      icon: Calendar,
      unlocked: false, // à calculer si on a la série
    },
    {
      title: 'Collaborateur',
      description: 'Aider 5 étudiants',
      icon: Users,
      unlocked: false,
    },
    {
      title: 'Rapide',
      description: 'Terminer un cours en 3 jours',
      icon: Target,
      unlocked: false,
    },
    {
      title: 'Expert',
      description: '3 cours avancés terminés',
      icon: Award,
      unlocked: coursesProgress.filter(c => c.overallProgress === 100).length >= 3,
    },
  ], [coursesProgress, overallStats, userStats]);

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Connectez-vous pour voir vos statistiques</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingProgress || isLoadingStats || isLoadingActivity) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isErrorProgress || isErrorStats || isErrorActivity) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des statistiques. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Mes statistiques
        </h1>
        <p className="text-muted-foreground">
          Suivez votre progression et vos performances
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="time">Temps d'apprentissage</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="achievements">Réussites</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cours suivis</p>
                    <div className="text-2xl font-bold">{overallStats.totalCourses}</div>
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
                    <p className="text-sm text-muted-foreground">Cours terminés</p>
                    <div className="text-2xl font-bold">{overallStats.completedCourses}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progression moyenne</p>
                    <div className="text-2xl font-bold">{Math.round(overallStats.averageProgress)}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Temps total</p>
                    <div className="text-2xl font-bold">
                      {Math.floor(overallStats.totalTime / 60)}h {overallStats.totalTime % 60}min
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progression par cours */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Progression par cours</CardTitle>
              <CardDescription>
                Votre avancement dans chaque cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursesProgress.map((course) => (
                  <div key={course.courseId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{course.courseTitle}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {course.completedLessons}/{course.totalLessons} leçons
                        </Badge>
                        <span className="font-medium">{course.overallProgress}%</span>
                      </div>
                    </div>
                    <Progress value={course.overallProgress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques des exercices */}
          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques des exercices</CardTitle>
                <CardDescription>
                  Vos performances sur les exercices de code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userStats.totalSubmissions}</div>
                    <div className="text-sm text-muted-foreground">Soumissions totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userStats.successfulSubmissions}</div>
                    <div className="text-sm text-muted-foreground">Soumissions réussies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userStats.averageExerciseScore}%</div>
                    <div className="text-sm text-muted-foreground">Score moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userStats.totalSubmissions > 0 
                        ? Math.round((userStats.successfulSubmissions / userStats.totalSubmissions) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Taux de réussite</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="time">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Temps d'apprentissage</CardTitle>
                <CardDescription>
                  Répartition de votre temps d'étude
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.floor(timeStats.daily / 60)}h {timeStats.daily % 60}min</div>
                      <div className="text-sm text-muted-foreground">Aujourd'hui</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.floor(timeStats.weekly / 60)}h {timeStats.weekly % 60}min</div>
                      <div className="text-sm text-muted-foreground">Cette semaine</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.floor(timeStats.monthly / 60)}h {timeStats.monthly % 60}min</div>
                      <div className="text-sm text-muted-foreground">Ce mois</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.floor(timeStats.total / 60)}h {timeStats.total % 60}min</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {/* Graphique simple */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-4">Activité quotidienne (derniers 7 jours)</h4>
                    <div className="flex items-end h-32 gap-1">
                      {last7Days.map(date => {
                        const minutes = activityByDay[date] || 0;
                        return (
                          <div key={date} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-primary rounded-t"
                              style={{ height: `${Math.min(100, (minutes / 180) * 100)}%` }}
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {date.split('/')[0]}/{date.split('/')[1]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Historique d'activité</CardTitle>
              <CardDescription>
                Votre activité récente sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      {activity.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.courseTitle}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.lessonTitle}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.updatedAt).toLocaleDateString('fr-FR')} à {new Date(activity.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{activity.timeSpent} min</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.completed ? 'Terminé' : 'En cours'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Réussites et badges</CardTitle>
                <CardDescription>
                  Les objectifs que vous avez atteints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <div key={index} className={`text-center ${badge.unlocked ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2 ${badge.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon className={`h-8 w-8 ${badge.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="font-medium">{badge.title}</div>
                        <div className="text-xs text-muted-foreground">{badge.description}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}