'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulesApi } from '@/lib/api/modules';
import { lessonsApi } from '@/lib/api/lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  ChevronRight,
  Clock,
  BookOpen,
  Loader2,
  Video,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ModulesManagementPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');

  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => modulesApi.getByCourse(courseId),
    enabled: !!courseId,
  });

  const createModuleMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      modulesApi.create(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      setShowAddModule(false);
      setNewModuleTitle('');
      setNewModuleDescription('');
      toast({
        title: 'Module créé',
        description: 'Le module a été créé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le module',
        variant: 'destructive',
      });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: any }) =>
      modulesApi.update(courseId, moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      setEditingModule(null);
      toast({
        title: 'Module mis à jour',
        description: 'Le module a été modifié avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le module',
        variant: 'destructive',
      });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => modulesApi.delete(courseId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast({
        title: 'Module supprimé',
        description: 'Le module a été supprimé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le module',
        variant: 'destructive',
      });
    },
  });

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre du module est requis',
        variant: 'destructive',
      });
      return;
    }

    createModuleMutation.mutate({
      title: newModuleTitle,
      description: newModuleDescription || undefined,
    });
  };

  const handleUpdateModule = () => {
    if (!editingModule || !editingModule.title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre du module est requis',
        variant: 'destructive',
      });
      return;
    }

    updateModuleMutation.mutate({
      moduleId: editingModule.id,
      data: {
        title: editingModule.title,
        description: editingModule.description || undefined,
      },
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ? Cette action supprimera également toutes les leçons associées.')) {
      deleteModuleMutation.mutate(moduleId);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Gestion des modules
          </h1>
          <p className="text-muted-foreground">
            Organisez le contenu de votre cours en modules et leçons
          </p>
        </div>
        <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau module</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau module pour organiser votre cours
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du module *</Label>
                <Input
                  id="title"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Introduction à JavaScript"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  placeholder="Décrivez ce que les étudiants apprendront dans ce module..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddModule(false)}
                disabled={createModuleMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddModule}
                disabled={createModuleMutation.isPending || !newModuleTitle.trim()}
              >
                {createModuleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer le module'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {modules?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun module</h3>
            <p className="text-muted-foreground mt-2">
              Commencez par créer votre premier module
            </p>
            <Button className="mt-4" onClick={() => setShowAddModule(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules?.map((module, index) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>Module {index + 1}: {module.title}</span>
                        <Badge variant="outline">
                          {module.lessons?.length || 0} leçons
                        </Badge>
                      </CardTitle>
                      {module.description && (
                        <CardDescription>{module.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingModule(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module.lessons?.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                          {lessonIndex + 1}
                        </div>
                        <div>
                          <div className="font-medium">{lesson.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {lesson.duration} minutes
                            <span className="flex items-center gap-1">
                              {lesson.videoUrl ? (
                                <>
                                  <Video className="h-3 w-3" />
                                  Vidéo
                                </>
                              ) : (
                                <>
                                  <FileText className="h-3 w-3" />
                                  Texte
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/lessons/${lesson.id}/edit`)}
                        >
                          Éditer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/lessons/${lesson.id}`)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/courses/${courseId}/modules/${module.id}/lessons/create`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une leçon
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog pour éditer un module */}
      {editingModule && (
        <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Éditer le module</DialogTitle>
              <DialogDescription>
                Modifiez les informations du module
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre du module *</Label>
                <Input
                  id="edit-title"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingModule.description || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingModule(null)}
                disabled={updateModuleMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdateModule}
                disabled={updateModuleMutation.isPending || !editingModule.title.trim()}
              >
                {updateModuleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}