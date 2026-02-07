'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  BookOpen,
  Code2,
  Target,
  Globe,
  Award,
  Clock,
  TrendingUp,
  Shield,
  Heart
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Étudiants actifs', value: '10,000+', icon: Users },
    { label: 'Cours disponibles', value: '500+', icon: BookOpen },
    { label: 'Exercices de code', value: '2,500+', icon: Code2 },
    { label: 'Instructeurs experts', value: '50+', icon: Target },
  ];

  const values = [
    {
      icon: Globe,
      title: 'Accessible à tous',
      description: 'Nous croyons que l\'éducation en programmation devrait être accessible à tous, indépendamment du niveau ou du budget.'
    },
    {
      icon: Award,
      title: 'Excellence pédagogique',
      description: 'Nos cours sont conçus par des experts et continuellement mis à jour pour suivre les dernières technologies.'
    },
    {
      icon: Clock,
      title: 'Apprentissage pratique',
      description: 'Nous privilégions l\'apprentissage par la pratique avec des exercices et projets concrets.'
    },
    {
      icon: TrendingUp,
      title: 'Progression continue',
      description: 'Suivez votre progression et recevez des recommandations personnalisées pour avancer efficacement.'
    },
    {
      icon: Shield,
      title: 'Qualité garantie',
      description: 'Tous nos cours passent par un processus de vérification strict pour garantir la qualité du contenu.'
    },
    {
      icon: Heart,
      title: 'Communauté bienveillante',
      description: 'Rejoignez une communauté d\'entraide où les étudiants et instructeurs collaborent pour progresser ensemble.'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">À propos de nous</Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Apprenez la programmation
              <span className="text-gradient block mt-2">avec CodeMaster</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              CodeMaster est une plateforme d'apprentissage en ligne dédiée à la programmation. 
              Notre mission est de rendre l'apprentissage du code accessible, efficace et passionnant pour tous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Commencer à apprendre</Button>
              <Button size="lg" variant="outline">Rencontrer l'équipe</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Notre histoire */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Notre histoire</h2>
            <p className="text-lg text-muted-foreground">
              Fondée en 2023 par des développeurs passionnés, CodeMaster est née d'un constat simple : 
              l'apprentissage de la programmation est souvent trop théorique et peu accessible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Notre mission</h3>
              <p className="text-muted-foreground mb-4">
                Nous voulons démocratiser l'apprentissage de la programmation en proposant des cours 
                interactifs, des exercices pratiques et une communauté d'entraide. Chaque jour, nous 
                travaillons pour rendre l'apprentissage du code plus accessible et plus efficace.
              </p>
              <p className="text-muted-foreground">
                Notre plateforme évolue constamment grâce aux retours de notre communauté. 
                Nous ajoutons régulièrement de nouveaux cours et fonctionnalités pour répondre 
                aux besoins changeants des apprenants.
              </p>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Code2 className="h-24 w-24 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nos valeurs */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos valeurs</h2>
          <p className="text-lg text-muted-foreground">
            Ces principes guident chaque décision que nous prenons
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card key={value.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer votre voyage ?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui apprennent à coder avec CodeMaster
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Créer un compte gratuit
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              Explorer les cours
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}