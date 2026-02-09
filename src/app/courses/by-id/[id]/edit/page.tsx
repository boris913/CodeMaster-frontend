'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { coursesApi } from '@/lib/api/courses';
import { modulesApi } from '@/lib/api/modules';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2,
  Save,
  Eye,
  Plus,
  GripVertical,
  Settings,
  BookOpen,
  Clock,
  Tag,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const courseSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  slug: z.string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit être en minuscules avec des tirets'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  shortDescription: z.string().min(20, 'La courte description doit contenir au moins 20 caractères').max(200),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  duration: z.number().min(1, 'La durée doit être d\'au moins 1 heure'),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [tags, setTags] = useState<string[]>([]);
  const [modules, setModules] = useState<any[]>([]);

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getByIdOrSlug(courseId),
    enabled: !!courseId,
  });

  const { data: courseModules, isLoading: isLoadingModules } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => modulesApi.getByCourse(courseId),
    enabled: !!courseId,
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: Partial<CourseFormData>) => 
      coursesApi.update(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast({
        title: 'Cours mis à jour',
        description: 'Les modifications ont été enregistrées',
      });
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: () => coursesApi.publish(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast({
        title: 'Cours publié',
        description: 'Votre cours est maintenant visible par les étudiants',
      });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    values: course ? {
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription || '',
      difficulty: course.difficulty,
      duration: course.duration,
      isPublished: course.isPublished,
      isFeatured: course.isFeatured,
    } : undefined,
  });

  useEffect(() => {
    if (course) {
      setTags(course.tags?.map(tag => tag.name) || []);
      setModules(courseModules || []);
    }
  }, [course, courseModules]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      await updateCourseMutation.mutateAsync(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le cours',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    try {
      await publishCourseMutation.mutateAsync();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de publier le cours',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reorderedModules = Array.from(modules);
    const [reorderedItem] = reorderedModules.splice(result.source.index, 1);
    reorderedModules.splice(result.destination.index, 0, reorderedItem);

    setModules(reorderedModules);

    // Mettre à jour l'ordre dans la base de données
    try {
      const moduleIds = reorderedModules.map(module => module.id);
      await modulesApi.reorder(courseId, moduleIds);
      toast({
        title: 'Modules réorganisés',
        description: 'L\'ordre des modules a été mis à jour',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de réorganiser les modules',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Cours non trouvé. Vérifiez que vous avez accès à ce cours.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Éditer le cours
          </h1>
          <p className="text-muted-foreground">
            {course.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/courses/${course.slug}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>
          {!course.isPublished && (
            <Button onClick={handlePublish}>
              Publier le cours
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Informations de base</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Informations du cours</CardTitle>
                <CardDescription>
                  Mettez à jour les informations de base de votre cours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre du cours *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      disabled={updateCourseMutation.isPending}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL) *</Label>
                    <Input
                      id="slug"
                      {...register('slug')}
                      disabled={updateCourseMutation.isPending}
                    />
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Niveau de difficulté *</Label>
                      <Select
                        onValueChange={(value) => setValue('difficulty', value as any)}
                        value={watch('difficulty')}
                        disabled={updateCourseMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Débutant</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                          <SelectItem value="ADVANCED">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.difficulty && (
                        <p className="text-sm text-destructive">{errors.difficulty.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée estimée (heures) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        {...register('duration', { valueAsNumber: true })}
                        disabled={updateCourseMutation.isPending}
                      />
                      {errors.duration && (
                        <p className="text-sm text-destructive">{errors.duration.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Description courte *</Label>
                    <Textarea
                      id="shortDescription"
                      {...register('shortDescription')}
                      className="min-h-[100px]"
                      disabled={updateCourseMutation.isPending}
                    />
                    {errors.shortDescription && (
                      <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée *</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      className="min-h-[200px]"
                      disabled={updateCourseMutation.isPending}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateCourseMutation.isPending}>
                    {updateCourseMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des modules et leçons</CardTitle>
              <CardDescription>
                Organisez le contenu de votre cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Modules ({modules.length})</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/courses/${courseId}/modules/new`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un module
                  </Button>
                </div>

                {isLoadingModules ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : modules.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h4 className="mt-4 font-medium">Aucun module</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Commencez par créer votre premier module
                    </p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="modules">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3"
                        >
                          {modules.map((module, index) => (
                            <Draggable
                              key={module.id}
                              draggableId={module.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-lg p-4 bg-card"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium">
                                          {module.title}
                                          <span className="ml-2 text-sm text-muted-foreground">
                                            (Module {index + 1})
                                          </span>
                                        </h4>
                                        {module.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {module.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {module.lessons?.length || 0} leçons
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/courses/${courseId}/modules/${module.id}`)}
                                      >
                                        Gérer
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
              <CardDescription>
                Options de publication et de visibilité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Statut de publication</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.isPublished
                        ? 'Le cours est publié et visible par les étudiants'
                        : 'Le cours est en brouillon, visible uniquement par vous'}
                    </p>
                  </div>
                  <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                    {course.isPublished ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cours en vedette</h4>
                    <p className="text-sm text-muted-foreground">
                      Mettre en avant ce cours sur la page d'accueil
                    </p>
                  </div>
                  <Badge variant={course.isFeatured ? 'default' : 'outline'}>
                    {course.isFeatured ? 'En vedette' : 'Standard'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nombre d'étudiants</h4>
                    <p className="text-sm text-muted-foreground">
                      Total des inscriptions
                    </p>
                  </div>
                  <span className="font-medium">{course.totalStudents}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Date de création</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Actions</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/courses/${courseId}/analytics`)}
                  >
                    Voir les statistiques
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/courses/${courseId}/enrollments`)}
                  >
                    Gérer les inscriptions
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.')) {
                        // coursesApi.delete(courseId);
                      }
                    }}
                  >
                    Supprimer le cours
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}