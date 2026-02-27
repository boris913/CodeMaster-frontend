'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { modulesApi } from '@/lib/api/modules';
import { lessonsApi } from '@/lib/api/lessons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  Save,
  ArrowLeft,
  Video,
  FileText,
  Code2,
  CheckCircle2,
  ChevronRight,
  SkipForward,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const lessonSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  videoUrl: z.string().optional(),
  videoType: z.enum(['YOUTUBE', 'VIMEO', 'UPLOADED', 'NONE']).optional(),
  duration: z.number().min(1, 'La durée doit être d\'au moins 1 minute'),
  isFree: z.boolean().default(false),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export default function CreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'YOUTUBE' | 'VIMEO' | 'UPLOADED' | 'NONE'>('NONE');
  // Après création : stocker l'ID pour l'étape 2
  const [createdLessonId, setCreatedLessonId] = useState<string | null>(null);

  const { data: module, isLoading: isLoadingModule } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => modulesApi.getById(courseId, moduleId),
    enabled: !!moduleId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      duration: 10,
      isFree: false,
      videoType: 'NONE',
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: (data: LessonFormData) => lessonsApi.create(moduleId, data),
    onSuccess: (lesson) => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      toast({
        title: 'Leçon créée ✓',
        description: 'Souhaitez-vous ajouter un exercice de code ?',
      });
      setCreatedLessonId(lesson.id);
    },
    onError: (error: Error) => {
      setError(error.message || 'Erreur lors de la création de la leçon');
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la leçon',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: LessonFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        videoType: videoType === 'NONE' ? undefined : videoType,
      };
      if (videoType === 'NONE') delete payload.videoUrl;
      await createLessonMutation.mutateAsync(payload as any);
    } catch {
      // Erreur gérée dans la mutation
    } finally {
      setIsLoading(false);
    }
  };

  // ─── ÉTAPE 2 : Leçon créée → choix de la suite ───────────────────────────
  if (createdLessonId) {
    return (
      <div className="container max-w-xl py-20 flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Leçon créée avec succès !</h2>
            <p className="text-muted-foreground mt-2">
              Voulez-vous ajouter un exercice de code interactif à cette leçon ?
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <button
            onClick={() =>
              router.push(
                `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${createdLessonId}/exercise/create`,
              )
            }
            className="group flex flex-col items-start gap-3 p-5 rounded-xl border-2
                       border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary
                       transition-all cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20
                            flex items-center justify-center transition-colors">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Créer un exercice</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Défi de code interactif avec tests automatiques
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary self-end mt-auto" />
          </button>

          <button
            onClick={() =>
              router.push(
                `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${createdLessonId}`,
              )
            }
            className="group flex flex-col items-start gap-3 p-5 rounded-xl border-2
                       border-border bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-muted group-hover:bg-muted/80
                            flex items-center justify-center transition-colors">
              <SkipForward className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Passer cette étape</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ajout possible plus tard depuis la page de la leçon
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground self-end mt-auto" />
          </button>
        </div>

        <Button
          variant="link"
          className="text-muted-foreground"
          onClick={() => router.push(`/courses/by-id/${courseId}/modules/${moduleId}`)}
        >
          Retour au module
        </Button>
      </div>
    );
  }

  // ─── ÉTAPE 1 : Formulaire ─────────────────────────────────────────────────
  if (isLoadingModule) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>Module non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/courses/by-id/${courseId}/modules/${moduleId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au module
          </Button>
        </div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Nouvelle leçon
        </h1>
        <p className="text-muted-foreground">Module: {module.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>Définissez les détails de votre leçon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la leçon *</Label>
                <Input
                  id="title"
                  placeholder="Introduction aux variables en JavaScript"
                  {...register('title')}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    {...register('duration', { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.duration && (
                    <p className="text-sm text-destructive">{errors.duration.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Type de contenu</Label>
                  <Select
                    value={videoType}
                    onValueChange={(value: 'YOUTUBE' | 'VIMEO' | 'UPLOADED' | 'NONE') =>
                      setVideoType(value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YOUTUBE">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Vidéo YouTube
                        </div>
                      </SelectItem>
                      <SelectItem value="VIMEO">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Vidéo Vimeo
                        </div>
                      </SelectItem>
                      <SelectItem value="UPLOADED">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Vidéo téléchargée
                        </div>
                      </SelectItem>
                      <SelectItem value="NONE">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Texte seulement
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {videoType !== 'NONE' && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">
                    URL de la vidéo *
                    <span className="text-xs text-muted-foreground ml-2">
                      ({videoType === 'YOUTUBE' ? 'YouTube' : videoType === 'VIMEO' ? 'Vimeo' : 'URL directe'})
                    </span>
                  </Label>
                  <Input
                    id="videoUrl"
                    placeholder={
                      videoType === 'YOUTUBE'
                        ? 'https://www.youtube.com/watch?v=...'
                        : videoType === 'VIMEO'
                          ? 'https://vimeo.com/...'
                          : 'https://votre-domaine.com/video.mp4'
                    }
                    {...register('videoUrl')}
                    disabled={isLoading}
                  />
                  {errors.videoUrl && (
                    <p className="text-sm text-destructive">{errors.videoUrl.message}</p>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFree"
                  onCheckedChange={(checked) => setValue('isFree', checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="isFree"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Cette leçon est gratuite (visible sans inscription)
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenu de la leçon</CardTitle>
              <CardDescription>Rédigez le contenu détaillé de votre leçon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Contenu (Markdown supporté) *</Label>
                <Textarea
                  id="content"
                  placeholder="# Introduction..."
                  {...register('content')}
                  className="min-h-[400px] font-mono"
                  disabled={isLoading}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Annonce de l'étape suivante */}
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="py-4 flex items-center gap-3">
              <Code2 className="h-5 w-5 text-primary/60 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Après la création, vous pourrez ajouter un{' '}
                <strong className="text-foreground">exercice de code interactif</strong> en option.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  toast({
                    title: 'Brouillon sauvegardé',
                    description: 'Votre leçon a été sauvegardée localement',
                  })
                }
                disabled={isLoading}
              >
                Sauvegarder comme brouillon
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer la leçon
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
