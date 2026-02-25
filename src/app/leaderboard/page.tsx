'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { progressApi, type GlobalLeaderboardEntry } from '@/lib/api/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  Award,
  Crown,
  Medal,
  Target,
  Filter,
  Search,
  Loader2
} from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rank');

  const { data: leaderboard, isLoading, isError } = useQuery({
    queryKey: ['global-leaderboard', activeTab],
    queryFn: () => progressApi.getGlobalLeaderboard(
      activeTab === 'global' ? 'all' : activeTab,
      100
    ),
  });

  // Filtrer par recherche
  const filteredLeaderboard = leaderboard?.filter(entry =>
    entry.username.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  // Trier localement selon sortBy
  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank;
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'streak') return b.streak - a.streak;
    return a.rank - b.rank;
  });

  const myEntry = leaderboard?.find(entry => entry.userId === user?.id);
  const myRank = myEntry?.rank;

  if (isLoading) {
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

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-10 w-10 text-yellow-500" />
          Classement général
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comparez vos performances avec les autres étudiants et montez dans le classement
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un étudiant..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Classement</SelectItem>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="streak">Série</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Classement principal */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
              <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card>
                <CardContent className="p-0">
                  {/* En-tête */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium bg-muted/50">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Étudiant</div>
                    <div className="col-span-2">Leçons</div>
                    <div className="col-span-2">Série</div>
                    <div className="col-span-2">Points</div>
                  </div>

                  {/* Top 3 */}
                  <div className="p-4 space-y-2">
                    {sortedLeaderboard.slice(0, 3).map((entry, index) => (
                      <div
                        key={entry.userId}
                        className={`grid grid-cols-12 gap-4 p-4 rounded-lg items-center ${
                          index === 0 ? 'bg-yellow-500/10 border-2 border-yellow-500/20' :
                          index === 1 ? 'bg-gray-300/10 border-2 border-gray-300/20' :
                          'bg-amber-700/10 border-2 border-amber-700/20'
                        }`}
                      >
                        <div className="col-span-1">
                          {index === 0 ? (
                            <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                              <Crown className="h-5 w-5 text-white" />
                            </div>
                          ) : index === 1 ? (
                            <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                              <Medal className="h-5 w-5 text-white" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-amber-700 flex items-center justify-center">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="col-span-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium">
                                {entry.username.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold">{entry.username}</div>
                              <div className="text-sm text-muted-foreground">
                                Dernière activité : {new Date(entry.lastActivity).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-lg font-bold">{entry.completedLessons}</div>
                          <div className="text-xs text-muted-foreground">leçons</div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="font-medium">{entry.streak} jours</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-lg font-bold">{entry.points}</div>
                          <div className="text-xs text-muted-foreground">pts</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reste du classement */}
                  <div className="p-4 space-y-2">
                    {sortedLeaderboard.slice(3).map((entry) => {
                      const isCurrentUser = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.userId}
                          className={`grid grid-cols-12 gap-4 p-3 rounded-lg items-center hover:bg-accent transition-colors ${
                            isCurrentUser ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="col-span-1">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="font-bold">{entry.rank}</span>
                            </div>
                          </div>
                          <div className="col-span-5">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {entry.username.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {entry.username}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="font-medium">{entry.completedLessons}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="font-medium">{entry.streak} j</div>
                          </div>
                          <div className="col-span-2">
                            <div className="font-medium">{entry.points}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                    <div className="text-4xl font-bold mb-2">{myRank}ᵉ</div>
                    <div className="text-sm text-muted-foreground">Position globale</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Leçons complétées</span>
                      <span className="font-medium">{myEntry.completedLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Série active</span>
                      <span className="font-medium">{myEntry.streak} jours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Points</span>
                      <span className="font-medium">{myEntry.points}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Prochain objectif</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Top 10</span>
                        <span>{myRank! <= 10 ? '✓ Atteint' : `${myRank! - 10} positions`}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Top 50</span>
                        <span>{myRank! <= 50 ? '✓ Atteint' : `${myRank! - 50} positions`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conseils */}
          <Card>
            <CardHeader>
              <CardTitle>Comment monter ?</CardTitle>
              <CardDescription>
                Conseils pour améliorer votre classement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Apprendre régulièrement</div>
                  <div className="text-sm text-muted-foreground">
                    Maintenez une série quotidienne
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Trophy className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Terminer les leçons</div>
                  <div className="text-sm text-muted-foreground">
                    Chaque leçon complétée rapporte des points
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Faire des exercices</div>
                  <div className="text-sm text-muted-foreground">
                    Les exercices rapportent plus de points
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