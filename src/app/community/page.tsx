'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare,
  TrendingUp,
  Users,
  Trophy,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Search
} from 'lucide-react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'general', name: 'Général', count: 1245 },
    { id: 'javascript', name: 'JavaScript', count: 892 },
    { id: 'react', name: 'React', count: 756 },
    { id: 'python', name: 'Python', count: 543 },
    { id: 'backend', name: 'Backend', count: 432 },
    { id: 'career', name: 'Carrière', count: 321 },
  ];

  const discussions = [
    {
      id: 1,
      title: 'Quelle est la meilleure façon d\'apprendre React en 2024 ?',
      author: { name: 'Alexandre Dupont', avatar: null, role: 'Senior Dev' },
      category: 'react',
      replies: 42,
      likes: 156,
      views: 1243,
      time: 'Il y a 2 heures',
      isPinned: true,
      isSolved: true,
    },
    {
      id: 2,
      title: 'Problème avec les Promises imbriquées en JavaScript',
      author: { name: 'Marie Laurent', avatar: null, role: 'Étudiante' },
      category: 'javascript',
      replies: 18,
      likes: 89,
      views: 543,
      time: 'Il y a 5 heures',
      isPinned: false,
      isSolved: false,
    },
    {
      id: 3,
      title: 'Conseils pour une architecture Node.js scalable',
      author: { name: 'Thomas Martin', avatar: null, role: 'Architect' },
      category: 'backend',
      replies: 31,
      likes: 124,
      views: 876,
      time: 'Il y a 1 jour',
      isPinned: true,
      isSolved: true,
    },
    {
      id: 4,
      title: 'Différence entre useEffect et useMemo ?',
      author: { name: 'Sophie Bernard', avatar: null, role: 'Frontend Dev' },
      category: 'react',
      replies: 27,
      likes: 98,
      views: 654,
      time: 'Il y a 2 jours',
      isPinned: false,
      isSolved: true,
    },
    {
      id: 5,
      title: 'Quel framework backend choisir pour un projet personnel ?',
      author: { name: 'Lucas Petit', avatar: null, role: 'Débutant' },
      category: 'general',
      replies: 56,
      likes: 167,
      views: 1432,
      time: 'Il y a 3 jours',
      isPinned: false,
      isSolved: false,
    },
  ];

  const topContributors = [
    { id: 1, name: 'Jean Tech', answers: 324, likes: 1245, avatar: null },
    { id: 2, name: 'Marie Code', answers: 287, likes: 987, avatar: null },
    { id: 3, name: 'Pierre Dev', answers: 243, likes: 876, avatar: null },
    { id: 4, name: 'Sarah Prog', answers: 198, likes: 765, avatar: null },
    { id: 5, name: 'Thomas Script', answers: 167, likes: 654, avatar: null },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Workshop Next.js 14', date: '15 Mars', time: '18:00', participants: 45 },
    { id: 2, title: 'Live Q&A TypeScript', date: '18 Mars', time: '20:00', participants: 32 },
    { id: 3, title: 'Challenge Algorithmique', date: '22 Mars', time: '19:00', participants: 67 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Communauté CodeMaster
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoignez des milliers de développeurs, posez vos questions, partagez vos connaissances
              et progressez ensemble
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les discussions..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-12">
                <MessageSquare className="mr-2 h-5 w-5" />
                Nouvelle discussion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Catégories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="w-full justify-between"
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top contributeurs
                </CardTitle>
                <CardDescription>
                  Cette semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {contributor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{contributor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {contributor.answers} réponses
                        </div>
                      </div>
                      <Badge variant="outline">
                        {contributor.likes} 👍
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Membres</span>
                  <span className="font-bold">12,458</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discussions</span>
                  <span className="font-bold">5,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Réponses</span>
                  <span className="font-bold">23,456</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taux de résolution</span>
                  <span className="font-bold text-green-500">92%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="popular" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Populaire
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Récent
                </TabsTrigger>
                <TabsTrigger value="unanswered" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Sans réponse
                </TabsTrigger>
                <TabsTrigger value="events" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Événements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="space-y-4">
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Stats */}
                          <div className="flex flex-col items-center gap-2 w-16">
                            <div className="text-center">
                              <div className="text-lg font-bold">{discussion.likes}</div>
                              <div className="text-xs text-muted-foreground">votes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{discussion.replies}</div>
                              <div className="text-xs text-muted-foreground">réponses</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm">{discussion.views}</div>
                              <div className="text-xs text-muted-foreground">vues</div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {discussion.title}
                                  {discussion.isPinned && (
                                    <Badge variant="default" className="ml-2">📌 Épinglé</Badge>
                                  )}
                                  {discussion.isSolved && (
                                    <Badge variant="secondary" className="ml-2">✅ Résolu</Badge>
                                  )}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <Badge variant="outline">{discussion.category}</Badge>
                                  <span>Posté par {discussion.author.name}</span>
                                  <span>{discussion.time}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                              <Button variant="ghost" size="sm">
                                <Heart className="h-4 w-4 mr-1" />
                                Voter
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Répondre
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4 mr-1" />
                                Partager
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="events">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{event.date} à {event.time}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.participants} participants</span>
                          </div>
                          <Button size="sm">Rejoindre</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guide de la communauté
                </CardTitle>
                <CardDescription>
                  Comment participer efficacement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Pour poser une question :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <span>Recherchez d'abord si la question a déjà été posée</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <span>Utilisez un titre clair et descriptif</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <span>Incluez votre code et les erreurs rencontrées</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Pour répondre :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <span>Soyez respectueux et constructif</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <span>Fournissez des exemples de code clairs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <span>Expliquez votre raisonnement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}