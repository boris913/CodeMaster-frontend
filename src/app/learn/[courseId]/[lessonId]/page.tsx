'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  VideoPlayer, 
  CodeEditor,
  ProgressTracker 
} from '@/components/learning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Play,
  BookOpen,
  Code2,
  MessageSquare,
  Download,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function LearningPage() {
  const { courseId, lessonId } = useParams();
  const [activeTab, setActiveTab] = useState<'content' | 'exercise' | 'comments'>('content');
  const [code, setCode] = useState<string>('// Votre code ici\nconsole.log("Bonjour, CodeMaster!");');

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => ({ id: courseId, title: 'JavaScript Avancé' }),
    enabled: !!courseId,
  });

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => ({
      id: lessonId,
      title: 'Les Promises et async/await',
      content: '# Les Promises et async/await\n\nLes Promises sont une fonctionnalité essentielle de JavaScript moderne pour gérer les opérations asynchrones.',
      videoUrl: 'https://example.com/video.mp4',
      duration: 45,
    }),
    enabled: !!lessonId,
  });

  const modules = [
    {
      id: '1',
      title: 'Introduction à JavaScript',
      lessons: [
        { id: '1', title: 'Variables et types', duration: 30, completed: true, type: 'video' },
        { id: '2', title: 'Fonctions', duration: 45, completed: true, type: 'video' },
        { id: '3', title: 'Exercice: Calculatrice', duration: 60, completed: true, type: 'exercise' },
      ],
    },
    {
      id: '2',
      title: 'Programmation asynchrone',
      lessons: [
        { id: '4', title: 'Callback et événements', duration: 40, completed: true, type: 'video' },
        { id: '5', title: 'Les Promises', duration: 45, completed: false, type: 'video', current: true },
        { id: '6', title: 'Exercice: Gestion des erreurs', duration: 50, completed: false, type: 'exercise', locked: true },
        { id: '7', title: 'async/await', duration: 35, completed: false, type: 'video', locked: true },
      ],
    },
  ];

  const handleRunCode = async (code: string) => {
    console.log('Running code:', code);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, output: 'Bonjour, CodeMaster!' };
  };

  const handleCompleteLesson = () => {
    // Mark lesson as completed
    console.log('Lesson completed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour au cours
              </Button>
              <div>
                <h1 className="font-heading text-xl font-bold">
                  {course?.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {lesson?.title} • {lesson?.duration} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
              <Button onClick={handleCompleteLesson}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Terminer la leçon
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Progress Tracker */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProgressTracker
                modules={modules}
                currentLessonId={lessonId as string}
                onLessonSelect={(id) => console.log('Select lesson:', id)}
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="content">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Contenu
                </TabsTrigger>
                <TabsTrigger value="exercise">
                  <Code2 className="mr-2 h-4 w-4" />
                  Exercice
                </TabsTrigger>
                <TabsTrigger value="comments">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Discussions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Video Player */}
                {lesson?.videoUrl && (
                  <Card>
                    <CardContent className="p-0">
                      <VideoPlayer
                        src={lesson.videoUrl}
                        onProgress={(time) => console.log('Progress:', time)}
                        onComplete={handleCompleteLesson}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Lesson Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Contenu de la leçon</span>
                      <Badge variant="outline">
                        {lesson?.duration} minutes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <div className="border rounded-lg p-6 bg-muted/50">
                      <h2 className="text-2xl font-bold mb-4">📚 Aperçu de la leçon</h2>
                      <p>Dans cette leçon, vous apprendrez à utiliser les Promises et async/await pour gérer les opérations asynchrones de manière efficace.</p>
                    </div>
                    
                    <h3>Les Promises</h3>
                    <p>Une Promise représente la complétion (ou échec) éventuelle d'une opération asynchrone et sa valeur résultante.</p>
                    
                    <div className="bg-secondary rounded-lg p-4 my-4 overflow-x-auto">
                      <pre><code>{`// Exemple de Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Succès !');
  }, 1000);
});

promise.then(result => {
  console.log(result); // "Succès !"
});`}</code></pre>
                    </div>

                    <h3>async/await</h3>
                    <p>Les mots-clés async et await permettent d'écrire du code asynchrone de manière plus lisible, ressemblant à du code synchrone.</p>

                    <div className="bg-secondary rounded-lg p-4 my-4 overflow-x-auto">
                      <pre><code>{`// Exemple avec async/await
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur:', error);
  }
}`}</code></pre>
                    </div>

                    <div className="border-t pt-6 mt-8">
                      <h3 className="text-lg font-semibold mb-4">Résumé</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Les Promises simplifient la gestion des callbacks</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>async/await rend le code asynchrone plus lisible</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Gestion d'erreurs améliorée avec try/catch</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exercise">
                <Card>
                  <CardHeader>
                    <CardTitle>Exercice pratique</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Instructions</h3>
                      <p>
                        Écrivez une fonction <code>fetchUserData</code> qui simule la récupération
                        de données utilisateur depuis une API. La fonction doit :
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Retourner une Promise</li>
                        <li>Simuler un délai de 2 secondes</li>
                        <li>Retourner un objet utilisateur avec id, name et email</li>
                        <li>Gérer les erreurs si le paramètre <code>userId</code> est invalide</li>
                      </ol>
                    </div>

                    <div className="h-[400px] border rounded-lg overflow-hidden">
                      <CodeEditor
                        language="javascript"
                        defaultValue={code}
                        onRun={handleRunCode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Button variant="outline">
                        Voir la solution
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          Réinitialiser
                        </Button>
                        <Button>
                          Soumettre
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <textarea
                            placeholder="Poser une question ou partager un commentaire..."
                            className="w-full min-h-[100px] rounded-lg border p-3"
                          />
                          <div className="flex justify-end mt-2">
                            <Button>Publier</Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium">U{i}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <span className="font-medium">Utilisateur {i}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      Il y a {i} heure{i > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    Répondre
                                  </Button>
                                </div>
                                <p>
                                  Excellent cours ! J'ai particulièrement apprécié la section sur les Promises.
                                  Auriez-vous des ressources supplémentaires à recommander ?
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Resources */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ressources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Slides de présentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Documentation officielle
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Code2 className="mr-2 h-4 w-4" />
                    Code source des exemples
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prochaine leçon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Play className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Exercice: Gestion des erreurs</div>
                        <div className="text-sm text-muted-foreground">
                          50 minutes • Exercice
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-2" disabled>
                      Débloquer en terminant cette leçon
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Précédent
                    </Button>
                    <Button variant="outline" className="flex-1" disabled>
                      Suivant
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}