'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { communityApi } from '@/lib/api/community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const discussionSchema = z.object({
  title: z.string().min(10),
  content: z.string().min(30),
  categoryId: z.string().min(1),
});

type DiscussionFormData = z.infer<typeof discussionSchema>;

export default function CreateDiscussionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: categories } = communityApi.getCategories();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DiscussionFormData>({
    resolver: zodResolver(discussionSchema),
  });

  const onSubmit = async (data: DiscussionFormData) => {
    setIsLoading(true);
    try {
      const discussion = await communityApi.createDiscussion(data);
      toast({ title: 'Discussion créée' });
      router.push(`/community/discussions/${discussion.id}`);
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Nouvelle discussion</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer une discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select onValueChange={(v) => setValue('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                {...register('content')}
                className="min-h-[200px]"
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publication...
                </>
              ) : (
                'Publier'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}