'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { coursesApi } from '@/lib/api/courses';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  Upload, 
  Loader2, 
  BookOpen,
  Tag,
  Clock,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const courseSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  slug: z.string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit être en minuscules avec des tirets'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  shortDescription: z.string().min(20, 'La courte description doit contenir au moins 20 caractères').max(200),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  duration: z.number().min(1, 'La durée doit être d\'au moins 1 heure'),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      difficulty: 'BEGINNER',
      duration: 1,
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Fichier invalide',
        description: 'Veuillez sélectionner une image',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5 MB',
        variant: 'destructive',
      });
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: CourseFormData) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const courseData = {
        ...data,
        tags,
      };

      const response = await coursesApi.create(courseData);
      
      toast({
        title: 'Cours créé avec succès',
        description: 'Votre cours a été créé et est en attente de publication',
      });

      // Upload thumbnail si un fichier a été sélectionné
      if (thumbnailFile) {
        try {
          // Note: L'API d'upload de thumbnail doit être implémentée côté backend
          // await coursesApi.uploadThumbnail(response.id, thumbnailFile);
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de la miniature:', uploadError);
        }
      }

      router.push(`/instructor/courses/${response.id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du cours');
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le cours',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Générer le slug automatiquement depuis le titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    setValue('slug', slug, { shouldValidate: true });
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Créer un nouveau cours
        </h1>
        <p className="text-muted-foreground">
          Remplissez les informations de base pour créer votre cours
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
                Ces informations seront visibles par les étudiants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du cours *</Label>
                <Input
                  id="title"
                  placeholder="Introduction à JavaScript"
                  {...register('title')}
                  onChange={(e) => {
                    register('title').onChange(e);
                    handleTitleChange(e);
                  }}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  placeholder="introduction-javascript"
                  {...register('slug')}
                  disabled={isLoading}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Identifiant unique pour l'URL. Utilisez uniquement des lettres minuscules, chiffres et tirets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Niveau de difficulté *</Label>
                  <Select
                    onValueChange={(value) => setValue('difficulty', value as any)}
                    defaultValue={watch('difficulty')}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  {errors.duration && (
                    <p className="text-sm text-destructive">{errors.duration.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Décrivez votre cours pour attirer les étudiants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Description courte *</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Apprenez les bases de JavaScript en créant des projets pratiques..."
                  {...register('shortDescription')}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 200 caractères. Visible dans les listes de cours.
                </p>
                {errors.shortDescription && (
                  <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  placeholder="Dans ce cours, vous apprendrez..."
                  {...register('description')}
                  className="min-h-[200px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Décrivez en détail ce que les étudiants apprendront, les prérequis, etc.
                </p>
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mots-clés & Catégories</CardTitle>
              <CardDescription>
                Aidez les étudiants à trouver votre cours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="javascript, web, frontend"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Miniature du cours</CardTitle>
              <CardDescription>
                Une image attractive augmente les inscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="thumbnail">Télécharger une miniature</Label>
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label htmlFor="thumbnail">
                    <Button
                      variant="outline"
                      className="w-full h-32 border-dashed"
                      type="button"
                      disabled={isLoading}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm">
                          {thumbnailFile ? thumbnailFile.name : 'Cliquez pour télécharger'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PNG, JPG, WebP (max 5 MB)
                        </span>
                      </div>
                    </Button>
                  </label>
                </div>

                {previewUrl && (
                  <div>
                    <Label>Aperçu</Label>
                    <div className="mt-2 relative aspect-video overflow-hidden rounded-lg border">
                      <img
                        src={previewUrl}
                        alt="Aperçu de la miniature"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer le cours'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}