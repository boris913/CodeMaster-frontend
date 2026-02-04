'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { communityApi } from '@/lib/api/community';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/utils';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  const { data: categories } = useQuery({
    queryKey: ['community-categories'],
    queryFn: () => communityApi.getCategories(),
  });

  const { data: discussions } = useQuery({
    queryKey: ['discussions', activeTab, searchQuery],
    queryFn: () => communityApi.getDiscussions({
      sortBy: activeTab === 'popular' ? 'votes' : 'createdAt',
      search: searchQuery || undefined,
    }),
  });

  const { data: topContributors } = useQuery({
    queryKey: ['top-contributors'],
    queryFn: () => communityApi.getTopContributors(),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => communityApi.getUpcomingEvents(),
  });

  const { data: communityStats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: () => communityApi.getStats(),
  });

  const handleVote = async (discussionId: string) => {
    if (!user) return;
    await communityApi.voteDiscussion(discussionId);
  };

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
                  {categories?.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="w-full justify-between"
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary">{category.discussionCount}</Badge>
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
                  {topContributors?.slice(0, 5).map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contributor.avatar} />
                        <AvatarFallback>
                          {contributor.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{contributor.username}</div>
                        <div className="text-xs text-muted-foreground">
                          {contributor.answerCount} réponses
                        </div>
                      </div>
                      <Badge variant="outline">
                        {contributor.likeCount} 👍
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
                  <span className="font-bold">{communityStats?.totalMembers?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discussions</span>
                  <span className="font-bold">{communityStats?.totalDiscussions?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Réponses</span>
                  <span className="font-bold">{communityStats?.totalAnswers?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taux de résolution</span>
                  <span className="font-bold text-green-500">{communityStats?.resolutionRate || 0}%</span>
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
                  {discussions?.data?.map((discussion) => (
                    <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Stats */}
                          <div className="flex flex-col items-center gap-2 w-16">
                            <div className="text-center">
                              <div className="text-lg font-bold">{discussion.voteCount}</div>
                              <div className="text-xs text-muted-foreground">votes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{discussion.answerCount}</div>
                              <div className="text-xs text-muted-foreground">réponses</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm">{discussion.viewCount}</div>
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
                                  <Badge variant="outline">{discussion.category?.name}</Badge>
                                  <span>Posté par {discussion.author?.username}</span>
                                  <span>{formatDate(discussion.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleVote(discussion.id)}
                              >
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
                  {upcomingEvents?.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)} à {event.startTime}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.participantCount} participants</span>
                          </div>
                          <Button size="sm">Rejoindre</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}