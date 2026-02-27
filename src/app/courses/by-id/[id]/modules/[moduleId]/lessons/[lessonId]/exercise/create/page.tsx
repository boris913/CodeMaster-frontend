'use client';

/**
 * Page : /courses/by-id/[id]/modules/[moduleId]/lessons/[lessonId]/exercise/create
 *
 * Permet à un instructeur de créer un exercice de code lié à une leçon.
 *
 * Flux :
 *  1. L'instructeur renseigne le titre, les instructions (markdown), le langage
 *  2. Il écrit le code de départ (starterCode), la solution, et les tests unitaires
 *  3. Il peut tester sa solution contre ses propres tests via le bouton "Tester"
 *  4. Il publie l'exercice → POST /exercises/lessons/:lessonId/exercise
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  Code2,
  FlaskConical,
  Lightbulb,
  Save,
  Eye,
  EyeOff,
  Info,
  ChevronRight,
  Zap,
  Clock,
  Trophy,
  Cpu,
} from 'lucide-react';

// Monaco Editor (chargé côté client uniquement — évite les erreurs SSR)
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

// ─── API ─────────────────────────────────────────────────────────────────────
import {
  createExerciseForLesson,
  testExerciseCode,
  type Language,
  type Difficulty,
  type TestCase,
  type ExecutionResult,
} from '@/lib/api/exercises';

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const testCaseSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'La description est requise'),
  code: z.string().min(1, 'Le code du test est requis'),
  points: z.number().min(1).max(100),
});

const exerciseSchema = z.object({
  title: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(200),
  instructions: z
    .string()
    .min(20, 'Les instructions doivent contenir au moins 20 caractères'),
  language: z.enum(['JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'HTML', 'CSS', 'JAVA', 'CPP']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  starterCode: z.string().min(1, 'Le code de départ est requis'),
  solution: z.string().min(1, 'La solution est requise'),
  hints: z.array(z.string()),
  timeLimit: z.number().min(5).max(300),
  memoryLimit: z.number().min(16).max(1024),
  points: z.number().min(1).max(1000),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const LANGUAGES: { value: Language; label: string; monacoLang: string; icon: string }[] = [
  { value: 'JAVASCRIPT', label: 'JavaScript', monacoLang: 'javascript', icon: '🟨' },
  { value: 'TYPESCRIPT', label: 'TypeScript', monacoLang: 'typescript', icon: '🔷' },
  { value: 'PYTHON',     label: 'Python',     monacoLang: 'python',     icon: '🐍' },
  { value: 'JAVA',       label: 'Java',       monacoLang: 'java',       icon: '☕' },
  { value: 'CPP',        label: 'C++',        monacoLang: 'cpp',        icon: '⚙️' },
  { value: 'HTML',       label: 'HTML',       monacoLang: 'html',       icon: '🌐' },
  { value: 'CSS',        label: 'CSS',        monacoLang: 'css',        icon: '🎨' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'BEGINNER',     label: 'Débutant',      color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire', color: 'text-amber-400 border-amber-400/40 bg-amber-400/10'    },
  { value: 'ADVANCED',     label: 'Avancé',        color: 'text-rose-400 border-rose-400/40 bg-rose-400/10'       },
];

const STARTER_TEMPLATES: Record<Language, string> = {
  JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
function solution(n) {
  // Votre code ici
}`,
  TYPESCRIPT: `function solution(n: number): number {
  // Votre code ici
  return 0;
}`,
  PYTHON: `def solution(n: int) -> int:
    # Votre code ici
    pass`,
  JAVA: `public class Solution {
    public int solution(int n) {
        // Votre code ici
        return 0;
    }
}`,
  CPP: `#include <iostream>

int solution(int n) {
    // Votre code ici
    return 0;
}`,
  HTML: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Solution</title>
</head>
<body>
  <!-- Votre code ici -->
</body>
</html>`,
  CSS: `/* Votre code CSS ici */
.container {

}`,
};

const TEST_TEMPLATES: Record<Language, string> = {
  JAVASCRIPT: `// expect(solution(5)).toBe(120);
// expect(solution(0)).toBe(1);`,
  TYPESCRIPT: `// expect(solution(5)).toBe(120);`,
  PYTHON: `# assert solution(5) == 120
# assert solution(0) == 1`,
  JAVA:  `// assertEquals(120, new Solution().solution(5));`,
  CPP:   `// assert(solution(5) == 120);`,
  HTML:  `// Vérifier la structure HTML`,
  CSS:   `// Vérifier les règles CSS`,
};

// ─── Helper pour générer un ID de test ───────────────────────────────────────
const genId = () =>
  `test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateExercisePage() {
  const router = useRouter();
  const params = useParams<{
    id: string;          // courseId
    moduleId: string;
    lessonId: string;
  }>();

  // ── État éditeurs (tests et hints uniquement) ─────────────────────────────
  const [activeTab, setActiveTab] = useState<'starter' | 'solution' | 'tests'>('starter');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: genId(), description: '', code: '', points: 25 },
  ]);
  const [hints, setHints] = useState<string[]>(['']);

  // ── Résultats de test ──────────────────────────────────────────────────────
  const [testResult, setTestResult]   = useState<ExecutionResult | null>(null);
  const [isTesting, setIsTesting]     = useState(false);
  const [testError, setTestError]     = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  // ── Soumission du formulaire ───────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Référence vers un exercice créé (pour le test) ────────────────────────
  const createdExerciseId = useRef<string | null>(null);

  // ── React Hook Form ───────────────────────────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      language:    'JAVASCRIPT',
      difficulty:  'BEGINNER',
      timeLimit:   30,
      memoryLimit: 128,
      points:      10,
      hints:       [],
      starterCode: STARTER_TEMPLATES.JAVASCRIPT, // Template initial
      solution:    '',
    },
  });

  const selectedLanguage = watch('language');
  const monacoLang = LANGUAGES.find((l) => l.value === selectedLanguage)?.monacoLang ?? 'javascript';
  const solutionCode = watch('solution'); // Pour le test, on récupère la valeur courante

  // ── Changement de langage → mise à jour du template ───────────────────────
  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setValue('language', lang);
      setValue('starterCode', STARTER_TEMPLATES[lang] || '');
    },
    [setValue],
  );

  // ── Gestion des cas de test ────────────────────────────────────────────────
  const addTestCase = () =>
    setTestCases((prev) => [
      ...prev,
      { id: genId(), description: '', code: '', points: 25 },
    ]);

  const removeTestCase = (id: string) =>
    setTestCases((prev) => prev.filter((t) => t.id !== id));

  const updateTestCase = (id: string, field: keyof TestCase, value: string | number) =>
    setTestCases((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );

  // ── Gestion des hints ─────────────────────────────────────────────────────
  const addHint = () => setHints((prev) => [...prev, '']);
  const removeHint = (i: number) => setHints((prev) => prev.filter((_, idx) => idx !== i));
  const updateHint = (i: number, v: string) =>
    setHints((prev) => prev.map((h, idx) => (idx === i ? v : h)));

  // ── Sérialisation des tests en JSON pour le backend ───────────────────────
  const serializeTests = () => JSON.stringify(testCases);

  // ── Test de la solution (POST /exercises/:id/test) ────────────────────────
  const handleTestSolution = async () => {
    if (!createdExerciseId.current) {
      setTestError(
        'Sauvegardez l\'exercice d\'abord pour pouvoir tester la solution.',
      );
      return;
    }
    const currentSolution = getValues('solution');
    if (!currentSolution.trim()) {
      setTestError('La solution ne peut pas être vide.');
      return;
    }
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const result = await testExerciseCode(createdExerciseId.current, {
        code: currentSolution,
        language: selectedLanguage,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestError(
        err?.response?.data?.message ?? 'Erreur lors de l\'exécution du test.',
      );
    } finally {
      setIsTesting(false);
    }
  };

  // ── Soumission principale (création de l'exercice) ────────────────────────
  const onSubmit = async (values: ExerciseFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const exercise = await createExerciseForLesson(params.lessonId, {
        title:        values.title,
        instructions: values.instructions,
        language:     values.language,
        difficulty:   values.difficulty,
        starterCode:  values.starterCode,
        solution:     values.solution,
        tests:        serializeTests(),
        hints:        hints.filter(Boolean),
        timeLimit:    values.timeLimit,
        memoryLimit:  values.memoryLimit,
        points:       values.points,
      });

      createdExerciseId.current = exercise.id;
      setSubmitSuccess(true);

      // Redirection vers la page de la leçon après 1.5 s
      setTimeout(() => {
        router.push(
          `/courses/by-id/${params.id}/modules/${params.moduleId}/lessons/${params.lessonId}/edit`,
        );
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        'Une erreur est survenue lors de la création de l\'exercice.';
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-slate-100 font-mono">

      {/* ── Breadcrumb & Header ────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#12121f]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour
            </button>
            <ChevronRight className="w-3 h-3" />
            <span>Cours</span>
            <ChevronRight className="w-3 h-3" />
            <span>Module</span>
            <ChevronRight className="w-3 h-3" />
            <span>Leçon</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-indigo-400 font-semibold">Créer un exercice</span>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-3">
            {submitSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Exercice créé !
              </span>
            )}
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || submitSuccess}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold
                         bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                         disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isSubmitting ? 'Création…' : 'Publier l\'exercice'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Layout principal ───────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-screen-2xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6"
      >
        {/* ── PANNEAU GAUCHE : Métadonnées + Instructions ─────────────── */}
        <div className="space-y-5">

          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Titre de l'exercice
            </label>
            <input
              {...register('title')}
              placeholder="ex: Calculer la factorielle d'un entier"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                         focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40
                         placeholder:text-slate-600 transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>
            )}
          </div>

          {/* Langage + Difficulté + Points ─ row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Langage */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                <Code2 className="inline w-3 h-3 mr-1" />
                Langage
              </label>
              <Controller
                control={control}
                name="language"
                render={({ field }) => (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleLanguageChange(e.target.value as Language);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                               focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40
                               cursor-pointer"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value} className="bg-[#1e1e2e]">
                        {l.icon} {l.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Difficulté */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Difficulté
              </label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                               focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40
                               cursor-pointer"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value} className="bg-[#1e1e2e]">
                        {d.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Points */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                <Trophy className="inline w-3 h-3 mr-1" />
                Points
              </label>
              <input
                type="number"
                {...register('points', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                           focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Limites temps + mémoire */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                <Clock className="inline w-3 h-3 mr-1" />
                Temps limite (s)
              </label>
              <input
                type="number"
                {...register('timeLimit', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                           focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
              {errors.timeLimit && (
                <p className="mt-1 text-xs text-rose-400">{errors.timeLimit.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                <Cpu className="inline w-3 h-3 mr-1" />
                Mémoire (MB)
              </label>
              <input
                type="number"
                {...register('memoryLimit', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                           focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Instructions (Markdown) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              <BookOpen className="inline w-3 h-3 mr-1" />
              Instructions <span className="text-slate-600 normal-case">(Markdown supporté)</span>
            </label>
            <textarea
              {...register('instructions')}
              rows={8}
              placeholder={`## Enoncé\n\nEcrivez une fonction \`factorial(n)\` qui retourne la factorielle de n.\n\n**Contraintes :**\n- 0 ≤ n ≤ 12\n- \`factorial(0)\` doit retourner 1`}
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                         focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40
                         placeholder:text-slate-700 resize-none font-mono leading-relaxed"
            />
            {errors.instructions && (
              <p className="mt-1 text-xs text-rose-400">{errors.instructions.message}</p>
            )}
          </div>

          {/* Hints */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Lightbulb className="inline w-3 h-3 mr-1 text-amber-400" />
                Indices (optionnels)
              </label>
              <button
                type="button"
                onClick={addHint}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {hints.map((hint, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={hint}
                    onChange={(e) => updateHint(i, e.target.value)}
                    placeholder={`Indice ${i + 1}…`}
                    className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10
                               focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40
                               placeholder:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeHint(i)}
                    className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10
                               transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Erreur de soumission */}
          {submitError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* ── PANNEAU DROIT : Éditeurs ────────────────────────────────── */}
        <div className="space-y-4">

          {/* Onglets */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg w-fit">
            {(
              [
                { key: 'starter',  label: 'Code de départ', icon: Code2 },
                { key: 'solution', label: 'Solution',       icon: Eye  },
                { key: 'tests',    label: 'Tests',          icon: FlaskConical },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                  ${activeTab === key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Éditeur : Code de départ ─────────────────────────────── */}
          {activeTab === 'starter' && (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e2e] border-b border-white/5">
                <span className="text-xs text-slate-500 font-semibold">
                  starter.{monacoLang === 'javascript' ? 'js' : monacoLang === 'typescript' ? 'ts' : monacoLang}
                </span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Code visible par l'étudiant
                </span>
              </div>
              <Controller
                name="starterCode"
                control={control}
                render={({ field }) => (
                  <MonacoEditor
                    height="420px"
                    language={monacoLang}
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 16, bottom: 16 },
                      fontLigatures: true,
                      renderLineHighlight: 'gutter',
                    }}
                  />
                )}
              />
            </div>
          )}

          {/* ── Éditeur : Solution ───────────────────────────────────── */}
          {activeTab === 'solution' && (
            <div className="rounded-xl overflow-hidden border border-amber-500/20">
              <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e2e] border-b border-white/5">
                <span className="text-xs text-amber-400/80 font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  solution.{monacoLang === 'javascript' ? 'js' : monacoLang}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Masquée pour les étudiants</span>
                  <button
                    type="button"
                    onClick={() => setShowSolution((v) => !v)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showSolution ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <Controller
                name="solution"
                control={control}
                render={({ field }) => (
                  <MonacoEditor
                    height="420px"
                    language={monacoLang}
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 16, bottom: 16 },
                      fontLigatures: true,
                      renderLineHighlight: 'gutter',
                    }}
                  />
                )}
              />
            </div>
          )}

          {/* ── Éditeur : Tests unitaires ────────────────────────────── */}
          {activeTab === 'tests' && (
            <div className="space-y-3">
              {testCases.map((tc, index) => (
                <div
                  key={tc.id}
                  className="rounded-xl border border-white/10 overflow-hidden bg-[#12121f]"
                >
                  {/* Header du test case */}
                  <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e2e] border-b border-white/5">
                    <span className="text-xs text-slate-400 font-semibold">
                      Test #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tc.points}
                        onChange={(e) => updateTestCase(tc.id, 'points', parseInt(e.target.value) || 0)}
                        className="w-14 px-2 py-0.5 text-xs rounded bg-white/5 border border-white/10
                                   text-center focus:outline-none focus:border-indigo-500/50"
                        min={1}
                        max={100}
                      />
                      <span className="text-xs text-slate-600">pts</span>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(tc.id)}
                          className="text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="px-3 pt-3">
                    <input
                      value={tc.description}
                      onChange={(e) => updateTestCase(tc.id, 'description', e.target.value)}
                      placeholder="Description du test (ex: Doit retourner 1 pour factorial(0))"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10
                                 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40
                                 placeholder:text-slate-700"
                    />
                  </div>

                  {/* Code du test */}
                  <div className="p-3">
                    <MonacoEditor
                      height="80px"
                      language={monacoLang}
                      value={tc.code || TEST_TEMPLATES[selectedLanguage]}
                      onChange={(v) => updateTestCase(tc.id, 'code', v ?? '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 12,
                        lineHeight: 1.6,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'off',
                        folding: false,
                        padding: { top: 8, bottom: 8 },
                        renderLineHighlight: 'none',
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Ajouter un test */}
              <button
                type="button"
                onClick={addTestCase}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/15
                           text-xs text-slate-500 hover:text-indigo-400 hover:border-indigo-500/40
                           flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un cas de test
              </button>

              {/* Total des points */}
              <div className="text-right text-xs text-slate-500">
                Total :{' '}
                <span className="text-indigo-400 font-semibold">
                  {testCases.reduce((s, t) => s + (t.points || 0), 0)} pts
                </span>
              </div>
            </div>
          )}

          {/* ── Bouton Tester la solution ─────────────────────────────── */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                <Zap className="inline w-3 h-3 mr-1 text-amber-400" />
                Testez votre solution contre vos tests avant de publier
              </span>
              <button
                type="button"
                onClick={handleTestSolution}
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold
                           bg-emerald-600/80 hover:bg-emerald-500/80 disabled:opacity-50
                           disabled:cursor-not-allowed transition-all"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {isTesting ? 'Exécution…' : 'Tester la solution'}
              </button>
            </div>

            {/* Résultat de l'exécution */}
            {testError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10
                              border border-rose-500/20 text-rose-300 text-xs">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{testError}</span>
              </div>
            )}

            {testResult && (
              <div
                className={`rounded-lg border p-3 text-xs space-y-2.5
                  ${testResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/20'
                  }`}
              >
                {/* Résumé */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    {testResult.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={testResult.passed ? 'text-emerald-300' : 'text-rose-300'}>
                      {testResult.passed ? 'Tous les tests passent ✓' : 'Certains tests échouent'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>⏱ {testResult.executionTime}ms</span>
                    <span>💾 {(testResult.memoryUsed / 1024).toFixed(1)}MB</span>
                  </div>
                </div>

                {/* Détail par test */}
                {testResult.testResults && testResult.testResults.length > 0 && (
                  <div className="space-y-1.5">
                    {testResult.testResults.map((r, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 px-2 py-1.5 rounded
                          ${r.passed ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {r.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <span className="font-mono">{r.name ?? `Test ${i + 1}`}</span>
                          {r.error && (
                            <p className="text-rose-500/80 mt-0.5 font-mono">{r.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Output brut */}
                {testResult.output && (
                  <details className="group">
                    <summary className="cursor-pointer text-slate-500 hover:text-slate-300 transition-colors">
                      Voir l'output complet
                    </summary>
                    <pre className="mt-2 p-2 rounded bg-black/30 text-slate-400 text-[11px] overflow-auto max-h-32 whitespace-pre-wrap">
                      {testResult.output}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}