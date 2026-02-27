'use client';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { exercisesApi } from '@/lib/api/exercises';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Pencil,
  Trophy,
  Clock,
  Zap,
  Code2,
  Lightbulb,
  AlertCircle,
  BookOpen,
  BarChart2,
  Users,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#1e1e2e] rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    ),
  },
);

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

const LANGUAGE_TO_MONACO: Record<string, string> = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
  HTML: 'html',
  CSS: 'css',
};

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const exerciseId = params.exerciseId as string;

  const {
    data: exercise,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesApi.getById(exerciseId),
    enabled: !!exerciseId,
  });

  // Leaderboard (top 10)
  const { data: leaderboard } = useQuery({
    queryKey: ['exercise-leaderboard', exerciseId],
    queryFn: () => exercisesApi.getLeaderboard(exerciseId, 10),
    enabled: !!exerciseId,
  });

  const editUrl = `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/exercise/${exerciseId}/edit`;
  const lessonUrl = `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}`;

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">
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

  if (!exercise) {
    return (
      <div className="container py-10">
        <div className="text-center">Exercice non trouvé</div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={lessonUrl}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la leçon
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{exercise.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="font-mono text-xs">
                {exercise.language}
              </Badge>
              <Badge className={DIFFICULTY_COLORS[exercise.difficulty] ?? 'bg-secondary'}>
                {DIFFICULTY_LABELS[exercise.difficulty] ?? exercise.difficulty}
              </Badge>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={editUrl}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="instructions">
            <TabsList className="mb-4">
              <TabsTrigger value="instructions">
                <BookOpen className="mr-2 h-4 w-4" />
                Instructions
              </TabsTrigger>
              <TabsTrigger value="starter">
                <Code2 className="mr-2 h-4 w-4" />
                Code de départ
              </TabsTrigger>
              {exercise.hints?.length > 0 && (
                <TabsTrigger value="hints">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Indices ({exercise.hints.length})
                </TabsTrigger>
              )}
              {leaderboard && leaderboard.length > 0 && (
                <TabsTrigger value="leaderboard">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Classement
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Énoncé de l'exercice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {exercise.instructions}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="starter">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    Code de départ (visible par les étudiants)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px] rounded-b-lg overflow-hidden">
                    <MonacoEditor
                      height="400px"
                      language={LANGUAGE_TO_MONACO[exercise.language] ?? 'javascript'}
                      value={exercise.starterCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        renderLineHighlight: 'none',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {exercise.hints?.length > 0 && (
              <TabsContent value="hints">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Indices disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {exercise.hints.map((hint, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                        >
                          <span className="font-mono text-xs bg-background border rounded px-2 py-0.5 mt-0.5 shrink-0 font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm">{hint}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {leaderboard && leaderboard.length > 0 && (
              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top 10 — Meilleures soumissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {leaderboard.map((entry) => (
                        <div
                          key={entry.userId}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <span
                            className={`font-bold text-lg w-8 text-center ${
                              entry.rank === 1
                                ? 'text-yellow-500'
                                : entry.rank === 2
                                  ? 'text-slate-400'
                                  : entry.rank === 3
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">@{entry.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{entry.passedTests} tests</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.executionTime}ms
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'exercice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 border p-3 text-center">
                  <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{exercise.points}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="rounded-lg bg-muted/50 border p-3 text-center">
                  <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{exercise.timeLimit}</p>
                  <p className="text-xs text-muted-foreground">Sec. max</p>
                </div>
                <div className="rounded-lg bg-muted/50 border p-3 text-center">
                  <Zap className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{exercise.memoryLimit}</p>
                  <p className="text-xs text-muted-foreground">MB mémoire</p>
                </div>
                <div className="rounded-lg bg-muted/50 border p-3 text-center">
                  <Lightbulb className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{exercise.hints?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Indices</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créé le</span>
                  <span>{new Date(exercise.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modifié le</span>
                  <span>{new Date(exercise.updatedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href={editUrl}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier l'exercice
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={lessonUrl}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la leçon
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard résumé */}
          {leaderboard && leaderboard.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  {leaderboard.length} participant{leaderboard.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Meilleur score :{' '}
                  <span className="font-semibold text-foreground">
                    @{leaderboard[0]?.username}
                  </span>{' '}
                  avec {leaderboard[0]?.passedTests} tests en{' '}
                  {leaderboard[0]?.executionTime}ms.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}