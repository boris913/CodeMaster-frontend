'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { coursesApi } from '@/lib/api/courses';
import { authApi } from '@/lib/api/auth';
import { progressApi } from '@/lib/api/progress';
import { adminApi } from '@/lib/api/admin';
import { useAuthStore } from '@/stores/authStore';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Star,
  Target,
  Plus,
  Edit,
  Users,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
  Award
} from 'lucide-react';
import { Enrollment } from '@/lib/api/courses';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

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

  const { data: instructorCourses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: () => coursesApi.getMyCourses(),
    enabled: user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN',
  });

  const isAdmin = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR' || isAdmin;

  const { data: adminStats, isLoading: adminStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: isAdmin,
  });

  const stats = [
    { 
      label: 'Cours suivis', 
      value: userProgress?.length || 0, 
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
      value: userProgress?.filter(p => p.overallProgress === 100).length || 0, 
      icon: Trophy, 
      change: '+0' 
    },
    { 
      label: 'Score moyen', 
      value: `${userData?.stats?.averageExerciseScore || 0}%`, 
      icon: TrendingUp, 
      change: '+0%' 
    },
  ];

  const instructorStats = [
    {
      label: 'Mes cours',
      value: instructorCourses?.data.length || 0,
      icon: BookOpen,
      link: '/instructor/courses',
    },
    {
      label: 'Total étudiants',
      value: instructorCourses?.data.reduce((acc, course) => acc + course.totalStudents, 0) || 0,
      icon: Users,
      link: '/instructor/courses',
    },
    {
      label: 'Cours publiés',
      value: instructorCourses?.data.filter(c => c.isPublished).length || 0,
      icon: Award,
      link: '/instructor/courses',
    },
    {
      label: 'Note moyenne',
      value: (instructorCourses?.data.reduce((acc, c) => acc + c.rating, 0) / (instructorCourses?.data.length || 1) || 0).toFixed(1),
      icon: Star,
      link: '/instructor/courses',
    },
  ];

  const adminQuickActions = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les comptes et les rôles',
      icon: Users,
      link: '/admin',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Modération des cours',
      description: 'Valider et publier les cours',
      icon: BookOpen,
      link: '/admin',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'Statistiques globales',
      description: 'Vue d\'ensemble de la plateforme',
      icon: BarChart3,
      link: '/admin',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'Paramètres système',
      description: 'Configuration de la plateforme',
      icon: Settings,
      link: '/admin',
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  const instructorQuickActions = [
    {
      title: 'Créer un cours',
      description: 'Commencer un nouveau cours',
      icon: Plus,
      link: '/courses/create',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Mes cours',
      description: 'Gérer mes cours existants',
      icon: Edit,
      link: '/instructor/courses',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'Statistiques',
      description: 'Performance de mes cours',
      icon: BarChart3,
      link: '/stats',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'Communauté',
      description: 'Discussions et questions',
      icon: MessageSquare,
      link: '/community',
      color: 'bg-yellow-500/10 text-yellow-500',
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
              {isAdmin 
                ? 'Bienvenue dans votre espace administrateur'
                : isInstructor 
                ? 'Gérez vos cours et suivez vos étudiants'
                : 'Continuez votre parcours d\'apprentissage là où vous vous êtes arrêté'}
            </p>
            {user?.role && (
              <Badge variant="outline" className="mt-2">
                {user.role === 'ADMIN' ? '🔐 Administrateur' : 
                 user.role === 'INSTRUCTOR' ? '👨‍🏫 Instructeur' : 
                 '👨‍🎓 Étudiant'}
              </Badge>
            )}
          </div>
          {!isAdmin && !isInstructor && coursesData?.[0] && (
            <Button asChild className="mt-4 md:mt-0">
              <Link href={`/learn/${coursesData[0].courseId}/start`}>
                <Target className="mr-2 h-4 w-4" />
                Reprendre l'apprentissage
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Role-based Dashboard */}
      {(isAdmin || isInstructor) && (
        <Tabs defaultValue={isAdmin ? 'admin' : 'instructor'} className="space-y-6">
          <TabsList>
            {isAdmin && <TabsTrigger value="admin">Administration</TabsTrigger>}
            {isInstructor && <TabsTrigger value="instructor">Instructeur</TabsTrigger>}
            <TabsTrigger value="student">Mon apprentissage</TabsTrigger>
          </TabsList>

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {adminQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} href={action.link}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${action.color} mb-4`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-semibold mb-2">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Vue d'ensemble de la plateforme</CardTitle>
                  <CardDescription>
                    Statistiques et métriques globales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminStatsLoading ? (
                    <div className="py-4 text-center">Chargement...</div>
                  ) : adminStats ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">{adminStats.activeUsers.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">{adminStats.publishedCourses}</div>
                          <div className="text-sm text-muted-foreground">Cours publiés</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">{adminStats.monthlyRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
                          <div className="text-sm text-muted-foreground">Revenus ce mois</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">Impossible de charger les statistiques</div>
                  )}
                  <Button className="mt-6 w-full" asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Accéder au panneau d'administration
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Instructor Tab */}
          {isInstructor && (
            <TabsContent value="instructor" className="space-y-6">
              {/* Instructor Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {instructorStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Link key={stat.label} href={stat.link}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{stat.label}</p>
                              <div className="text-2xl font-bold">{stat.value}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-6 w-6" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {instructorQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} href={action.link}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${action.color} mb-4`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-semibold mb-2">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* My Courses */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mes cours</CardTitle>
                      <CardDescription>
                        Gérez et suivez vos cours
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <Link href="/courses/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau cours
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {instructorCourses?.data.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {course.totalStudents} étudiants
                            </span>
                            <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                              {course.isPublished ? 'Publié' : 'Brouillon'}
                            </Badge>
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/courses/by-id/${course.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                    {instructorCourses?.data.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h4 className="mt-4 font-medium">Aucun cours</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          Commencez par créer votre premier cours
                        </p>
                      </div>
                    )}
                  </div>
                  {instructorCourses && instructorCourses.data.length > 3 && (
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href="/instructor/courses">
                        Voir tous mes cours
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Student Tab */}
          <TabsContent value="student" className="space-y-6">
            <StudentDashboard 
              stats={stats}
              coursesData={coursesData}
              recentActivities={recentActivities}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Regular Student Dashboard */}
      {!isAdmin && !isInstructor && (
        <StudentDashboard 
          stats={stats}
          coursesData={coursesData}
          recentActivities={recentActivities}
        />
      )}
    </div>
  );
}

// Composant réutilisable pour le dashboard étudiant
function StudentDashboard({ stats, coursesData, recentActivities }: any) {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat: any) => (
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
                          {Math.round((100 - (enrollment.progress || 0)) * enrollment.course.duration / 100)} min restant
                        </div>
                      </div>
                      <Progress value={enrollment.progress || 0} className="mt-2" />
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/learn/${enrollment.courseId}/start`}>
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
                {recentActivities?.slice(0, 4).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.lessonTitle || activity.courseTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.completed ? 'Leçon complétée' : 'En cours'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm">
                        {new Date(activity.updatedAt).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {activity.completed && (
                        <Badge variant="outline" className="ml-2">
                          Terminé
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

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Accès rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Parcourir les cours
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/community">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Communauté
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/leaderboard">
                  <Trophy className="mr-2 h-4 w-4" />
                  Classement
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/stats">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Mes statistiques
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}