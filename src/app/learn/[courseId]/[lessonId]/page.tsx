'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VideoPlayer } from '@/components/learning/video-player';
import { CodeEditor } from '@/components/learning/code-editor';
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
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { coursesApi } from '@/lib/api/courses';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi } from '@/lib/api/progress';
import { commentsApi } from '@/lib/api/comments';
import { exercisesApi, type Language } from '@/lib/api/exercises';
import {
  BookOpen,
  Code2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
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
} from 'lucide-react';
import Link from 'next/link';

// Types locaux
interface ModuleWithProgress {
  id: string;
  title: string;
  description?: string;
  lessons?: Array<{
    id: string;
    title: string;
    slug: string;
    duration: number;
    order: number;
    isFree?: boolean;
    completed?: boolean;
    current?: boolean;
    locked?: boolean;
  }>;
  progress?: number;
}

export default function LearningPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'exercise' | 'comments'>('content');
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getByIdOrSlug(courseId as string),
    enabled: !!courseId,
  });

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsApi.getByIdOrSlug(lessonId as string),
    enabled: !!lessonId,
  });

  const { data: courseProgress } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressApi.getCourseProgress(courseId as string),
    enabled: !!courseId && isAuthenticated,
  });

  const { data: lessonProgress } = useQuery({
    queryKey: ['lesson-progress', lessonId],
    queryFn: () => progressApi.getLessonProgress(lessonId as string),
    enabled: !!lessonId && isAuthenticated,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', lessonId],
    queryFn: () => commentsApi.getByLesson(lessonId as string, 1, 50),
    enabled: !!lessonId,
  });

  const { data: exercise } = useQuery({
    queryKey: ['exercise', lessonId],
    queryFn: () => exercisesApi.getByLesson(lessonId as string),
    enabled: !!lessonId,
  });

  // Mutations
  const completeLessonMutation = useMutation({
    mutationFn: () => lessonsApi.markAsCompleted(lessonId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      toast({
        title: '🎉 Leçon terminée !',
        description: 'Félicitations, vous avez terminé cette leçon.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de marquer la leçon comme terminée',
        variant: 'destructive',
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: (position: number) => lessonsApi.updateVideoPosition(lessonId as string, position),
    onError: (error) => console.error('Failed to update progress:', error),
  });

  const submitExerciseMutation = useMutation({
    mutationFn: ({ code, language }: { code: string; language: Language }) =>
      exercisesApi.submit(exercise?.id!, { code, language }),
    onSuccess: (data) => {
      toast({
        title: data.status === 'SUCCESS' ? '✅ Exercice réussi !' : '❌ Exercice échoué',
        description:
          data.status === 'SUCCESS'
            ? `Vous avez passé ${data.passedTests}/${data.totalTests} tests`
            : 'Consultez les résultats détaillés pour comprendre vos erreurs.',
        variant: data.status === 'SUCCESS' ? 'default' : 'destructive',
      });
      queryClient.invalidateQueries({ queryKey: ['exercise', lessonId] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      commentsApi.create({ lessonId: lessonId as string, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] });
      setCommentContent('');
      setReplyTo(null);
      toast({ title: 'Commentaire ajouté', variant: 'default' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d’ajouter le commentaire',
        variant: 'destructive',
      });
    },
  });

  // Effet pour rediriger si non authentifié ou si les paramètres sont manquants
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!courseId || !lessonId) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, courseId, lessonId, router]);

  // Sauvegarde automatique de la position vidéo à la fermeture
  useEffect(() => {
    return () => {
      if (lessonProgress?.lastPosition) {
        updateProgressMutation.mutate(lessonProgress.lastPosition);
      }
    };
  }, [lessonProgress?.lastPosition, updateProgressMutation]);

  const handleRunCode = async (code: string) => {
    if (!exercise?.id) {
      toast({
        title: 'Erreur',
        description: 'Aucun exercice associé à cette leçon',
        variant: 'destructive',
      });
      return { success: false, output: 'Aucun exercice trouvé' };
    }

    try {
      const result = await submitExerciseMutation.mutateAsync({
        code,
        language: exercise.language,
      });

      const testResults = result.result?.testResults || [];
      const passedTests = testResults.filter((t: any) => t.passed).length;
      const totalTests = testResults.length;

      return {
        success: result.status === 'SUCCESS',
        output: result.result?.output || result.result?.error || 'Aucun résultat',
        testResults,
        passedTests,
        totalTests,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.message || 'Une erreur est survenue',
        testResults: [],
        passedTests: 0,
        totalTests: 0,
      };
    }
  };

  const handleCompleteLesson = async () => {
    if (!lessonId) return;
    completeLessonMutation.mutate();
  };

  const handleVideoProgress = (position: number) => {
    updateProgressMutation.mutate(position);
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

  // Construction des modules avec progression
  const modules: ModuleWithProgress[] = course?.modules?.map(module => {
    const moduleProgress = courseProgress?.modules?.find(m => m.id === module.id);
    return {
      ...module,
      lessons: module.lessons?.map(lesson => {
        const lessonProgress = moduleProgress?.lessons?.find(l => l.id === lesson.id);
        return {
          ...lesson,
          completed: lessonProgress?.completed || false,
          current: lesson.id === lessonId,
          locked: false, // À remplacer par une vraie logique si nécessaire
        };
      }) || [],
      progress: moduleProgress?.progress || 0,
    };
  }) || [];

  const currentModuleIndex = modules.findIndex(m => m.lessons?.some(l => l.id === lessonId));
  const currentLessonIndex = modules[currentModuleIndex]?.lessons?.findIndex(l => l.id === lessonId) || 0;
  const nextLesson = modules[currentModuleIndex]?.lessons?.[currentLessonIndex + 1] ||
    modules[currentModuleIndex + 1]?.lessons?.[0];
  const prevLesson = modules[currentModuleIndex]?.lessons?.[currentLessonIndex - 1] ||
    modules[currentModuleIndex - 1]?.lessons?.slice(-1)[0];

  // Affichage des skeletons pendant le chargement
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
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-48 w-full" />
            </div>
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
        <p className="text-muted-foreground">La leçon que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button asChild>
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        {/* Header avec progression */}
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
                    <div className="text-sm">
                      Progression: {courseProgress.completedLessons}/{courseProgress.totalLessons}
                    </div>
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
                        disabled={completeLessonMutation.isPending}
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
                    <TooltipContent>
                      <p>Marquer comme terminée</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Progress Tracker */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <ProgressTracker
                  modules={modules}
                  currentLessonId={lessonId as string}
                  onLessonSelect={(id: string) => router.push(`/learn/${courseId}/${id}`)}
                />

                {/* Instructeur */}
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
                          <p className="text-sm text-muted-foreground">@{course.instructor.username}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Statistiques du cours */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Note moyenne</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Étudiants</span>
                      <span className="font-medium">{course.totalStudents}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Leçons</span>
                      <span className="font-medium">{course.totalLessons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulté</span>
                      <Badge variant="outline" className="capitalize">
                        {course.difficulty.toLowerCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Center Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="content" className="relative">
                    <BookOpen className="mr-2 h-4 w-4 hidden sm:inline" />
                    <span>Contenu</span>
                  </TabsTrigger>
                  {exercise && (
                    <TabsTrigger value="exercise">
                      <Code2 className="mr-2 h-4 w-4 hidden sm:inline" />
                      <span>Exercice</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="comments" className="relative">
                    <MessageSquare className="mr-2 h-4 w-4 hidden sm:inline" />
                    <span>Discussions</span>
                    {comments?.data?.length ? (
                      <Badge variant="secondary" className="ml-2 absolute -top-2 -right-2 h-5 px-1 text-xs">
                        {comments.data.length}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                </TabsList>

                {/* Onglet Contenu */}
                <TabsContent value="content" className="space-y-6">
                  {lesson?.videoUrl && (
                    <Card className="overflow-hidden">
                      <VideoPlayer
                        src={lesson.videoUrl}
                        title={lesson.title}
                        onProgress={handleVideoProgress}
                        onComplete={handleCompleteLesson}
                        startAt={lessonProgress?.lastPosition || 0}
                      />
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Contenu de la leçon</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} minutes
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Exercice */}
                {exercise && (
                  <TabsContent value="exercise">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {exercise.title}
                          <Badge variant="secondary" className="ml-2">
                            {exercise.language}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {exercise.difficulty.toLowerCase()}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Instructions
                          </h3>
                          <div dangerouslySetInnerHTML={{ __html: exercise.instructions }} />
                        </div>

                        {exercise.hints?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Indices</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {exercise.hints.map((hint, i) => (
                                <li key={i}>{hint}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="h-[500px] border rounded-lg overflow-hidden">
                          <CodeEditor
                            language={exercise.language.toLowerCase() as any}
                            defaultValue={exercise.starterCode}
                            onRun={handleRunCode}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Onglet Discussions */}
                <TabsContent value="comments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Discussions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Formulaire de commentaire */}
                      <div id="comment-form" className="space-y-2">
                        {replyTo && (
                          <div className="flex items-center justify-between bg-accent/50 p-2 rounded-md text-sm">
                            <span>
                              Répondre à <span className="font-semibold">@{replyTo.username}</span>
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <Textarea
                          placeholder={replyTo ? `Répondre à @${replyTo.username}...` : 'Posez une question ou partagez votre avis...'}
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleAddComment} disabled={createCommentMutation.isPending}>
                            {createCommentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                      ) : !comments?.data || comments.data.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Soyez le premier à commenter cette leçon !
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {comments.data.map((comment) => (
                            <div key={comment.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.user?.avatar} />
                                  <AvatarFallback>
                                    {comment.user?.username?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2 mb-1">
                                    <span className="font-medium">{comment.user?.username}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                    {comment.isEdited && (
                                      <Badge variant="outline" className="text-xs">modifié</Badge>
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
                                      onClick={() => handleReply(comment.id, comment.user?.username)}
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
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex items-start gap-3">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={reply.user?.avatar} />
                                        <AvatarFallback>
                                          {reply.user?.username?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">{reply.user?.username}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(reply.createdAt).toLocaleString()}
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

            {/* Right Sidebar - Navigation et actions rapides */}
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
                            asChild={!!prevLesson}
                            disabled={!prevLesson}
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
                          <p>{prevLesson ? `Leçon précédente : ${prevLesson.title}` : 'Pas de leçon précédente'}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1"
                            asChild={!!nextLesson}
                            disabled={!nextLesson}
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
                          <p>{nextLesson ? `Leçon suivante : ${nextLesson.title}` : 'Dernière leçon'}</p>
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
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.print()}>
                      <Download className="mr-2 h-4 w-4" />
                      Exporter en PDF
                    </Button>
                  </CardContent>
                </Card>

                {/* Tags du cours */}
                {course.tags?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag) => (
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