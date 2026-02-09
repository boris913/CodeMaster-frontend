import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Code2, 
  Users, 
  Trophy,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Mail,
  Info,
  Target,
  Award,
  GraduationCap,
  Rocket
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Cours structurés',
      description: 'Des parcours d\'apprentissage progressifs et bien organisés',
      link: '/courses',
    },
    {
      icon: Code2,
      title: 'Exercices pratiques',
      description: 'Mettez en pratique vos compétences avec des défis de code',
      link: '/courses',
    },
    {
      icon: Users,
      title: 'Communauté active',
      description: 'Échangez avec d\'autres apprenants et des experts',
      link: '/community',
    },
    {
      icon: Trophy,
      title: 'Suivi de progression',
      description: 'Visualisez vos progrès et célébrez vos réussites',
      link: '/dashboard',
    },
  ];

  const quickLinks = [
    {
      title: 'Parcourir les cours',
      description: 'Découvrez notre catalogue complet',
      icon: BookOpen,
      link: '/courses',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Mes cours',
      description: 'Accédez à vos cours en cours',
      icon: GraduationCap,
      link: '/my-courses',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'Communauté',
      description: 'Rejoignez les discussions',
      icon: MessageSquare,
      link: '/community',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'Classement',
      description: 'Comparez vos performances',
      icon: Trophy,
      link: '/leaderboard',
      color: 'bg-yellow-500/10 text-yellow-500',
    },
    {
      title: 'Statistiques',
      description: 'Suivez votre progression',
      icon: BarChart3,
      link: '/stats',
      color: 'bg-red-500/10 text-red-500',
    },
    {
      title: 'Aide & Support',
      description: 'Obtenez de l\'aide',
      icon: HelpCircle,
      link: '/help',
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  const navigationSections = [
    {
      title: 'Apprendre',
      links: [
        { name: 'Catalogue de cours', href: '/courses', icon: BookOpen },
        { name: 'Mes cours', href: '/my-courses', icon: GraduationCap },
        { name: 'Tableau de bord', href: '/dashboard', icon: Target },
      ],
    },
    {
      title: 'Communauté',
      links: [
        { name: 'Forum & Discussions', href: '/community', icon: MessageSquare },
        { name: 'Classement', href: '/leaderboard', icon: Trophy },
      ],
    },
    {
      title: 'Ressources',
      links: [
        { name: 'Statistiques', href: '/stats', icon: BarChart3 },
        { name: 'Centre d\'aide', href: '/help', icon: HelpCircle },
        { name: 'À propos', href: '/about', icon: Info },
        { name: 'Contact', href: '/contact', icon: Mail },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">🚀 Nouvelle plateforme d'apprentissage</Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Apprenez la programmation
              <span className="text-gradient block mt-2">
                à votre rythme
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 sm:text-xl">
              Rejoignez des milliers d'étudiants et développez vos compétences
              en programmation avec nos cours interactifs et nos exercices pratiques.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Parcourir les cours
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">
                  <Rocket className="mr-2 h-5 w-5" />
                  Commencer gratuitement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.link}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <div className={`mx-auto mb-3 h-12 w-12 rounded-lg ${item.color} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground">
              Une plateforme complète pour apprendre efficacement
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.link}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Sections */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl mb-4">
              Explorez la plateforme
            </h2>
            <p className="text-lg text-muted-foreground">
              Accédez rapidement à toutes les sections de CodeMaster
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {navigationSections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Cours disponibles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Étudiants actifs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">2.5K+</div>
                <div className="text-sm text-muted-foreground">Exercices pratiques</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Instructeurs experts</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Inscrivez-vous gratuitement et accédez immédiatement à nos cours
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Créer un compte gratuit
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/about">
                  En savoir plus
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
