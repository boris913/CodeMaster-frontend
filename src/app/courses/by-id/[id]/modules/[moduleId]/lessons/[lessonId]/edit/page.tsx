'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { lessonsApi } from '@/lib/api/lessons';
import { exercisesApi } from '@/lib/api/exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Save,
  ArrowLeft,
  Code2,
  Plus,
  Edit,
  Eye,
  Trash2,
  Trophy,
  Clock,
  Zap,
} from 'lucide-react';

const lessonSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  videoType: z.enum(['YOUTUBE', 'VIMEO', 'UPLOADED', 'NONE']).optional(),
  duration: z.coerce.number().min(1, 'La durée doit être d\'au moins 1 minute'),
  isFree: z.boolean().default(false),
});

type LessonFormData = z.infer<typeof lessonSchema>;

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
};

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const basePath = `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}`;

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsApi.getByIdOrSlug(lessonId),
    enabled: !!lessonId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: LessonFormData) => {
      const { videoType, ...apiData } = data;
      if (apiData.videoUrl === '') delete apiData.videoUrl;
      return lessonsApi.update(lessonId, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      toast({ title: 'Leçon mise à jour', description: 'Les modifications ont été enregistrées.' });
      router.push(basePath);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour la leçon',
        variant: 'destructive',
      });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => exercisesApi.delete(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] }); // Recharger la leçon
      toast({ title: 'Exercice supprimé' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    values: lesson && {
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      videoType: lesson.videoType || 'NONE',
      duration: lesson.duration,
      isFree: lesson.isFree,
    },
  });

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="container py-10 text-center">Leçon non trouvée</div>;
  }

  const hasExercise = !!lesson.exercise;

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Éditer la leçon</h1>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <div className="space-y-6">
          {/* ── Informations de base ───────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" {...register('title')} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input id="duration" type="number" {...register('duration')} />
                </div>
                <div className="space-y-2">
                  <Label>Type de vidéo</Label>
                  <Select
                    value={watch('videoType')}
                    onValueChange={(v: 'YOUTUBE' | 'VIMEO' | 'UPLOADED' | 'NONE') =>
                      setValue('videoType', v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Texte seulement</SelectItem>
                      <SelectItem value="YOUTUBE">YouTube</SelectItem>
                      <SelectItem value="VIMEO">Vimeo</SelectItem>
                      <SelectItem value="UPLOADED">Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {watch('videoType') !== 'NONE' && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">URL de la vidéo</Label>
                  <Input id="videoUrl" {...register('videoUrl')} />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFree"
                  checked={watch('isFree')}
                  onCheckedChange={(checked) => setValue('isFree', checked as boolean)}
                />
                <Label htmlFor="isFree">Leçon gratuite (visible sans inscription)</Label>
              </div>
            </CardContent>
          </Card>

          {/* ── Contenu ───────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">Contenu (Markdown supporté)</Label>
                <Textarea
                  id="content"
                  {...register('content')}
                  className="min-h-[400px] font-mono"
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Exercice de code ──────────────────────────────────────── */}
          <Card className={hasExercise ? 'border-primary/30' : 'border-dashed'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Code2 className="h-5 w-5 text-primary" />
                    Exercice de code
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Exercice interactif associé à cette leçon
                  </CardDescription>
                </div>

                {hasExercise && (
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={`${basePath}/exercise/${lesson.exercise!.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Link>
                    </Button>
                    <Button type="button" size="sm" asChild>
                      <Link href={`${basePath}/exercise/${lesson.exercise!.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Éditer
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {hasExercise ? (
                <div className="space-y-3">
                  {/* Résumé de l'exercice */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">{lesson.exercise!.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {lesson.exercise!.language}
                        </Badge>
                        <Badge variant="secondary">
                          {DIFFICULTY_LABELS[lesson.exercise!.difficulty] ?? lesson.exercise!.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {lesson.exercise!.points} pts
                        </span>
                        {/* <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.exercise!.timeLimit}s
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {lesson.exercise!.memoryLimit}MB
                        </span> */}
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'exercice ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. L'exercice et toutes les soumissions
                            associées seront définitivement supprimés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteExerciseMutation.mutate(lesson.exercise!.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {deleteExerciseMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Supprimer'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Pour modifier le code, la solution ou les tests, utilisez le bouton "Éditer" ci-dessus.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucun exercice associé à cette leçon.
                  </p>
                  <Button type="button" size="sm" asChild>
                    <Link href={`${basePath}/exercise/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un exercice
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
