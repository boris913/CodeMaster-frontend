'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  HelpCircle,
  BookOpen,
  CreditCard,
  Settings,
  User,
  Code2,
  Video,
  Download,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'getting-started': true,
    'courses': true,
    'account': true,
    'technical': true,
  });

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Premiers pas',
      icon: HelpCircle,
      questions: [
        {
          question: 'Comment créer un compte ?',
          answer: 'Cliquez sur "S\'inscrire" en haut à droite de la page d\'accueil. Remplissez le formulaire avec votre email et mot de passe, puis validez votre email.'
        },
        {
          question: 'Comment s\'inscrire à un cours ?',
          answer: 'Parcourez le catalogue de cours, cliquez sur un cours qui vous intéresse, puis sur le bouton "Commencer le cours".'
        },
        {
          question: 'Les cours sont-ils gratuits ?',
          answer: 'Certains cours sont gratuits, d\'autres sont payants. Vous pouvez filtrer les cours gratuits dans le catalogue.'
        },
        {
          question: 'Comment fonctionne l\'essai gratuit ?',
          answer: 'Vous avez accès gratuitement aux 3 premières leçons de chaque cours pour vous faire une idée.'
        },
      ]
    },
    {
      id: 'courses',
      title: 'Cours et Apprentissage',
      icon: BookOpen,
      questions: [
        {
          question: 'Puis-je télécharger les cours ?',
          answer: 'Oui, vous pouvez télécharger les supports de cours (PDF, code source) depuis la page de chaque leçon.'
        },
        {
          question: 'Comment suivre ma progression ?',
          answer: 'Votre progression est automatiquement enregistrée. Vous pouvez la voir sur votre tableau de bord et dans la page de chaque cours.'
        },
        {
          question: 'Les cours sont-ils mis à jour ?',
          answer: 'Oui, nous mettons régulièrement à jour nos cours pour suivre les dernières technologies et bonnes pratiques.'
        },
        {
          question: 'Puis-je accéder aux cours sur mobile ?',
          answer: 'Absolument ! Notre plateforme est entièrement responsive et fonctionne sur tous les appareils.'
        },
      ]
    },
    {
      id: 'account',
      title: 'Compte et Paiement',
      icon: User,
      questions: [
        {
          question: 'Comment modifier mes informations ?',
          answer: 'Allez dans "Paramètres du compte" depuis votre profil pour modifier vos informations personnelles.'
        },
        {
          question: 'Comment changer mon mot de passe ?',
          answer: 'Dans "Paramètres du compte", section "Sécurité", vous pouvez modifier votre mot de passe.'
        },
        {
          question: 'Comment annuler mon abonnement ?',
          answer: 'Allez dans "Paramètres du compte" > "Abonnement" et cliquez sur "Annuler l\'abonnement".'
        },
        {
          question: 'Puis-je récupérer un cours acheté ?',
          answer: 'Oui, tous les cours achetés sont liés à votre compte et accessibles à vie.'
        },
      ]
    },
    {
      id: 'technical',
      title: 'Support technique',
      icon: Settings,
      questions: [
        {
          question: 'Problème de lecture vidéo',
          answer: 'Vérifiez votre connexion internet, désactivez les bloqueurs de publicité, ou essayez un autre navigateur.'
        },
        {
          question: 'L\'éditeur de code ne fonctionne pas',
          answer: 'Assurez-vous que JavaScript est activé dans votre navigateur. Essayez de rafraîchir la page ou utilisez un autre navigateur.'
        },
        {
          question: 'Comment signaler un bug ?',
          answer: 'Utilisez le formulaire de contact en décrivant le problème rencontré, ou envoyez un email à support@codemaster.com.'
        },
        {
          question: 'Problème de connexion',
          answer: 'Essayez de réinitialiser votre mot de passe. Si le problème persiste, contactez notre support technique.'
        },
      ]
    },
  ];

  const tutorials = [
    {
      title: 'Bien démarrer avec CodeMaster',
      description: 'Guide complet pour bien débuter sur la plateforme',
      icon: Video,
      duration: '10 min',
      url: '#'
    },
    {
      title: 'Utiliser l\'éditeur de code',
      description: 'Toutes les fonctionnalités de notre IDE en ligne',
      icon: Code2,
      duration: '15 min',
      url: '#'
    },
    {
      title: 'Télécharger les supports de cours',
      description: 'Comment accéder et télécharger les ressources',
      icon: Download,
      duration: '5 min',
      url: '#'
    },
    {
      title: 'Gérer son compte et abonnement',
      description: 'Tout sur la gestion de votre compte',
      icon: Settings,
      duration: '8 min',
      url: '#'
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filteredQuestions = faqCategories.flatMap(category => 
    category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container py-10">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Centre d'aide</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Trouvez rapidement des réponses à vos questions ou contactez notre équipe de support
        </p>
        
        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'aide (ex: 'problème de connexion', 'paiement', 'vidéo')..."
              className="pl-12 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-muted-foreground">
              {filteredQuestions.length} résultat(s) trouvé(s)
            </div>
          )}
        </div>
      </div>

      {/* Résultats de recherche */}
      {searchQuery && filteredQuestions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Résultats de recherche</CardTitle>
            <CardDescription>
              Questions correspondant à votre recherche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuestions.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-accent">
                  <div className="font-medium mb-2">{item.question}</div>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catégories FAQ */}
      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold">Questions fréquentes</h2>
        <div className="space-y-4">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories[category.id];
            
            return (
              <Card key={category.id}>
                <CardHeader 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((item, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4 py-2">
                          <div className="font-medium mb-1">{item.question}</div>
                          <p className="text-sm text-muted-foreground">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Tutoriels vidéo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-6 w-6" />
              Tutoriels vidéo
            </CardTitle>
            <CardDescription>
              Apprenez à utiliser toutes les fonctionnalités de CodeMaster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tutorials.map((tutorial, index) => {
                const Icon = tutorial.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{tutorial.title}</div>
                      <div className="text-sm text-muted-foreground">{tutorial.description}</div>
                    </div>
                    <Badge variant="outline">{tutorial.duration}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contact support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Besoin d'aide supplémentaire ?
            </CardTitle>
            <CardDescription>
              Notre équipe de support est là pour vous aider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Email de support</div>
                    <div className="text-sm">support@codemaster.com</div>
                    <div className="text-xs text-muted-foreground">Réponse sous 24h</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Chat en direct</div>
                    <div className="text-sm">Disponible 9h-18h (UTC+1)</div>
                    <div className="text-xs text-muted-foreground">Temps de réponse moyen : 15 min</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Avant de contacter le support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Vérifiez que votre question n'est pas déjà dans la FAQ</li>
                  <li>• Précisez le cours ou la fonctionnalité concernée</li>
                  <li>• Décrivez les étapes pour reproduire le problème</li>
                  <li>• Joignez des captures d'écran si possible</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Contactez le support</Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}