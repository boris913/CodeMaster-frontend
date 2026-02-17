'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { modulesApi } from '@/lib/api/modules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const moduleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

export default function CreateModulePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: (data: ModuleFormData) =>
      modulesApi.create(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast({
        title: 'Module créé',
        description: 'Le module a été ajouté avec succès',
      });
      router.push(`/courses/by-id/${courseId}/modules`);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le module',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ModuleFormData) => {
    createModuleMutation.mutate(data);
  };

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Ajouter un module</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau module</CardTitle>
          <CardDescription>
            Les modules regroupent plusieurs leçons. Donnez un titre clair et une description optionnelle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {createModuleMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createModuleMutation.error?.message || 'Une erreur est survenue'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">
                Titre du module <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="ex: Introduction à JavaScript"
                {...register('title')}
                disabled={createModuleMutation.isPending}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez brièvement le contenu de ce module..."
                {...register('description')}
                disabled={createModuleMutation.isPending}
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createModuleMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createModuleMutation.isPending}
              >
                {createModuleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer le module
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}