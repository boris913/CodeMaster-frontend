'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VideoPlayer } from '@/components/learning/video-player';
import { CodeEditor, type ExecutionResult } from '@/components/learning/code-editor';
import { ProgressTracker } from '@/components/learning/progress-tracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { coursesApi } from '@/lib/api/courses';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi } from '@/lib/api/progress';
import { commentsApi } from '@/lib/api/comments';
import {
  exercisesApi,
  type Language,
  type ExerciseResponse,
  type SubmissionResponse,
} from '@/lib/api/exercises';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  BookOpen,
  Code2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Download,
  Info,
  Users,
  Clock,
  Eye,
  Star,
  Loader2,
  AlertCircle,
  HelpCircle,
  X,
  ThumbsUp,
  Flag,
  Trophy,
  Zap,
  BarChart2,
} from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Types locaux
// ─────────────────────────────────────────────────────────────────────────────

interface LessonProgress {
  id?: string;          // optionnel : progressApi retourne id: string | undefined
  completed: boolean;
  lastPosition?: number;
  timeSpent?: number;
}

interface ModuleLesson {
  id: string;
  title: string;
  slug: string;
  duration: number;
  order: number;
  isFree?: boolean;
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
}

interface ModuleWithProgress {
  id: string;
  title: string;
  description?: string;
  lessons?: ModuleLesson[];
  progress?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  INTERMEDIATE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  ADVANCED:     'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

// ─────────────────────────────────────────────────────────────────────────────
// Composant : Affichage des résultats d'exécution
// ─────────────────────────────────────────────────────────────────────────────

interface ExecutionResultPanelProps {
  submission: SubmissionResponse;
}

function ExecutionResultPanel({ submission }: ExecutionResultPanelProps) {
  const { status, result, passedTests, totalTests, executionTime, memoryUsed } = submission;
  const success = status === 'SUCCESS';

  return (
    <div
      className={`rounded-lg border p-4 space-y-3 text-sm
        ${success
          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
          : 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'
        }`}
    >
      {/* En-tête résultat */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 font-semibold ${success ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
          {success ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>{success ? 'Tous les tests passent !' : `${passedTests}/${totalTests} tests réussis`}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {executionTime != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {executionTime}ms
            </span>
          )}
          {memoryUsed != null && (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {(memoryUsed / 1024).toFixed(1)}MB
            </span>
          )}
        </div>
      </div>

      {/* Barre de progression des tests */}
      {totalTests > 0 && (
        <div className="space-y-1">
          <Progress value={(passedTests / totalTests) * 100} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {passedTests} / {totalTests} tests réussis
          </p>
        </div>
      )}

      {/* Résultats par test */}
      {result?.testResults && result.testResults.length > 0 && (
        <div className="space-y-1.5">
          {result.testResults.map((t, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 text-xs px-2 py-1.5 rounded
                ${t.passed
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
                }`}
            >
              {t.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              )}
              <div>
                <span>{t.name ?? `Test ${i + 1}`}</span>
                {t.error && (
                  <p className="text-rose-500 mt-0.5 font-mono">{t.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Output brut */}
      {result?.output && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            Voir l'output complet
          </summary>
          <pre className="mt-2 p-2 rounded bg-black/5 dark:bg-white/5 text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap font-mono">
            {result.output}
          </pre>
        </details>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant : Section exercice complète
// ─────────────────────────────────────────────────────────────────────────────

interface ExercisePanelProps {
  exercise: ExerciseResponse;
  // onRun doit retourner ExecutionResult pour correspondre au type attendu par CodeEditorProps
  onRun: (code: string) => Promise<ExecutionResult>;
  lastSubmission: SubmissionResponse | null;
}

function ExercisePanel({ exercise, onRun, lastSubmission }: ExercisePanelProps) {
  const [activeSection, setActiveSection] = useState<'instructions' | 'hints'>('instructions');
  const difficultyLabel: Record<string, string> = {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex-1">{exercise.title}</CardTitle>
          <Badge className={DIFFICULTY_COLORS[exercise.difficulty] ?? ''}>
            {difficultyLabel[exercise.difficulty] ?? exercise.difficulty}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {exercise.language}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {exercise.points} pts
          </Badge>
        </div>

        {/* Meta : temps limite, mémoire */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Limite : {exercise.timeLimit}s
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Mémoire : {exercise.memoryLimit}MB
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Onglets internes : Instructions / Indices */}
        <div className="flex gap-1 border-b">
          {(['instructions', 'hints'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors -mb-px
                ${activeSection === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab === 'instructions' ? (
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Instructions
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Indices {exercise.hints?.length ? `(${exercise.hints.length})` : ''}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Instructions (Markdown) */}
        {activeSection === 'instructions' && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {exercise.instructions}
            </ReactMarkdown>
          </div>
        )}

        {/* Indices */}
        {activeSection === 'hints' && (
          <div>
            {!exercise.hints?.length ? (
              <p className="text-sm text-muted-foreground italic">
                Aucun indice disponible pour cet exercice.
              </p>
            ) : (
              <ol className="space-y-2">
                {exercise.hints.map((hint: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                      {i + 1}
                    </span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Éditeur de code */}
        <div className="h-[500px] border rounded-lg overflow-hidden">
          <CodeEditor
            language={exercise.language.toLowerCase() as any}
            defaultValue={exercise.starterCode}
            onRun={onRun}
          />
        </div>

        {/* Résultat de la dernière soumission */}
        {lastSubmission && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Résultat de votre soumission
            </p>
            <ExecutionResultPanel submission={lastSubmission} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'exercise' | 'comments'>('content');
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  // Dernier résultat de soumission pour l'affichage dans l'onglet exercice
  const [lastSubmission, setLastSubmission] = useState<SubmissionResponse | null>(null);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const timeTrackedRef = useRef<boolean>(false);

  // ─── Queries ───────────────────────────────────────────────────────────────

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getByIdOrSlug(courseId),
    enabled: !!courseId,
  });

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsApi.getByIdOrSlug(lessonId),
    enabled: !!lessonId,
  });

  const { data: courseProgress } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressApi.getCourseProgress(courseId),
    enabled: !!courseId && isAuthenticated,
  });

  const { data: lessonProgress } = useQuery<LessonProgress>({
    queryKey: ['lesson-progress', lessonId],
    queryFn: () => progressApi.getLessonProgress(lessonId),
    enabled: !!lessonId && isAuthenticated,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', lessonId],
    queryFn: () => commentsApi.getByLesson(lessonId, 1, 50),
    enabled: !!lessonId,
  });

  // Récupération de l'exercice complet via son ID (si présent dans la leçon)
  const exerciseId = lesson?.exercise?.id;
  const { data: exercise, isLoading: exerciseLoading } = useQuery<ExerciseResponse | null>({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesApi.getById(exerciseId!),
    enabled: !!exerciseId,
  });

  const hasExercise = !!exercise;
  const isExerciseLoading = exerciseLoading;

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const completeLessonMutation = useMutation({
    mutationFn: () => lessonsApi.markAsCompleted(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message ?? 'Impossible de marquer la leçon comme terminée',
        variant: 'destructive',
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ position, timeSpent }: { position?: number; timeSpent?: number }) =>
      progressApi.updateLessonProgress(lessonId, { lastPosition: position, timeSpent }),
    onError: (error: Error) => console.error('Failed to update progress:', error.message),
  });

  const submitExerciseMutation = useMutation<
    SubmissionResponse,
    Error,
    { code: string; language: Language }
  >({
    mutationFn: ({ code, language }) =>
      exercisesApi.submit(exercise!.id, { code, language }),
    onSuccess: (data: SubmissionResponse) => {
      setLastSubmission(data);
      toast({
        title: data.status === 'SUCCESS' ? '✅ Exercice réussi !' : '❌ Résultat incomplet',
        description:
          data.status === 'SUCCESS'
            ? `${data.passedTests}/${data.totalTests} tests réussis`
            : 'Consultez les résultats pour comprendre vos erreurs.',
        variant: data.status === 'SUCCESS' ? 'default' : 'destructive',
      });
      queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur d\'exécution',
        description: error.message ?? 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      commentsApi.create({ lessonId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] });
      setCommentContent('');
      setReplyTo(null);
      toast({ title: 'Commentaire ajouté', variant: 'default' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message ?? "Impossible d'ajouter le commentaire",
        variant: 'destructive',
      });
    },
  });

  // ─── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isAuthenticated && lessonId && !lessonProgress?.completed) {
      startTimeRef.current = Date.now();
      timeTrackedRef.current = false;
    }
    return () => {
      if (startTimeRef.current && !timeTrackedRef.current && !lessonProgress?.completed) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsedSeconds > 5) {
          updateProgressMutation.mutate({ timeSpent: elapsedSeconds });
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, lessonId, lessonProgress?.completed]);

  useEffect(() => {
    return () => {
      if (lessonProgress?.lastPosition) {
        updateProgressMutation.mutate({ position: lessonProgress.lastPosition });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonProgress?.lastPosition]);

  useEffect(() => {
    if (!courseId || !lessonId) {
      router.push('/dashboard');
    }
  }, [courseId, lessonId, router]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Appelé par <CodeEditor onRun={...} />
   * Retourne ExecutionResult (type attendu par CodeEditorProps.onRun).
   * Tous les champs sont requis dans ExecutionResult → on fournit des valeurs par défaut
   * dans les cas d'erreur plutôt que null/undefined.
   */
  const handleRunCode = async (code: string): Promise<ExecutionResult> => {
    // Valeur par défaut retournée en cas d'erreur précoce
    const errorResult = (msg: string): ExecutionResult => ({
      success: false,
      output: msg,   // CodeEditor.ExecutionResult n'a pas de champ 'error', on utilise 'output'
      executionTime: 0,
      memoryUsed: 0,
      testResults: [],
    });

    if (!exercise) {
      toast({
        title: 'Erreur',
        description: 'Aucun exercice associé à cette leçon',
        variant: 'destructive',
      });
      return errorResult('Aucun exercice trouvé');
    }

    try {
      const submission: SubmissionResponse = await submitExerciseMutation.mutateAsync({
        code,
        language: exercise.language, // Maintenant exercise est complet et language est de type Language
      });

      // Si le backend a renvoyé un ExecutionResult embedded, on l'utilise directement.
      // On ajoute 'success' (champ requis par CodeEditorProps mais absent de exercises.ExecutionResult).
      if (submission.result) {
        return {
          ...submission.result,
          success: submission.status === 'SUCCESS',
        };
      }

      // Fallback : submission sans result embedded (ex. status PENDING/TIMEOUT)
      return {
        success: submission.status === 'SUCCESS',
        output: submission.status !== 'SUCCESS' ? `Status : ${submission.status}` : '',
        executionTime: submission.executionTime ?? 0,
        memoryUsed: submission.memoryUsed ?? 0,
        testResults: [],
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Une erreur est survenue';
      return errorResult(msg);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lessonId) return;
    const elapsedSeconds = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

    try {
      await completeLessonMutation.mutateAsync();
      if (elapsedSeconds > 0) {
        await updateProgressMutation.mutateAsync({ timeSpent: elapsedSeconds });
      }
      timeTrackedRef.current = true;
      toast({
        title: '🎉 Leçon terminée !',
        description: 'Félicitations, vous avez terminé cette leçon.',
      });
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Impossible de marquer la leçon comme terminée';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    }
  };

  const handleVideoProgress = (position: number) => {
    updateProgressMutation.mutate({ position });
  };

  const handleAddComment = () => {
    if (!commentContent.trim()) return;
    createCommentMutation.mutate({ content: commentContent, parentId: replyTo?.id });
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
    setActiveTab('comments');
    setTimeout(() => {
      document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ─── Construction des modules avec progression ────────────────────────────

  const modules: ModuleWithProgress[] = course?.modules?.map((module: any) => {
    const moduleProgress = courseProgress?.modules?.find((m: any) => m.id === module.id);
    return {
      ...module,
      lessons: module.lessons?.map((l: any) => {
        const lp = moduleProgress?.lessons?.find((lp: any) => lp.id === l.id);
        return {
          ...l,
          completed: lp?.completed ?? false,
          current: l.id === lessonId,
          locked: false,
        };
      }) ?? [],
      progress: moduleProgress?.progress ?? 0,
    };
  }) ?? [];

  const currentModuleIndex = modules.findIndex((m) => m.lessons?.some((l) => l.id === lessonId));
  const currentLessonIndex = modules[currentModuleIndex]?.lessons?.findIndex((l) => l.id === lessonId) ?? 0;
  const nextLesson =
    modules[currentModuleIndex]?.lessons?.[currentLessonIndex + 1] ??
    modules[currentModuleIndex + 1]?.lessons?.[0];
  const prevLesson =
    modules[currentModuleIndex]?.lessons?.[currentLessonIndex - 1] ??
    modules[currentModuleIndex - 1]?.lessons?.slice(-1)[0];

  // ─── Skeleton de chargement ───────────────────────────────────────────────

  if (courseLoading || lessonLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1"><Skeleton className="h-96 w-full" /></div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-1"><Skeleton className="h-48 w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Leçon introuvable</h2>
        <p className="text-muted-foreground">
          La leçon que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Button asChild>
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Rendu principal
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b bg-card sticky top-0 z-30 backdrop-blur-sm bg-background/95">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/courses/by-slug/${course.slug}`}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Retour au cours
                  </Link>
                </Button>
                <div>
                  <h1 className="font-heading text-xl font-bold line-clamp-1">
                    {course.title}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{lesson.title}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{lesson.duration} min</span>
                    {lesson.views > 0 && (
                      <>
                        <span>•</span>
                        <Eye className="h-3 w-3" />
                        <span>{lesson.views} vues</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {courseProgress && (
                  <div className="hidden md:flex items-center gap-2 mr-4">
                    <span className="text-sm">
                      {courseProgress.completedLessons}/{courseProgress.totalLessons}
                    </span>
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${courseProgress.overallProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {!lessonProgress?.completed && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCompleteLesson}
                        disabled={completeLessonMutation.isPending || updateProgressMutation.isPending}
                        size="sm"
                      >
                        {completeLessonMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Terminer
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Marquer comme terminée</p></TooltipContent>
                  </Tooltip>
                )}
                {lessonProgress?.completed && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Terminée
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Contenu principal ────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">

            {/* Sidebar gauche – ProgressTracker */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <ProgressTracker
                  modules={modules}
                  currentLessonId={lessonId}
                  onLessonSelect={(id: string) => router.push(`/learn/${courseId}/${id}`)}
                />

                {course.instructor && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Instructeur
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={course.instructor.avatar} />
                          <AvatarFallback>
                            {course.instructor.firstName?.[0]}{course.instructor.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {course.instructor.firstName} {course.instructor.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{course.instructor.username}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating?.toFixed(1) ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Étudiants</span>
                      <span className="font-medium">{course.totalStudents ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Leçons</span>
                      <span className="font-medium">{course.totalLessons ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulté</span>
                      <Badge variant="outline" className="capitalize">
                        {course.difficulty?.toLowerCase() ?? '—'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contenu central – Tabs */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                <TabsList className="grid w-full" style={{ gridTemplateColumns: hasExercise ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' }}>
                  <TabsTrigger value="content">
                    <BookOpen className="mr-2 h-4 w-4 hidden sm:inline" />
                    Contenu
                  </TabsTrigger>

                  {hasExercise && (
                    <TabsTrigger value="exercise" className="relative">
                      <Code2 className="mr-2 h-4 w-4 hidden sm:inline" />
                      Exercice
                      {lastSubmission?.status === 'SUCCESS' && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 absolute -top-1 -right-1" />
                      )}
                    </TabsTrigger>
                  )}

                  <TabsTrigger value="comments" className="relative">
                    <MessageSquare className="mr-2 h-4 w-4 hidden sm:inline" />
                    Discussions
                    {(comments as any)?.data?.length ? (
                      <Badge
                        variant="secondary"
                        className="ml-2 absolute -top-2 -right-2 h-5 px-1 text-xs"
                      >
                        {(comments as any).data.length}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                </TabsList>

                {/* ── Onglet Contenu ──────────────────────────────────────── */}
                <TabsContent value="content" className="space-y-6">
                  {lesson?.videoUrl && (
                    <Card className="overflow-hidden">
                      <VideoPlayer
                        src={lesson.videoUrl}
                        title={lesson.title}
                        onProgress={handleVideoProgress}
                        onComplete={handleCompleteLesson}
                        startAt={lessonProgress?.lastPosition ?? 0}
                      />
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Contenu de la leçon</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} min
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReactMarkdown
                        className="prose max-w-none dark:prose-invert"
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {lesson.content}
                      </ReactMarkdown>
                    </CardContent>
                  </Card>

                  {/* Call-to-action vers l'exercice si la leçon en a un */}
                  {hasExercise && (
                    <Card className="border-dashed border-primary/40 bg-primary/5">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Code2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Exercice disponible</p>
                            <p className="text-xs text-muted-foreground">
                              {exercise?.title} · {exercise?.points} points
                            </p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => setActiveTab('exercise')}>
                          Pratiquer
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ── Onglet Exercice ─────────────────────────────────────── */}
                {hasExercise && (
                  <TabsContent value="exercise">
                    {isExerciseLoading ? (
                      <Card>
                        <CardContent className="py-12">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Chargement de l'exercice…</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <ExercisePanel
                        exercise={exercise!}
                        onRun={handleRunCode}
                        lastSubmission={lastSubmission}
                      />
                    )}
                  </TabsContent>
                )}

                {/* ── Onglet Discussions ──────────────────────────────────── */}
                <TabsContent value="comments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Discussions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Formulaire */}
                      <div id="comment-form" className="space-y-2">
                        {replyTo && (
                          <div className="flex items-center justify-between bg-accent/50 p-2 rounded-md text-sm">
                            <span>
                              Répondre à{' '}
                              <span className="font-semibold">@{replyTo.username}</span>
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyTo(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <Textarea
                          placeholder={
                            replyTo
                              ? `Répondre à @${replyTo.username}…`
                              : 'Posez une question ou partagez votre avis…'
                          }
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleAddComment}
                            disabled={createCommentMutation.isPending || !commentContent.trim()}
                          >
                            {createCommentMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {replyTo ? 'Répondre' : 'Commenter'}
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Liste des commentaires */}
                      {commentsLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : !(comments as any)?.data?.length ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Soyez le premier à commenter cette leçon !
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                          {(comments as any).data.map((comment: any) => (
                            <div
                              key={comment.id}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.user?.avatar} />
                                  <AvatarFallback>
                                    {comment.user?.username?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2 mb-1">
                                    <span className="font-medium">
                                      {comment.user?.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.createdAt).toLocaleString('fr-FR')}
                                    </span>
                                    {comment.isEdited && (
                                      <Badge variant="outline" className="text-xs">
                                        modifié
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm break-words">{comment.content}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button variant="ghost" size="sm" className="h-7 px-2">
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Aimer</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2"
                                      onClick={() =>
                                        handleReply(comment.id, comment.user?.username)
                                      }
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Répondre</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 px-2">
                                      <Flag className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Réponses */}
                              {comment.replies?.length > 0 && (
                                <div className="ml-12 space-y-3 mt-2">
                                  {comment.replies.map((reply: any) => (
                                    <div key={reply.id} className="flex items-start gap-3">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={reply.user?.avatar} />
                                        <AvatarFallback>
                                          {reply.user?.username?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">
                                            {reply.user?.username}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(reply.createdAt).toLocaleString('fr-FR')}
                                          </span>
                                        </div>
                                        <p className="text-sm">{reply.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          <div ref={commentsEndRef} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar droite – Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Navigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!prevLesson}
                            asChild={!!prevLesson}
                          >
                            {prevLesson ? (
                              <Link href={`/learn/${courseId}/${prevLesson.id}`}>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Préc.
                              </Link>
                            ) : (
                              <span className="flex items-center justify-center">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Préc.
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {prevLesson
                              ? `Préc. : ${prevLesson.title}`
                              : 'Pas de leçon précédente'}
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!nextLesson}
                            asChild={!!nextLesson}
                          >
                            {nextLesson ? (
                              <Link href={`/learn/${courseId}/${nextLesson.id}`}>
                                Suiv.
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Link>
                            ) : (
                              <span className="flex items-center justify-center">
                                Suiv.
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {nextLesson
                              ? `Suiv. : ${nextLesson.title}`
                              : 'Dernière leçon du cours'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions rapides */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/courses/by-slug/${course.slug}`}>
                        <Info className="mr-2 h-4 w-4" />
                        Voir le cours
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.print()}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exporter en PDF
                    </Button>
                    {hasExercise && (
                      <Button
                        variant="outline"
                        className="w-full justify-start text-primary border-primary/40"
                        onClick={() => setActiveTab('exercise')}
                      >
                        <Code2 className="mr-2 h-4 w-4" />
                        Aller à l'exercice
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {course.tags?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: any) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}