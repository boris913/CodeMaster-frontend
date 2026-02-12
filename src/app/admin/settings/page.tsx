'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function AdminSettingsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Paramètres système</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration générale</CardTitle>
            <CardDescription>
              Paramètres de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input id="siteName" defaultValue="CodeMaster" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL du site</Label>
                <Input id="siteUrl" defaultValue={process.env.NEXT_PUBLIC_APP_URL} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le mode maintenance
                </p>
              </div>
              <Switch />
            </div>
            <Button className="mt-4">Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limites système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Taille max upload (MB)</Label>
                <Input id="maxFileSize" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCourses">Cours max par instructeur</Label>
                <Input id="maxCourses" type="number" defaultValue="50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}