'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simuler l'envoi du formulaire
    setTimeout(() => {
      console.log('Form submitted:', data);
      setSubmitSuccess(true);
      reset();
      setIsSubmitting(false);
      
      // Réinitialiser le message de succès après 5 secondes
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@codemaster.com',
      description: 'Réponse sous 24h'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      description: 'Lun-Ven 9h-18h'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: '123 Rue du Code, 75000 Paris',
      description: 'Siège social'
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: 'Lundi - Vendredi',
      description: '9h00 - 18h00'
    },
  ];

  const faqs = [
    {
      question: 'Comment fonctionnent les cours ?',
      answer: 'Nos cours sont organisés en modules et leçons. Vous pouvez apprendre à votre rythme, avec des exercices pratiques et des projets.'
    },
    {
      question: 'Puis-je annuler mon abonnement ?',
      answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre page de paramètres.'
    },
    {
      question: 'Les cours sont-ils accessibles à vie ?',
      answer: 'Une fois inscrit à un cours, vous y avez accès à vie, y compris aux mises à jour futures.'
    },
    {
      question: 'Proposez-vous un support technique ?',
      answer: 'Oui, notre équipe de support est disponible par email et chat pour vous aider avec les problèmes techniques.'
    },
  ];

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Contactez-nous</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulaire de contact */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Envoyez-nous un message
              </CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitSuccess && (
                <Alert className="mb-6">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      {...register('name')}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean@exemple.com"
                      {...register('email')}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    placeholder="Demande d'information sur les cours"
                    {...register('subject')}
                    disabled={isSubmitting}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre question ou demande en détail..."
                    className="min-h-[150px]"
                    {...register('message')}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Informations de contact */}
        <div className="space-y-6">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle>Nos coordonnées</CardTitle>
              <CardDescription>
                Différentes façons de nous contacter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.title} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{info.title}</div>
                        <div className="text-sm">{info.content}</div>
                        <div className="text-xs text-muted-foreground">{info.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6" />
                Questions fréquentes
              </CardTitle>
              <CardDescription>
                Quelques réponses aux questions courantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <div className="font-medium">{faq.question}</div>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  Voir toutes les FAQ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statut du support */}
          <Card>
            <CardHeader>
              <CardTitle>Statut du support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Temps de réponse moyen</span>
                  <Badge variant="outline">2 heures</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disponibilité</span>
                  <Badge variant="default">En ligne</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taux de satisfaction</span>
                  <Badge variant="secondary">98%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}