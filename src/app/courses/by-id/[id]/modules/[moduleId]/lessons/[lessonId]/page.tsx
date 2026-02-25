'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { lessonsApi } from '@/lib/api/lessons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/learning/video-player';
import { ArrowLeft, Clock, Edit, Eye, FileText } from 'lucide-react';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Extraire les paramètres de l'URL
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const {
    data: lesson,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsApi.getByIdOrSlug(lessonId),
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-10">
        <div className="text-center text-destructive">
          Une erreur est survenue :{' '}
          {error instanceof Error ? error.message : 'Erreur inconnue'}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container py-10">
        <div className="text-center">Leçon non trouvée</div>
      </div>
    );
  }

  // Redirection vers l'édition avec la route complète
  const handleEdit = () => {
    router.push(`/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`);
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Option 1 : retour vers le module (plus prévisible) */}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/courses/by-id/${courseId}/modules/${moduleId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au module
            </Link>
          </Button>
          {/* Option 2 : router.back() (moins prévisible) – décommentez si préféré */}
          {/*
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          */}
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <Badge variant="outline">
            {lesson.isFree ? 'Gratuit' : 'Premium'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Aperçu étudiant
          </Button>
          <Button size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Éditer
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {lesson.videoUrl && (
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-t-lg">
                <VideoPlayer src={lesson.videoUrl} title={lesson.title} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Contenu de la leçon</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose max-w-none"
              >
                {lesson.content}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Durée</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.duration} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ordre</span>
                <span className="font-medium">Leçon {lesson.order}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vues</span>
                <span className="font-medium">{lesson.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Module</span>
                <span className="font-medium">{lesson.module?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cours</span>
                <span className="font-medium">{lesson.module?.course.title}</span>
              </div>
            </CardContent>
          </Card>

          {lesson.exercise && (
            <Card>
              <CardHeader>
                <CardTitle>Exercice associé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lesson.exercise.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {lesson.exercise.language} • {lesson.exercise.difficulty}
                    </p>
                  </div>
                  <Badge variant="outline">+{lesson.exercise.points} pts</Badge>
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <a href={`/exercises/${lesson.exercise.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Voir l'exercice
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}