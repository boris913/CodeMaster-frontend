'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { analyticsApi } from '@/lib/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Clock, Award, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CourseAnalyticsPage() {
  const { id } = useParams();
  const courseId = id as string;

  const { data: course, isLoading: isLoadingCourse, error: courseError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getByIdOrSlug(courseId),
  });

  const { data: analytics, isLoading: isLoadingAnalytics, error: analyticsError } = useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: () => analyticsApi.getCourseAnalytics(courseId),
    enabled: !!courseId,
  });

  if (isLoadingCourse || isLoadingAnalytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (courseError || analyticsError) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des données. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalStudents = analytics?.totalEnrollments || 0;
  const completionRate = analytics?.completionRate || 0;
  const totalTimeSpent = analytics?.totalTimeSpent || 0;
  const averageRating = analytics?.averageRating || 0;
  const enrollmentTrend = analytics?.enrollmentTrend || [];
  const moduleCompletion = analytics?.moduleCompletion || [];

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
                <div className="text-2xl font-bold">{totalStudents}</div>
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
                <div className="text-2xl font-bold">{completionRate}%</div>
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
                <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)}h</div>
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
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
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
              {enrollmentTrend.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0ea5e9" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Taux de complétion par module</CardTitle>
            </CardHeader>
            <CardContent>
              {moduleCompletion.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moduleCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}