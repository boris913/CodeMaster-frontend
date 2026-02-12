'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '@/lib/api/community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

export default function DiscussionDetailPage() {
  const { id } = useParams();

  const { data: discussion, isLoading } = useQuery({
    queryKey: ['discussion', id],
    queryFn: () => communityApi.getDiscussion(id as string),
  });

  if (isLoading) return <div className="container py-10">Chargement...</div>;
  if (!discussion) return <div className="container py-10">Discussion non trouvée</div>;

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{discussion.category?.name}</Badge>
          {discussion.isPinned && <Badge>📌 Épinglé</Badge>}
          {discussion.isSolved && <Badge variant="secondary">✅ Résolu</Badge>}
        </div>
        <h1 className="text-3xl font-bold">{discussion.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <Avatar>
            <AvatarImage src={discussion.author?.avatar} />
            <AvatarFallback>
              {discussion.author?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{discussion.author?.username}</p>
            <p className="text-sm text-muted-foreground">
              Posté le {formatDate(discussion.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="prose max-w-none">{discussion.content}</div>
          <div className="flex items-center gap-4 mt-6">
            <Button variant="ghost" size="sm">
              <Heart className="mr-2 h-4 w-4" />
              {discussion.voteCount} votes
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              {discussion.answerCount} réponses
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réponses ({discussion.answerCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            La fonctionnalité de commentaires arrive bientôt !
          </p>
        </CardContent>
      </Card>
    </div>
  );
}