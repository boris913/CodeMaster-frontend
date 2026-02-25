'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Star, Target, Zap, Brain, Code2, BookOpen, CheckCircle2 } from 'lucide-react';
import { progressApi } from '@/lib/api/progress';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Définition des achievements
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  progress: number;
  total: number;
  unlocked: boolean;
  xp: number;
}

export default function DashboardAchievementsPage() {
  const { user } = useAuthStore();

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => progressApi.getUserProgress(),
    enabled: !!user,
  });

  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => usersApi.getStats(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['recent-activity-achievements'],
    queryFn: () => progressApi.getRecentActivity(50), // assez pour calculer la streak
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Connectez-vous pour voir vos réussites</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingProgress || isLoadingStats || isLoadingActivity) {
    return (
      <div className="space-y-6 flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Calcul des métriques
  const totalCourses = userProgress?.length || 0;
  const completedCourses = userProgress?.filter(p => p.overallProgress === 100).length || 0;
  const totalLessonsCompleted = userProgress?.reduce((acc, c) => acc + c.completedLessons, 0) || 0;

  // Calcul de la streak (série de jours consécutifs avec activité)
  const calculateStreak = () => {
    if (!recentActivity || recentActivity.length === 0) return 0;
    // Trier par date décroissante
    const sorted = [...recentActivity].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = today;
    for (const activity of sorted) {
      const activityDate = new Date(activity.updatedAt);
      activityDate.setHours(0, 0, 0, 0);
      if (activityDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activityDate.getTime() === currentDate.getTime() - 86400000) {
        // jour précédent, continue
        streak++;
        currentDate = activityDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Définir les achievements
  const achievements: Achievement[] = [
    {
      id: 'first-course',
      title: 'Premier pas',
      description: 'Commencer votre premier cours',
      icon: BookOpen,
      progress: totalCourses > 0 ? 1 : 0,
      total: 1,
      unlocked: totalCourses > 0,
      xp: 50,
    },
    {
      id: 'five-lessons',
      title: 'Apprenti',
      description: 'Terminer 5 leçons',
      icon: Brain,
      progress: Math.min(totalLessonsCompleted, 5),
      total: 5,
      unlocked: totalLessonsCompleted >= 5,
      xp: 100,
    },
    {
      id: 'streak-7',
      title: 'Persévérant',
      description: 'Apprendre 7 jours consécutifs',
      icon: Zap,
      progress: Math.min(streak, 7),
      total: 7,
      unlocked: streak >= 7,
      xp: 200,
    },
    {
      id: 'perfect-score',
      title: 'Perfectionniste',
      description: 'Obtenir 100% à un exercice',
      icon: Star,
      progress: userStats?.successfulSubmissions && userStats.successfulSubmissions > 0 ? 1 : 0,
      total: 1,
      unlocked: (userStats?.successfulSubmissions ?? 0) > 0,
      xp: 150,
    },
    {
      id: 'ten-exercises',
      title: 'Programmeur',
      description: 'Réussir 10 exercices',
      icon: Code2,
      progress: Math.min(userStats?.successfulSubmissions ?? 0, 10),
      total: 10,
      unlocked: (userStats?.successfulSubmissions ?? 0) >= 10,
      xp: 300,
    },
    {
      id: 'complete-course',
      title: 'Diplômé',
      description: 'Terminer un cours complet',
      icon: Award,
      progress: Math.min(completedCourses, 1),
      total: 1,
      unlocked: completedCourses >= 1,
      xp: 500,
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const inProgressAchievements = achievements.filter(a => !a.unlocked);
  const totalXp = unlockedAchievements.reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Réussites et badges</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{totalXp}</div>
            <div className="text-sm text-muted-foreground">Points XP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Badges débloqués</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{inProgressAchievements.length}</div>
            <div className="text-sm text-muted-foreground">En cours</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges récents</CardTitle>
        </CardHeader>
        <CardContent>
          {unlockedAchievements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Vous n'avez pas encore débloqué de badge. Continuez à apprendre !
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {unlockedAchievements.slice(0, 4).map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.id} className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="mt-2 font-medium">{badge.title}</div>
                    <div className="text-xs text-muted-foreground">{badge.xp} XP</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prochains objectifs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {inProgressAchievements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Félicitations ! Vous avez débloqué tous les badges disponibles.
            </p>
          ) : (
            inProgressAchievements.map((badge) => {
              const Icon = badge.icon;
              const progress = (badge.progress / badge.total) * 100;
              return (
                <div key={badge.id} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{badge.title}</span>
                      <Badge variant="outline">{badge.xp} XP</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs">
                        <span>Progression</span>
                        <span>{badge.progress}/{badge.total}</span>
                      </div>
                      <Progress value={progress} className="h-2 mt-1" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}