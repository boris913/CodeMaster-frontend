'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api/progress';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Activity
} from 'lucide-react';

export default function StatsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => progressApi.getUserProgress(),
    enabled: !!user,
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => usersApi.getStats(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity-stats'],
    queryFn: () => progressApi.getRecentActivity(20),
    enabled: !!user,
  });

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

  const overallStats = {
    totalCourses: userProgress?.length || 0,
    completedCourses: userProgress?.filter(p => p.overallProgress === 100).length || 0,
    totalTime: userProgress?.reduce((acc, p) => acc + p.totalTimeSpent, 0) || 0,
    averageProgress: userProgress?.length 
      ? userProgress.reduce((acc, p) => acc + p.overallProgress, 0) / userProgress.length 
      : 0,
  };

  const timeStats = {
    daily: 120, // minutes
    weekly: 840,
    monthly: 3600,
    total: overallStats.totalTime,
  };

  const activityByDay: Record<string, number> = {};
  recentActivity?.forEach(activity => {
    const date = new Date(activity.updatedAt).toLocaleDateString('fr-FR');
    activityByDay[date] = (activityByDay[date] || 0) + activity.timeSpent;
  });

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
                {userProgress?.map((course) => (
                  <div key={course.courseId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{course.courseId}</span>
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
                      {Object.entries(activityByDay)
                        .slice(0, 7)
                        .map(([date, minutes]) => (
                          <div key={date} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-primary rounded-t"
                              style={{ height: `${Math.min(100, (minutes / 180) * 100)}%` }}
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {date.split('/')[0]}/{date.split('/')[1]}
                            </div>
                          </div>
                        ))}
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
                  {/* Badges */}
                  {[
                    { title: 'Premier cours', description: 'Commencer un premier cours', icon: BookOpen },
                    { title: 'Persévérant', description: '10h d\'apprentissage', icon: Clock },
                    { title: 'Perfectionniste', description: 'Terminer un cours à 100%', icon: Trophy },
                    { title: 'Programmeur', description: 'Réussir 10 exercices', icon: Code2 },
                    { title: 'Étudiant actif', description: '7 jours consécutifs', icon: Calendar },
                    { title: 'Collaborateur', description: 'Aider 5 étudiants', icon: Users },
                    { title: 'Rapide', description: 'Terminer un cours en 3 jours', icon: Target },
                    { title: 'Expert', description: '3 cours avancés terminés', icon: Award },
                  ].map((badge, index) => (
                    <div key={index} className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <badge.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="font-medium">{badge.title}</div>
                      <div className="text-xs text-muted-foreground">{badge.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}