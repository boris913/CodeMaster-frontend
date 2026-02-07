'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  BarChart3,
  Clock,
  Shield,
  Settings,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Utilisateurs actifs', value: '2,458', change: '+12%', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Cours publiés', value: '156', change: '+5%', icon: BookOpen, color: 'bg-green-500/10 text-green-500' },
    { label: 'Revenus mensuels', value: '€12,458', change: '+18%', icon: DollarSign, color: 'bg-yellow-500/10 text-yellow-500' },
    { label: 'Taux de complétion', value: '68%', change: '+3%', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-500' },
  ];

  const recentActivities = [
    { user: 'Jean Dupont', action: 'a terminé le cours JavaScript', time: '5 min ago' },
    { user: 'Marie Martin', action: 's\'est inscrite à React Avancé', time: '12 min ago' },
    { user: 'Admin System', action: 'a publié un nouveau cours', time: '30 min ago' },
    { user: 'Pierre Bernard', action: 'a soumis un exercice', time: '1h ago' },
    { user: 'Sophie Laurent', action: 'a signalé un problème', time: '2h ago' },
  ];

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
        {stats.map((stat) => {
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
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div>
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                ))}
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
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gérer les utilisateurs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Gérer les cours
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Voir les analyses
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres système
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