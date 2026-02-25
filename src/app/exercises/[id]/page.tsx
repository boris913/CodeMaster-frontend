'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { exercisesApi } from '@/lib/api/exercises';
import { CodeEditor } from '@/components/learning/code-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trophy, Users, TrendingUp, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export default function ExerciseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('instructions');

  const { 
    data: exercise, 
    isLoading: isLoadingExercise,
    isError: isErrorExercise,
    error: exerciseError 
  } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exercisesApi.getById(id as string),
  });

  const { 
    data: submissions,
    isLoading: isLoadingSubmissions 
  } = useQuery({
    queryKey: ['submissions', id],
    queryFn: () => exercisesApi.getSubmissions(id as string, 1, 5),
    enabled: !!user,
  });

  const { 
    data: leaderboard,
    isLoading: isLoadingLeaderboard 
  } = useQuery({
    queryKey: ['leaderboard', id],
    queryFn: () => exercisesApi.getLeaderboard(id as string, 3),
  });

  if (isLoadingExercise) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isErrorExercise) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            {exerciseError instanceof Error ? exerciseError.message : 'Erreur lors du chargement de l\'exercice'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>Exercice non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  const difficultyColor = {
    BEGINNER: 'bg-green-500/10 text-green-700',
    INTERMEDIATE: 'bg-yellow-500/10 text-yellow-700',
    ADVANCED: 'bg-red-500/10 text-red-700',
  }[exercise.difficulty];

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">{exercise.title}</h1>
          <Badge className={difficultyColor}>
            {exercise.difficulty}
          </Badge>
          <Badge variant="outline">{exercise.language}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/exercises/${id}/submissions`)}>
            <Users className="mr-2 h-4 w-4" />
            Mes soumissions
          </Button>
          <Button variant="outline" onClick={() => router.push(`/exercises/${id}/leaderboard`)}>
            <Trophy className="mr-2 h-4 w-4" />
            Classement
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="submissions">Mes soumissions</TabsTrigger>
            </TabsList>
            <TabsContent value="instructions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown>
                      {exercise.instructions}
                    </ReactMarkdown>
                  </div>
                  {exercise.hints && exercise.hints.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Indices</h3>
                      {exercise.hints.map((hint, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{hint}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="submissions">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des soumissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSubmissions ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : submissions?.data.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucune soumission pour le moment
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {submissions?.data.map((sub) => (
                        <div key={sub.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <Badge variant={sub.status === 'SUCCESS' ? 'default' : 'destructive'}>
                              {sub.status}
                            </Badge>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {sub.passedTests}/{sub.totalTests} tests
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points</span>
                <span className="font-bold">{exercise.points} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temps limite</span>
                <span>{exercise.timeLimit} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mémoire limite</span>
                <span>{exercise.memoryLimit} MB</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : leaderboard?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun résultat
                </p>
              ) : (
                leaderboard?.map((entry, i) => (
                  <div key={entry.userId} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-muted-foreground">
                        #{i + 1}
                      </span>
                      <span>{entry.user?.username}</span>
                    </div>
                    <Badge variant="outline">
                      {entry.passedTests}/{entry.totalTests}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" asChild>
            <a href={`/learn/${exercise.lesson?.module.course.id}/${exercise.lessonId}`}>
              <TrendingUp className="mr-2 h-5 w-5" />
              Commencer l'exercice
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}