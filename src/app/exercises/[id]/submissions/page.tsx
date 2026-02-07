'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { exercisesApi } from '@/lib/api/exercises';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Code2,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  Trophy,
  Timer,
  Cpu
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ExerciseSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');

  const { data: exercise, isLoading: isLoadingExercise } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesApi.getById(exerciseId),
    enabled: !!exerciseId,
  });

  const { data: submissionsData, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['submissions', exerciseId],
    queryFn: () => exercisesApi.getSubmissions(exerciseId, 1, 50),
    enabled: !!exerciseId && !!user,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard', exerciseId],
    queryFn: () => exercisesApi.getLeaderboard(exerciseId),
    enabled: !!exerciseId,
  });

  const submissions = submissionsData?.data || [];
  const mySubmissions = submissions.filter(s => s.userId === user?.id);
  const bestSubmission = mySubmissions.find(s => s.status === 'SUCCESS') || 
                       mySubmissions.sort((a, b) => b.passedTests - a.passedTests)[0];

  const stats = {
    totalSubmissions: submissions.length,
    mySubmissions: mySubmissions.length,
    successRate: submissions.length > 0 
      ? (submissions.filter(s => s.status === 'SUCCESS').length / submissions.length * 100).toFixed(1)
      : '0',
    averageTestsPassed: submissions.length > 0
      ? (submissions.reduce((acc, s) => acc + s.passedTests, 0) / submissions.length).toFixed(1)
      : '0',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Réussi</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Échoué</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case 'RUNNING':
        return <Badge variant="secondary" className="gap-1"><Cpu className="h-3 w-3" /> En cours</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingExercise) {
    return (
      <div className="container py-10">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-12 text-center">
            <Code2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Exercice non trouvé</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/exercises/${exerciseId}`)}
          >
            ← Retour à l'exercice
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Code2 className="h-8 w-8" />
              {exercise.title}
            </h1>
            <p className="text-muted-foreground">
              Historique des soumissions
            </p>
          </div>
          <Button onClick={() => router.push(`/exercises/${exerciseId}`)}>
            Nouvelle tentative
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soumissions totales</p>
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mes soumissions</p>
                <div className="text-2xl font-bold">{stats.mySubmissions}</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Code2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de réussite</p>
                <div className="text-2xl font-bold">{stats.successRate}%</div>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tests réussis (moy.)</p>
                <div className="text-2xl font-bold">{stats.averageTestsPassed}</div>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Mes soumissions */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Toutes les soumissions</TabsTrigger>
              <TabsTrigger value="mine">Mes soumissions</TabsTrigger>
              <TabsTrigger value="success">Réussies</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoadingSubmissions ? (
                <div className="text-center py-12">
                  <div className="animate-pulse">Chargement...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === 'all' ? submissions :
                    activeTab === 'mine' ? mySubmissions :
                    submissions.filter(s => s.status === 'SUCCESS')).map((submission) => (
                    <Card key={submission.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Code2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {submission.user?.username || 'Utilisateur anonyme'}
                                  </span>
                                  {getStatusBadge(submission.status)}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {formatDistanceToNow(new Date(submission.createdAt), {
                                        addSuffix: true,
                                        locale: fr,
                                      })}
                                    </span>
                                  </div>
                                  {submission.executionTime && (
                                    <div className="flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      <span>{submission.executionTime}ms</span>
                                    </div>
                                  )}
                                  {submission.memoryUsed && (
                                    <div className="flex items-center gap-1">
                                      <Cpu className="h-3 w-3" />
                                      <span>{(submission.memoryUsed / 1024).toFixed(2)} KB</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {submission.passedTests}/{submission.totalTests} tests
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {Math.round(submission.passedTests / submission.totalTests * 100)}% réussis
                              </div>
                            </div>
                            {submission.userId === user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  // Voir le détail de la soumission
                                }}
                              >
                                <Eye className="mr-2 h-3 w-3" />
                                Détails
                              </Button>
                            )}
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
          {/* Meilleure soumission */}
          {bestSubmission && (
            <Card>
              <CardHeader>
                <CardTitle>Ma meilleure soumission</CardTitle>
                <CardDescription>
                  Votre meilleure performance sur cet exercice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Statut</span>
                    {getStatusBadge(bestSubmission.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tests réussis</span>
                    <span className="font-medium">
                      {bestSubmission.passedTests}/{bestSubmission.totalTests}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>
                        {Math.round(bestSubmission.passedTests / bestSubmission.totalTests * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={bestSubmission.passedTests / bestSubmission.totalTests * 100} 
                      className="h-2"
                    />
                  </div>
                  {bestSubmission.executionTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Temps d'exécution</span>
                      <span className="font-medium">{bestSubmission.executionTime}ms</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Voir le code
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir le code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Classement */}
          <Card>
            <CardHeader>
              <CardTitle>Top des solutions</CardTitle>
              <CardDescription>
                Les meilleures soumissions
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
                        {entry.passedTests}/{entry.totalTests} tests
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{entry.executionTime}ms</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
                {leaderboard?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune soumission
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push(`/exercises/${exerciseId}/leaderboard`)}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Voir le classement complet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}