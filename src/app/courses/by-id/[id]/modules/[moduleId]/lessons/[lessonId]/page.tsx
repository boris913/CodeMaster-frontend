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
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/learning/video-player';
import {
  ArrowLeft,
  Clock,
  Edit,
  Eye,
  FileText,
  Code2,
  Plus,
  Pencil,
  Trophy,
  Zap,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  INTERMEDIATE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  ADVANCED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();

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

  const handleEdit = () => {
    router.push(`/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`);
  };

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
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">
            Une erreur est survenue :{' '}
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
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

  const exerciseEditUrl = `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/exercise/${lesson.exercise!.id}/edit`;
  const exerciseDetailUrl = `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/exercise/${lesson.exercise!.id}`;
  const exerciseCreateUrl = `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/exercise/create`;

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/courses/by-id/${courseId}/modules/${moduleId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au module
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <Badge variant="outline">{lesson.isFree ? 'Gratuit' : 'Premium'}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Aperçu étudiant
          </Button>
          <Button size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Éditer la leçon
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
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
                className="prose max-w-none dark:prose-invert"
              >
                {lesson.content}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations */}
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

          {/* ── Exercice associé ───────────────────────────────────────────── */}
          {lesson.exercise ? (
            // Un exercice existe → afficher avec actions Voir / Modifier
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    Exercice associé
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Actif</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Résumé de l'exercice */}
                <div className="space-y-2">
                  <p className="font-semibold">{lesson.exercise.title}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {lesson.exercise.language}
                    </Badge>
                    <Badge
                      className={
                        DIFFICULTY_COLORS[lesson.exercise.difficulty] ?? 'bg-secondary'
                      }
                    >
                      {DIFFICULTY_LABELS[lesson.exercise.difficulty] ??
                        lesson.exercise.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" />
                      {lesson.exercise.points} pts
                    </span>
                    {/* {lesson.exercise.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.exercise.timeLimit}s
                      </span>
                    )}
                    {lesson.exercise.memoryLimit && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        {lesson.exercise.memoryLimit}MB
                      </span>
                    )} */}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href={exerciseDetailUrl}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir l'exercice
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={exerciseEditUrl}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier l'exercice
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Aucun exercice → CTA de création
            <Card className="border-dashed border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Code2 className="h-5 w-5" />
                  Exercice pratique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cette leçon n'a pas encore d'exercice. Ajoutez-en un pour permettre 
                  aux étudiants de pratiquer avec correction automatique.
                </p>
                <Button asChild className="w-full">
                  <Link href={exerciseCreateUrl}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un exercice
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier la leçon
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link
                  href={`/courses/by-id/${courseId}/modules/${moduleId}/lessons/create`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle leçon
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
                asChild
              >
                <Link href={`/courses/by-id/${courseId}/modules/${moduleId}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Voir le module
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}