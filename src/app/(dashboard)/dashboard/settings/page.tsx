'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { usersApi } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function DashboardSettingsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      // Appel API à implémenter côté backend
      await usersApi.updateProfile({ /* ... */ });
      toast({ title: 'Mot de passe mis à jour' });
      reset();
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres du compte</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations publiques</CardTitle>
              <CardDescription>
                Ces informations seront visibles par les autres utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom d'utilisateur</Label>
                  <Input defaultValue={user?.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email} disabled />
                </div>
              </div>
              <Button disabled>Enregistrer (bientôt)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Modifier le mot de passe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        {/* autres onglets */}
      </Tabs>
    </div>
  );
}