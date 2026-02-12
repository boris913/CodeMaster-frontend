'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Shield, UserCog, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => usersApi.search(search, 1, 20),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' }) =>
      usersApi.updateRole(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Rôle mis à jour' });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      usersApi.toggleActiveStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Gestion des utilisateurs</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{users?.meta?.total || 0} utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.data.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.username}</span>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="destructive">Désactivé</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value: any) =>
                      updateRoleMutation.mutate({ userId: user.id, role: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Étudiant</SelectItem>
                      <SelectItem value="INSTRUCTOR">Instructeur</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        userId: user.id,
                        isActive: !user.isActive,
                      })
                    }
                  >
                    {user.isActive ? (
                      <Ban className="h-4 w-4 text-destructive" />
                    ) : (
                      <Shield className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}