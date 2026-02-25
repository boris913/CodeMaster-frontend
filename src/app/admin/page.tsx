'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { progressApi } from '@/lib/api/progress';
import Link from 'next/link';
import { 
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['admin-recent-activities'],
    queryFn: () => progressApi.getAdminRecentActivities(10),
  });

  const isLoading = statsLoading || activitiesLoading;

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="mt-4 text-lg font-medium">Erreur de chargement</h3>
            <p className="text-muted-foreground mt-2">
              Impossible de charger les statistiques. Veuillez réessayer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Utilisateurs actifs', 
      value: stats.activeUsers.toLocaleString(), 
      icon: Users, 
      color: 'bg-blue-500/10 text-blue-500' 
    },
    { 
      label: 'Cours publiés', 
      value: stats.publishedCourses.toLocaleString(), 
      icon: BookOpen, 
      color: 'bg-green-500/10 text-green-500' 
    },
    { 
      label: 'Revenus mensuels', 
      value: stats.monthlyRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 
      icon: DollarSign, 
      color: 'bg-yellow-500/10 text-yellow-500' 
    },
    {
      label: 'Taux de complétion',
      value: `${Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100) || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-500'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed': return BookOpen;
      case 'course_enrolled': return Users;
      case 'exercise_submitted': return TrendingUp;
      case 'course_completed': return BookOpen;
      default: return Clock;
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord Admin</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la plateforme et statistiques
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-green-500">{stat.change}</div>
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
        {/* Activités récentes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
              <CardDescription>
                Les dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div>
                          <span className="font-medium">{activity.username}</span>
                          <span className="text-muted-foreground"> {activity.description}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Accès aux fonctions principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les utilisateurs
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Gérer les cours
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Voir les analyses
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres système
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Alertes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alertes système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Serveurs</span>
                  <Badge variant="default">OK</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de données</span>
                  <Badge variant="default">OK</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stockage</span>
                  <Badge variant="warning">65%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dernière sauvegarde</span>
                  <Badge variant="outline">Aujourd'hui</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}