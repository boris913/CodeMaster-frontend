'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VideoPlayer } from '@/components/learning/video-player';
import { CodeEditor } from '@/components/learning/code-editor';
import { ProgressTracker } from '@/components/learning/progress-tracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  // Play,
  BookOpen,
  Code2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { coursesApi } from '@/lib/api/courses';
import { lessonsApi } from '@/lib/api/lessons';
import { progressApi } from '@/lib/api/progress';
import { commentsApi } from '@/lib/api/comments';
import { exercisesApi } from '@/lib/api/exercises';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LearningPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'exercise' | 'comments'>('content');
  // const [code, setCode] = useState<string>('// Votre code ici\nconsole.log("Bonjour, CodeMaster!");');
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getByIdOrSlug(courseId as string),
    enabled: !!courseId,
  });

  const { data: lesson } = useQuery({
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

  const { data: comments } = useQuery({
    queryKey: ['comments', lessonId],
    queryFn: () => commentsApi.getByLesson(lessonId as string),
    enabled: !!lessonId && activeTab === 'comments',
  });

  const { data: exercise } = useQuery({
    queryKey: ['exercise', lessonId],
    queryFn: () => exercisesApi.getByLesson(lessonId as string),
    enabled: !!lessonId && activeTab === 'exercise',
  });

  const completeLessonMutation = useMutation({
    mutationFn: () => lessonsApi.markAsCompleted(lessonId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      toast({
        title: 'Leçon terminée !',
        description: 'Vous avez terminé cette leçon avec succès',
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: (position: number) => lessonsApi.updateVideoPosition(lessonId as string, position),
  });

  const submitExerciseMutation = useMutation({
    mutationFn: (code: string) => exercisesApi.submit(exercise?.id!, { code, language: 'JAVASCRIPT' }),
    onSuccess: (data) => {
      toast({
        title: data.status === 'SUCCESS' ? 'Exercice réussi !' : 'Exercice échoué',
        description: data.status === 'SUCCESS' 
          ? `Vous avez passé ${data.passedTests}/${data.totalTests} tests`
          : 'Veuillez réessayer',
      });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!courseId || !lessonId) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, courseId, lessonId, router]);

  const handleRunCode = async (code: string) => {
    try {
      const result = await submitExerciseMutation.mutateAsync(code);
      return { success: result.status === 'SUCCESS', output: result.result || 'Aucun résultat' };
    } catch (error: any) {
      return { success: false, output: error.message || 'Une erreur est survenue' };
    }
  };

  const handleCompleteLesson = async () => {
    if (!lessonId) return;
    
    try {
      await completeLessonMutation.mutateAsync();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la leçon comme terminée',
        variant: 'destructive',
      });
    }
  };

  const handleVideoProgress = async (position: number) => {
    if (!lessonId) return;
    
    try {
      await updateProgressMutation.mutateAsync(position);
    } catch (error) {
      console.error('Failed to update video position:', error);
    }
  };

  const modules = course?.modules?.map(module => {
    const moduleProgress = courseProgress?.modules?.find(m => m.id === module.id);
    
    return {
      ...module,
      lessons: module.lessons?.map(lesson => {
        const lessonProgress = moduleProgress?.lessons?.find(l => l.id === lesson.id);
        
        return {
          ...lesson,
          completed: lessonProgress?.completed || false,
          current: lesson.id === lessonId,
          locked: false,
        };
      }) || [],
      progress: moduleProgress?.progress || 0,
    };
  }) || [];

  const currentModuleIndex = modules.findIndex(m => 
    m.lessons?.some(l => l.id === lessonId)
  );
  const currentLessonIndex = modules[currentModuleIndex]?.lessons?.findIndex(l => l.id === lessonId) || 0;

  const nextLesson = modules[currentModuleIndex]?.lessons?.[currentLessonIndex + 1] || 
                    modules[currentModuleIndex + 1]?.lessons?.[0];
  const prevLesson = modules[currentModuleIndex]?.lessons?.[currentLessonIndex - 1] || 
                    modules[currentModuleIndex - 1]?.lessons?.slice(-1)[0];

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/courses/${course.slug}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Retour au cours
                </Link>
              </Button>
              <div>
                <h1 className="font-heading text-xl font-bold">
                  {course.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {lesson.title} • {lesson.duration} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!lessonProgress?.completed && (
                <Button 
                  onClick={handleCompleteLesson}
                  disabled={completeLessonMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {completeLessonMutation.isPending ? 'En cours...' : 'Terminer la leçon'}
                </Button>
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
            <div className="sticky top-24">
              <ProgressTracker
                modules={modules}
                currentLessonId={lessonId as string}
                onLessonSelect={(id: string) => router.push(`/learning/${courseId}/${id}`)}
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="content">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Contenu
                </TabsTrigger>
                {exercise && (
                  <TabsTrigger value="exercise">
                    <Code2 className="mr-2 h-4 w-4" />
                    Exercice
                  </TabsTrigger>
                )}
                <TabsTrigger value="comments">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Discussions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Video Player */}
                {lesson?.videoUrl && (
                  <Card>
                    <CardContent className="p-0">
                      <VideoPlayer
                        src={lesson.videoUrl}
                        title={lesson.title}
                        onProgress={handleVideoProgress}
                        onComplete={handleCompleteLesson}
                        startAt={lessonProgress?.lastPosition || 0}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Lesson Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Contenu de la leçon</span>
                      <Badge variant="outline">
                        {lesson?.duration} minutes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose max-w-none" 
                      dangerouslySetInnerHTML={{ __html: lesson.content }} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {exercise && (
                <TabsContent value="exercise">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exercice pratique</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Instructions</h3>
                        <div dangerouslySetInnerHTML={{ __html: exercise.instructions }} />
                      </div>

                      <div className="h-[400px] border rounded-lg overflow-hidden">
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

              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comments?.data.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium">
                                {comment.user?.username?.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="font-medium">{comment.user?.username}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p>{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Resources */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      asChild
                      disabled={!prevLesson}
                    >
                      <Link href={prevLesson ? `/learning/${courseId}/${prevLesson.id}` : '#'}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Précédent
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      asChild
                      disabled={!nextLesson}
                    >
                      <Link href={nextLesson ? `/learning/${courseId}/${nextLesson.id}` : '#'}>
                        Suivant
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}