'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { coursesApi } from '@/lib/api/courses';
import { authApi } from '@/lib/api/auth';
import { progressApi } from '@/lib/api/progress';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Star,
  Calendar,
  Target
} from 'lucide-react';
import { Enrollment } from '@/lib/api/courses';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.me(),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'enrolled'],
    queryFn: () => coursesApi.getEnrolled(),
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => progressApi.getRecentActivity(4),
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => progressApi.getUserProgress(),
  });

  const stats = [
    { 
      label: 'Cours suivis', 
      value: userProgress?.length || '0', 
      icon: BookOpen, 
      change: '+0' 
    },
    { 
      label: 'Heures étudiées', 
      value: `${Math.floor((userProgress?.reduce((acc, curr) => acc + (curr.totalTimeSpent || 0), 0) || 0) / 60)}h`, 
      icon: Clock, 
      change: '+0h' 
    },
    { 
      label: 'Cours terminés', 
      value: userProgress?.filter(p => p.overallProgress === 100).length || '0', 
      icon: Trophy, 
      change: '+0' 
    },
    { 
      label: 'Score moyen', 
      value: `${Math.round(userProgress?.reduce((acc, curr) => acc + (curr.averageScore || 0), 0) / (userProgress?.length || 1))}%`, 
      icon: TrendingUp, 
      change: '+0%' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Bonjour, {userData?.username || 'Apprenant'} 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Continuez votre parcours d'apprentissage là où vous vous êtes arrêté
            </p>
          </div>
          {coursesData?.[0] && (
            <Button asChild className="mt-4 md:mt-0">
              <Link href={`/learning/${coursesData[0].courseId}/start`}>
                <Target className="mr-2 h-4 w-4" />
                Reprendre l'apprentissage
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* En cours */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cours en cours</CardTitle>
              <CardDescription>
                Continuez votre apprentissage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursesData?.slice(0, 3).map((enrollment: Enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{enrollment.course.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {enrollment.progress || 0}% complété
                        </span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.round((100 - enrollment.progress) * enrollment.course.duration / 100)} min restant
                        </div>
                      </div>
                      <Progress value={enrollment.progress || 0} className="mt-2" />
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/learning/${enrollment.courseId}/start`}>
                        Continuer
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                {recentActivities?.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.lesson?.title || activity.course?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type === 'LESSON_COMPLETED' ? 'Leçon complétée' : 
                         activity.type === 'EXERCISE_SUBMITTED' ? 'Exercice soumis' :
                         activity.type === 'COURSE_STARTED' ? 'Cours commencé' : 
                         'Activité'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm">
                        {new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {activity.progress && (
                        <Badge variant="outline" className="ml-2">
                          {activity.progress}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Côté droit */}
        <div className="space-y-6">
          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
              <CardDescription>
                Cours qui pourraient vous intéresser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coursesData
                  ?.filter((enrollment: Enrollment) => enrollment.progress === 0)
                  .slice(0, 3)
                  .map((enrollment: Enrollment) => (
                    <div key={enrollment.id} className="p-3 rounded-lg border">
                      <h4 className="font-semibold">{enrollment.course.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline">
                          {enrollment.course.difficulty === 'BEGINNER' ? 'Débutant' :
                           enrollment.course.difficulty === 'INTERMEDIATE' ? 'Intermédiaire' : 'Avancé'}
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">{enrollment.course.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}