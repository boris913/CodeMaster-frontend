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
import { Input } from '@/components/ui/input';
import { 
  Trophy,
  Code2,
  Timer,
  Cpu,
  Medal,
  Users,
  Search,
  Crown,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function ExerciseLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('performance');
  const [search, setSearch] = useState('');

  const { data: exercise, isLoading: isLoadingExercise } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesApi.getById(exerciseId),
    enabled: !!exerciseId,
  });

  const { data: leaderboard, isLoading, isError } = useQuery({
    queryKey: ['leaderboard', exerciseId],
    queryFn: () => exercisesApi.getLeaderboard(exerciseId, 100),
    enabled: !!exerciseId,
  });

  const myRank = leaderboard?.findIndex(entry => entry.userId === user?.id) + 1;
  const myEntry = leaderboard?.find(entry => entry.userId === user?.id);

  const filteredLeaderboard = leaderboard?.filter(entry =>
    entry.username?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Calcul des métriques de performance à partir des données réelles
  const totalEntries = filteredLeaderboard.length;
  const avgExecutionTime = totalEntries > 0
    ? Math.round(filteredLeaderboard.reduce((acc, e) => acc + (e.executionTime || 0), 0) / totalEntries)
    : 0;
  const avgMemoryUsed = totalEntries > 0
    ? (filteredLeaderboard.reduce((acc, e) => acc + (e.memoryUsed || 0), 0) / totalEntries / 1024).toFixed(2)
    : '0';
  const avgSuccessRate = totalEntries > 0
    ? Math.round(filteredLeaderboard.reduce((acc, e) => acc + (e.passedTests / e.totalTests * 100), 0) / totalEntries)
    : 0;

  const performanceMetrics = [
    { label: 'Temps moyen', value: `${avgExecutionTime}ms`, icon: Timer },
    { label: 'Mémoire moyenne', value: `${avgMemoryUsed} KB`, icon: Cpu },
    { label: 'Taux de réussite', value: `${avgSuccessRate}%`, icon: TrendingUp },
    { label: 'Participants', value: totalEntries.toString(), icon: Users },
  ];

  if (isLoadingExercise || isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement du classement. Veuillez réessayer.
          </AlertDescription>
        </Alert>
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
              <Trophy className="h-8 w-8" />
              Classement
            </h1>
            <p className="text-muted-foreground">
              {exercise.title} • Comparez vos performances
            </p>
          </div>
          <Button onClick={() => router.push(`/exercises/${exerciseId}`)}>
            Nouvelle tentative
          </Button>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <div className="text-2xl font-bold">{metric.value}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Classement principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Classement des solutions</CardTitle>
                  <CardDescription>
                    Top 100 des meilleures performances
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    className="pl-9 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="time">Temps d'exécution</TabsTrigger>
                  <TabsTrigger value="memory">Utilisation mémoire</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="space-y-2">
                    {/* En-tête */}
                    <div className="grid grid-cols-12 gap-4 p-3 border-b font-medium text-sm">
                      <div className="col-span-1">#</div>
                      <div className="col-span-4">Utilisateur</div>
                      <div className="col-span-2">Tests</div>
                      <div className="col-span-2">Temps</div>
                      <div className="col-span-2">Mémoire</div>
                      <div className="col-span-1">Date</div>
                    </div>

                    {/* Entrées */}
                    {filteredLeaderboard.map((entry, index) => {
                      const isCurrentUser = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.id}
                          className={`grid grid-cols-12 gap-4 p-3 rounded-lg items-center hover:bg-accent transition-colors ${
                            isCurrentUser ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="col-span-1">
                            {index === 0 ? (
                              <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                                <Crown className="h-4 w-4 text-white" />
                              </div>
                            ) : index === 1 ? (
                              <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                                2
                              </div>
                            ) : index === 2 ? (
                              <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold">
                                3
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="font-bold">{index + 1}</span>
                              </div>
                            )}
                          </div>
                          <div className="col-span-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium text-sm">
                                  {entry.username?.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {entry.username}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
                                  )}
                                </div>
                                {/* L'email n'est pas affiché */}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="font-medium">
                              {entry.passedTests}/{entry.totalTests}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round((entry.passedTests / entry.totalTests) * 100)}%
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span className="font-medium">{entry.executionTime}ms</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              <Cpu className="h-3 w-3" />
                              <span className="font-medium">
                                {(entry.memoryUsed / 1024).toFixed(2)} KB
                              </span>
                            </div>
                          </div>
                          <div className="col-span-1">
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mon classement */}
          {myEntry && (
            <Card>
              <CardHeader>
                <CardTitle>Mon classement</CardTitle>
                <CardDescription>
                  Votre position dans le classement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{myRank}ᵉ</div>
                    <div className="text-sm text-muted-foreground">Position</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tests réussis</span>
                      <span className="font-medium">
                        {myEntry.passedTests}/{myEntry.totalTests}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Temps d'exécution</span>
                      <span className="font-medium">{myEntry.executionTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mémoire utilisée</span>
                      <span className="font-medium">
                        {(myEntry.memoryUsed / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Progression</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Top 10</span>
                        <span>{myRank <= 10 ? '✓ Atteint' : `${10 - myRank} positions`}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Top 50</span>
                        <span>{myRank <= 50 ? '✓ Atteint' : `${50 - myRank} positions`}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/exercises/${exerciseId}/submissions`)}
                  >
                    Voir mes soumissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conseils */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils d'optimisation</CardTitle>
              <CardDescription>
                Améliorez votre position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Timer className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Optimisez le temps</div>
                  <div className="text-sm text-muted-foreground">
                    Évitez les boucles inutiles et utilisez des algorithmes efficaces
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Cpu className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Réduisez la mémoire</div>
                  <div className="text-sm text-muted-foreground">
                    Libérez les ressources et évitez les allocations inutiles
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Medal className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Tous les tests</div>
                  <div className="text-sm text-muted-foreground">
                    Assurez-vous que votre solution passe tous les cas de test
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}