'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  exercisesApi,
  type Language,
  type Difficulty,
} from '@/lib/api/exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Lightbulb,
  Code2,
  FlaskConical,
  BookOpen,
  Loader2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#1e1e2e] rounded-lg">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    ),
  },
);

const exerciseSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(200),
  instructions: z.string().min(20, 'Les instructions doivent contenir au moins 20 caractères'),
  language: z.enum(['JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'JAVA', 'CPP', 'HTML', 'CSS']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  points: z.number().min(1).max(1000),
  timeLimit: z.number().min(5).max(300),
  memoryLimit: z.number().min(16).max(1024),
  starterCode: z.string().min(1, 'Le code de départ est requis'),
  solution: z.string().min(1, 'La solution est requise'),
  hints: z.array(z.string()),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

const LANGUAGES: Array<{ value: Language; label: string; emoji: string }> = [
  { value: 'JAVASCRIPT', label: 'JavaScript', emoji: '🟨' },
  { value: 'TYPESCRIPT', label: 'TypeScript', emoji: '🔷' },
  { value: 'PYTHON', label: 'Python', emoji: '🐍' },
  { value: 'JAVA', label: 'Java', emoji: '☕' },
  { value: 'CPP', label: 'C++', emoji: '⚙️' },
  { value: 'HTML', label: 'HTML', emoji: '🌐' },
  { value: 'CSS', label: 'CSS', emoji: '🎨' },
];

const DIFFICULTIES: Array<{ value: Difficulty; label: string; color: string }> = [
  { value: 'BEGINNER', label: 'Débutant', color: 'text-emerald-400' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire', color: 'text-amber-400' },
  { value: 'ADVANCED', label: 'Avancé', color: 'text-rose-400' },
];

const LANGUAGE_TO_MONACO: Record<Language, string> = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
  HTML: 'html',
  CSS: 'css',
};

export default function EditExercisePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const exerciseId = params.exerciseId as string;

  const [hints, setHints] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  const { data: exercise, isLoading, isError } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesApi.getById(exerciseId),
    enabled: !!exerciseId,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      language: 'JAVASCRIPT',
      difficulty: 'BEGINNER',
      points: 10,
      timeLimit: 30,
      memoryLimit: 128,
      hints: [],
      starterCode: '',
      solution: '',
    },
  });

  useEffect(() => {
    if (exercise && !initialized) {
      reset({
        title: exercise.title,
        instructions: exercise.instructions,
        language: exercise.language,
        difficulty: exercise.difficulty,
        points: exercise.points,
        timeLimit: exercise.timeLimit,
        memoryLimit: exercise.memoryLimit,
        starterCode: exercise.starterCode,
        solution: exercise.solution ?? '',
        hints: exercise.hints ?? [],
      });
      setHints(exercise.hints ?? []);
      setInitialized(true);
    }
  }, [exercise, initialized, reset]);

  const language = watch('language');

  const updateMutation = useMutation({
    mutationFn: (data: ExerciseFormData) =>
      exercisesApi.update(exerciseId, {
        ...data,
        hints,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] });
      toast({
        title: '✅ Exercice mis à jour',
        description: "Les modifications ont été enregistrées avec succès.",
      });
      router.push(
        `/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/exercise/${exerciseId}`,
      );
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || "Impossible de mettre à jour l'exercice",
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ExerciseFormData) => {
    updateMutation.mutate(data);
  };

  const addHint = () => setHints((prev) => [...prev, '']);
  const updateHint = (i: number, value: string) =>
    setHints((prev) => prev.map((h, idx) => (idx === i ? value : h)));
  const removeHint = (i: number) =>
    setHints((prev) => prev.filter((_, idx) => idx !== i));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (isError || (!isLoading && !exercise)) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center gap-4 text-white">
        <AlertCircle className="h-16 w-16 text-rose-400" />
        <h2 className="text-2xl font-bold">Exercice introuvable</h2>
        <p className="text-gray-400">
          Cette leçon n'a pas d'exercice, ou une erreur est survenue.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link
              href={`/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/exercise/create`}
            >
              Créer un exercice
            </Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="sticky top-0 z-30 bg-[#0d0d1a]/95 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              asChild
            >
              <Link
                href={`/courses/by-id/${courseId}/modules/${moduleId}/lessons/${lessonId}/exercise/${exerciseId}`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'exercice
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-5 bg-white/20" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Modification</p>
              <p className="font-semibold text-sm truncate max-w-[300px]">{exercise.title}</p>
            </div>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Colonne gauche : métadonnées */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Titre de l'exercice</Label>
                <Input
                  {...register('title')}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                  placeholder="Titre de l'exercice"
                />
                {errors.title && (
                  <p className="text-rose-400 text-xs">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Langage</Label>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.value}
                            type="button"
                            onClick={() => field.onChange(lang.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                              field.value === lang.value
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <span>{lang.emoji}</span>
                            <span>{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Difficulté</Label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        {DIFFICULTIES.map((d) => (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => field.onChange(d.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                              field.value === d.value
                                ? 'bg-indigo-600/20 border-indigo-500'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <span className={d.color}>●</span>
                            <span>{d.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(
                  [
                    { name: 'points', label: '🏆 Points', min: 1, max: 1000 },
                    { name: 'timeLimit', label: '⏱️ Limite (s)', min: 5, max: 300 },
                    { name: 'memoryLimit', label: '💾 Mémoire (MB)', min: 16, max: 1024 },
                  ] as const
                ).map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label className="text-gray-300 text-xs">{field.label}</Label>
                    <Input
                      type="number"
                      min={field.min}
                      max={field.max}
                      {...register(field.name, { valueAsNumber: true })}
                      className="bg-white/5 border-white/10 text-white text-center"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Instructions
                  <span className="text-xs text-gray-500">(Markdown supporté)</span>
                </Label>
                <Textarea
                  {...register('instructions')}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[180px] font-mono text-sm focus:border-indigo-500"
                  placeholder="## Objectif&#10;&#10;Écrire une fonction qui..."
                />
                {errors.instructions && (
                  <p className="text-rose-400 text-xs">{errors.instructions.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    Indices ({hints.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addHint}
                    className="text-indigo-400 hover:text-indigo-300 h-7"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Ajouter
                  </Button>
                </div>
                {hints.length === 0 && (
                  <p className="text-sm text-gray-600 italic">Aucun indice — cliquez sur Ajouter</p>
                )}
                {hints.map((hint, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-mono bg-white/5 border border-white/10 rounded px-2 py-1.5 text-gray-400 shrink-0 mt-1">
                      {i + 1}
                    </span>
                    <Input
                      value={hint}
                      onChange={(e) => updateHint(i, e.target.value)}
                      placeholder={`Indice ${i + 1}`}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHint(i)}
                      className="text-rose-400 hover:text-rose-300 h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite : éditeurs de code */}
            <div className="space-y-6">
              <Tabs defaultValue="starter">
                <TabsList className="bg-white/5 border border-white/10">
                  <TabsTrigger value="starter" className="data-[state=active]:bg-indigo-600">
                    <Code2 className="mr-2 h-4 w-4" />
                    Code de départ
                  </TabsTrigger>
                  <TabsTrigger value="solution" className="data-[state=active]:bg-indigo-600">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Solution
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="starter" className="mt-0">
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <div className="bg-white/5 px-4 py-2 text-xs text-gray-400 border-b border-white/10">
                      Code visible par les étudiants
                    </div>
                    <div className="h-[420px]">
                      <Controller
                        name="starterCode"
                        control={control}
                        render={({ field }) => (
                          <MonacoEditor
                            height="420px"
                            language={LANGUAGE_TO_MONACO[language] ?? 'javascript'}
                            value={field.value}
                            onChange={(v) => field.onChange(v ?? '')}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                              wordWrap: 'on',
                              automaticLayout: true,
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="solution" className="mt-0">
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <div className="bg-white/5 px-4 py-2 text-xs text-gray-400 border-b border-white/10">
                      Solution de référence (masquée aux étudiants)
                    </div>
                    <div className="h-[420px]">
                      <Controller
                        name="solution"
                        control={control}
                        render={({ field }) => (
                          <MonacoEditor
                            height="420px"
                            language={LANGUAGE_TO_MONACO[language] ?? 'javascript'}
                            value={field.value}
                            onChange={(v) => field.onChange(v ?? '')}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                              wordWrap: 'on',
                              automaticLayout: true,
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Alert className="bg-amber-900/20 border-amber-500/30 text-amber-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Les cas de tests ne peuvent pas être modifiés ici pour l'instant.
                  Recréez l'exercice si vous avez besoin de changer les tests.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}