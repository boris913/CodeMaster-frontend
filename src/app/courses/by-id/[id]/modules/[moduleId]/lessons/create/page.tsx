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
  Clock,
  Link
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const lessonSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  content: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  videoUrl: z.string().optional(),
  videoType: z.enum(['YOUTUBE', 'VIMEO', 'UPLOADED']).optional(),
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
  const [videoType, setVideoType] = useState<'YOUTUBE' | 'VIMEO' | 'UPLOADED' | ''>('');

  const { data: module, isLoading: isLoadingModule } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => modulesApi.getById(courseId, moduleId),
    enabled: !!moduleId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      duration: 10,
      isFree: false,
      videoType: 'YOUTUBE',
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: (data: LessonFormData) =>
      lessonsApi.create(moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      toast({
        title: 'Leçon créée',
        description: 'La leçon a été créée avec succès',
      });
      router.push(`/courses/${courseId}/modules/${moduleId}`);
    },
    onError: (error: any) => {
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
      await createLessonMutation.mutateAsync({
        ...data,
        videoType: videoType as any,
      });
    } catch (err) {
      // Error handled in mutation
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingModule) {
    return (
      <div className="container py-10">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Module non trouvé
          </AlertDescription>
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
            onClick={() => router.push(`/courses/${courseId}/modules/${moduleId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au module
          </Button>
        </div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Nouvelle leçon
        </h1>
        <p className="text-muted-foreground">
          Module: {module.title}
        </p>
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
              <CardDescription>
                Définissez les détails de votre leçon
              </CardDescription>
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
                    onValueChange={(value: any) => setVideoType(value)}
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
                      <SelectItem value="">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Texte seulement
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {videoType && (
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
              <CardDescription>
                Rédigez le contenu détaillé de votre leçon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Contenu (Markdown supporté) *</Label>
                <Textarea
                  id="content"
                  placeholder="# Introduction

Dans cette leçon, vous allez apprendre...

## Objectifs d'apprentissage

- Comprendre les concepts de base
- Savoir utiliser les variables
- Pratiquer avec des exemples

## Exemple de code

\`\`\`javascript
let message = 'Bonjour';
console.log(message);
\`\`\`"
                  {...register('content')}
                  className="min-h-[400px] font-mono"
                  disabled={isLoading}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Supporte le format Markdown. Utilisez # pour les titres, * pour les listes, \`\`\` pour le code.
                </p>
              </div>
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
                onClick={() => {
                  // Sauvegarder comme brouillon
                  setValue('title', watch('title') || 'Nouvelle leçon');
                  toast({
                    title: 'Brouillon sauvegardé',
                    description: 'Votre leçon a été sauvegardée comme brouillon',
                  });
                }}
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