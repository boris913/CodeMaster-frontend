'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Search
} from 'lucide-react';

// Données simulées pour le classement
const mockLeaderboard = Array.from({ length: 50 }, (_, i) => ({
  id: i.toString(),
  userId: `user${i}`,
  user: {
    id: `user${i}`,
    username: i === 0 ? 'toplearner' : `étudiant${i + 1}`,
    avatar: i < 5 ? `/api/images/avatars/${i + 1}.jpg` : undefined,
  },
  rank: i + 1,
  completedCourses: Math.floor(Math.random() * 20) + 5,
  totalCourses: 25,
  progress: Math.floor(Math.random() * 100) + 1,
  streak: Math.floor(Math.random() * 30) + 1,
  points: Math.floor(Math.random() * 5000) + 1000,
  lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('global');
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rank');

  // Filtrer et trier le classement
  const filteredLeaderboard = mockLeaderboard
    .filter(entry => 
      entry.user.username.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rank': return a.rank - b.rank;
        case 'progress': return b.progress - a.progress;
        case 'streak': return b.streak - a.streak;
        case 'points': return b.points - a.points;
        default: return a.rank - b.rank;
      }
    });

  const myRank = filteredLeaderboard.findIndex(entry => entry.userId === user?.id) + 1;
  const myEntry = filteredLeaderboard.find(entry => entry.userId === user?.id);

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
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les temps</SelectItem>
                <SelectItem value="weekly">Cette semaine</SelectItem>
                <SelectItem value="monthly">Ce mois</SelectItem>
                <SelectItem value="yearly">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Classement</SelectItem>
                <SelectItem value="progress">Progression</SelectItem>
                <SelectItem value="streak">Série active</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Classement principal */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
              <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card>
                <CardContent className="p-0">
                  {/* En-tête du tableau */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium bg-muted/50">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Étudiant</div>
                    <div className="col-span-2">Progression</div>
                    <div className="col-span-2">Série</div>
                    <div className="col-span-2">Points</div>
                  </div>

                  {/* Top 3 */}
                  <div className="p-4 space-y-2">
                    {filteredLeaderboard.slice(0, 3).map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`grid grid-cols-12 gap-4 p-4 rounded-lg items-center ${
                          index === 0 ? 'bg-yellow-500/10 border-2 border-yellow-500/20' :
                          index === 1 ? 'bg-gray-300/10 border-2 border-gray-300/20' :
                          index === 2 ? 'bg-amber-700/10 border-2 border-amber-700/20' :
                          'bg-card border'
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
                          ) : index === 2 ? (
                            <div className="h-10 w-10 rounded-full bg-amber-700 flex items-center justify-center">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="font-bold">{entry.rank}</span>
                            </div>
                          )}
                        </div>
                        <div className="col-span-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium">
                                {entry.user.username.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold">{entry.user.username}</div>
                              <div className="text-sm text-muted-foreground">
                                {entry.completedCourses} cours terminés
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <div className="text-lg font-bold">{entry.progress}%</div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${entry.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="font-medium">{entry.streak} jours</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Série active</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-lg font-bold">{entry.points}</div>
                          <div className="text-xs text-muted-foreground">Points</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reste du classement */}
                  <div className="p-4 space-y-2">
                    {filteredLeaderboard.slice(3, 20).map((entry) => {
                      const isCurrentUser = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.id}
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
                                  {entry.user.username.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {entry.user.username}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="font-medium">{entry.progress}%</div>
                          </div>
                          <div className="col-span-2">
                            <div className="font-medium">{entry.streak} jours</div>
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
                      <span className="text-sm text-muted-foreground">Progression</span>
                      <span className="font-medium">{myEntry.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Série active</span>
                      <span className="font-medium">{myEntry.streak} jours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Points</span>
                      <span className="font-medium">{myEntry.points}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cours terminés</span>
                      <span className="font-medium">{myEntry.completedCourses}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Prochain objectif</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Top 10</span>
                        <span>{myRank <= 10 ? '✓ Atteint' : `${myRank - 10} positions`}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Top 50</span>
                        <span>{myRank <= 50 ? '✓ Atteint' : `${myRank - 50} positions`}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>1000 points</span>
                        <span>{myEntry.points >= 1000 ? '✓ Atteint' : `${1000 - myEntry.points} points`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comment monter ? */}
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
                  <div className="font-medium">Terminer les cours</div>
                  <div className="text-sm text-muted-foreground">
                    Chaque cours terminé rapporte des points
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

          {/* Statistiques globales */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques globales</CardTitle>
              <CardDescription>
                Vue d'ensemble de la communauté
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Étudiants actifs</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cours terminés</span>
                  <span className="font-medium">8,956</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Temps d'étude total</span>
                  <span className="font-medium">12,458h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Exercices soumis</span>
                  <span className="font-medium">45,231</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}