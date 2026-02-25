'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulesApi } from '@/lib/api/modules';
import { lessonsApi } from '@/lib/api/lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Save,
  Clock,
  BookOpen,
  ChevronRight,
  Video,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const editModuleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
});

type EditModuleFormData = z.infer<typeof editModuleSchema>;

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Récupérer les détails du module
  const {
    data: module,
    isLoading: isLoadingModule,
    error: moduleError,
  } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => modulesApi.getById(courseId, moduleId),
    enabled: !!courseId && !!moduleId,
  });

  // Récupérer les leçons du module
  const {
    data: lessons,
    isLoading: isLoadingLessons,
    error: lessonsError,
  } = useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: () => lessonsApi.getByModule(moduleId),
    enabled: !!moduleId,
  });

  // Mise à jour du module
  const updateModuleMutation = useMutation({
    mutationFn: (data: EditModuleFormData) =>
      modulesApi.update(courseId, moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast({
        title: 'Module mis à jour',
        description: 'Les modifications ont été enregistrées',
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le module',
        variant: 'destructive',
      });
    },
  });

  // Suppression du module
  const deleteModuleMutation = useMutation({
    mutationFn: () => modulesApi.delete(courseId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast({
        title: 'Module supprimé',
        description: 'Le module a été supprimé avec succès',
      });
      router.push(`/courses/by-id/${courseId}/modules`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le module',
        variant: 'destructive',
      });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditModuleFormData>({
    resolver: zodResolver(editModuleSchema),
    values: module
      ? {
          title: module.title,
          description: module.description || '',
        }
      : undefined,
  });

  if (isLoadingModule) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (lessonsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erreur lors du chargement des leçons.</AlertDescription>
      </Alert>
    );
  }
  
  if (moduleError || !module) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Module non trouvé ou vous n'avez pas les droits nécessaires.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    );
  }

  const handleDeleteConfirm = () => {
    deleteModuleMutation.mutate();
  };

  return (
    <div className="container py-10">
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Gestion du module</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Informations du module */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{module.title}</CardTitle>
          {module.description && (
            <CardDescription>{module.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Cours associé</p>
              <p className="font-medium">{module.courseId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre de leçons</p>
              <p className="font-medium">{lessons?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée totale</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lessons?.reduce((acc, l) => acc + l.duration, 0) || 0} min
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ordre</p>
              <p className="font-medium">Module {module.order}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des leçons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Leçons</CardTitle>
            <CardDescription>
              Gérez les leçons de ce module
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() =>
              router.push(
                `/courses/by-id/${courseId}/modules/${moduleId}/lessons/create`
              )
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une leçon
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingLessons ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : lessons && lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} min
                        </span>
                        {lesson.videoUrl ? (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Vidéo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Texte
                          </span>
                        )}
                        {lesson.isFree && (
                          <Badge variant="outline" className="text-xs">
                            Gratuit
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lesson.id}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Aucune leçon</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Commencez par ajouter votre première leçon.
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  router.push(
                    `/courses/by-id/${courseId}/modules/${moduleId}/lessons/create`
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une leçon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le module</DialogTitle>
            <DialogDescription>
              Modifiez le titre et la description du module.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => updateModuleMutation.mutate(data))}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre du module *</Label>
                <Input
                  id="edit-title"
                  {...register('title')}
                  disabled={updateModuleMutation.isPending}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  {...register('description')}
                  disabled={updateModuleMutation.isPending}
                  className="min-h-[100px]"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateModuleMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateModuleMutation.isPending}>
                {updateModuleMutation.isPending ? (
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le module</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible et
              supprimera également toutes les leçons associées.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Module : <span className="font-medium text-foreground">{module.title}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Leçons concernées : <span className="font-medium">{lessons?.length || 0}</span>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteModuleMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteModuleMutation.isPending}
            >
              {deleteModuleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}