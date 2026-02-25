'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { lessonsApi } from '@/lib/api/lessons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const lessonSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(50),
  videoUrl: z.string().url().optional().or(z.literal('')),
  videoType: z.enum(['YOUTUBE', 'VIMEO', 'UPLOADED', 'NONE']).optional(),
  duration: z.coerce.number().min(1),
  isFree: z.boolean().default(false),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Déterminer l'ID de la leçon selon la route
  const lessonId = (params.lessonId as string) || (params.id as string);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsApi.getByIdOrSlug(lessonId),
    enabled: !!lessonId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: LessonFormData) => lessonsApi.update(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      toast({ title: 'Leçon mise à jour' });
      // Retourner à la page de détail de la leçon (route simple ou complète)
      router.push(`/lessons/${lessonId}`);
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
    return <div className="container py-10">Leçon non trouvée</div>;
  }

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
                    onValueChange={(v) => setValue('videoType', v as any)}
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>
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