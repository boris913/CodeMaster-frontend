import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Code2, Users, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
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
                  Parcourir les cours
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">
                  Commencer gratuitement
                </Link>
              </Button>
            </div>
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
              <div
                key={feature.title}
                className="group relative rounded-lg border p-6 hover:shadow-lg transition-all"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
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
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Créer un compte gratuit
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: 'Cours structurés',
    description: 'Des parcours d\'apprentissage progressifs et bien organisés',
  },
  {
    icon: Code2,
    title: 'Exercices pratiques',
    description: 'Mettez en pratique vos compétences avec des défis de code',
  },
  {
    icon: Users,
    title: 'Communauté active',
    description: 'Échangez avec d\'autres apprenants et des experts',
  },
  {
    icon: Trophy,
    title: 'Suivi de progression',
    description: 'Visualisez vos progrès et célébrez vos réussites',
  },
];
