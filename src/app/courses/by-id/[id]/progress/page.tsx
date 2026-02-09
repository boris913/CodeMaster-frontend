'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  Trophy,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Users,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function CourseProgressPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { isAuthenticated } = useAuthStore();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getByIdOrSlug(courseId),
    enabled: !!courseId,
  });

  const { data: courseProgress, isLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressApi.getCourseProgress(courseId),
    enabled: !!courseId && isAuthenticated,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['course-leaderboard', courseId],
    queryFn: () => progressApi.getLeaderboard(courseId),
    enabled: !!courseId,
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Connectez-vous pour voir votre progression</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!course || !courseProgress) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Cours non trouvé</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Progression globale', 
      value: `${courseProgress.overallProgress}%`, 
      icon: TrendingUp,
      color: 'bg-green-500/10 text-green-500'
    },
    { 
      label: 'Leçons terminées', 
      value: `${courseProgress.completedLessons}/${courseProgress.totalLessons}`, 
      icon: CheckCircle2,
      color: 'bg-blue-500/10 text-blue-500'
    },
    { 
      label: 'Temps passé', 
      value: `${Math.floor(courseProgress.totalTimeSpent / 60)}h ${courseProgress.totalTimeSpent % 60}min`, 
      icon: Clock,
      color: 'bg-purple-500/10 text-purple-500'
    },
    { 
      label: 'Classement', 
      value: leaderboard?.findIndex(entry => entry.userId === useAuthStore.getState().user?.id) + 1 || '-', 
      icon: Award,
      color: 'bg-yellow-500/10 text-yellow-500'
    },
  ];

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/courses/${course.slug}`} className="text-primary hover:underline">
            Cours
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Progression</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              {course.title}
            </h1>
            <p className="text-muted-foreground">
              Suivez votre progression dans ce cours
            </p>
          </div>
          <Button onClick={() => window.history.back()}>
            Retour au cours
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progression par module */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Progression détaillée</CardTitle>
              <CardDescription>
                Votre avancement module par module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {courseProgress.modules?.map((module) => (
                  <div key={module.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{module.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {module.completedLessons}/{module.totalLessons} leçons terminées
                        </div>
                      </div>
                      <Badge variant="outline">{module.progress}%</Badge>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                    
                    {/* Détails des leçons */}
                    <div className="pl-4 space-y-2">
                      {module.lessons?.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-accent rounded">
                          <div className="flex items-center gap-2">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border" />
                            )}
                            <span className={`text-sm ${lesson.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.duration} min</span>
                            {lesson.completedAt && (
                              <>
                                <Calendar className="h-3 w-3 ml-2" />
                                <span>{new Date(lesson.completedAt).toLocaleDateString('fr-FR')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classement */}
          <Card>
            <CardHeader>
              <CardTitle>Classement du cours</CardTitle>
              <CardDescription>
                Top 5 des étudiants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard?.slice(0, 5).map((entry, index) => (
                  <div key={entry.userId} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-700' :
                        index === 1 ? 'bg-gray-300/20 text-gray-700' :
                        index === 2 ? 'bg-amber-700/20 text-amber-700' :
                        'bg-muted text-muted-foreground'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.user?.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.progress}% terminé
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{entry.completedLessons}/{entry.totalLessons}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.lastActivity).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Users className="mr-2 h-4 w-4" />
                Voir le classement complet
              </Button>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Votre dernière activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courseProgress.lastActivity ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {courseProgress.lastActivity.lessonTitle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(courseProgress.lastActivity.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <Badge variant={courseProgress.lastActivity.completed ? 'default' : 'outline'}>
                      {courseProgress.lastActivity.completed ? 'Terminé' : 'En cours'}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Continuer l'apprentissage
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Aucune activité récente
                  </p>
                  <Button variant="outline" className="w-full mt-2">
                    Commencer le cours
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificat */}
          {courseProgress.overallProgress === 100 && (
            <Card>
              <CardHeader>
                <CardTitle>Félicitations !</CardTitle>
                <CardDescription>
                  Vous avez terminé ce cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Téléchargez votre certificat de réussite
                  </p>
                  <Button className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Télécharger le certificat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}