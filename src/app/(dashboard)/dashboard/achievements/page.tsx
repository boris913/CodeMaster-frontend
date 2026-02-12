'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Star, Target, Zap, Brain, Code2, BookOpen } from 'lucide-react';

export default function DashboardAchievementsPage() {
  const achievements = [
    {
      id: 'first-course',
      title: 'Premier pas',
      description: 'Terminer votre premier cours',
      icon: BookOpen,
      progress: 100,
      unlocked: true,
      xp: 100,
    },
    {
      id: 'streak-7',
      title: 'Persévérant',
      description: 'Apprendre 7 jours consécutifs',
      icon: Zap,
      progress: 5,
      total: 7,
      unlocked: false,
      xp: 200,
    },
    {
      id: 'perfect-score',
      title: 'Perfectionniste',
      description: 'Obtenir 100% à un exercice',
      icon: Star,
      progress: 1,
      total: 1,
      unlocked: true,
      xp: 150,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Réussites et badges</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">1 250</div>
            <div className="text-sm text-muted-foreground">Points XP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Badges débloqués</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">En cours</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.filter(a => a.unlocked).map((badge) => {
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prochains objectifs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.filter(a => !a.unlocked).map((badge) => {
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
          })}
        </CardContent>
      </Card>
    </div>
  );
}