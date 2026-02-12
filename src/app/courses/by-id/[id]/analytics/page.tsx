'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Clock, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CourseAnalyticsPage() {
  const { id } = useParams();

  const { data: course } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getByIdOrSlug(id as string),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['course-enrollments', id],
    queryFn: () => coursesApi.getEnrollments(id as string),
  });

  // Données simulées – à remplacer par des vraies données API
  const completionData = [
    { name: 'Semaine 1', completions: 12 },
    { name: 'Semaine 2', completions: 19 },
    { name: 'Semaine 3', completions: 25 },
    { name: 'Semaine 4', completions: 30 },
  ];

  const moduleCompletion = course?.modules?.map((m, i) => ({
    name: m.title,
    taux: Math.floor(Math.random() * 40 + 60),
  })) || [];

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Statistiques du cours</h1>
      <p className="text-muted-foreground mb-8">{course?.title}</p>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inscriptions</p>
                <div className="text-2xl font-bold">{course?.totalStudents || 0}</div>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de complétion</p>
                <div className="text-2xl font-bold">68%</div>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps total étudié</p>
                <div className="text-2xl font-bold">342h</div>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <div className="text-2xl font-bold">{course?.rating.toFixed(1)}</div>
              </div>
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="completion">
        <TabsList>
          <TabsTrigger value="completion">Évolution des inscriptions</TabsTrigger>
          <TabsTrigger value="modules">Taux par module</TabsTrigger>
        </TabsList>
        <TabsContent value="completion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inscriptions au fil du temps</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completions" stroke="#0ea5e9" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Taux de complétion par module</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moduleCompletion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="taux" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}