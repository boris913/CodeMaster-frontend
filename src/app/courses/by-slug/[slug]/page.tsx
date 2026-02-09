'use client';

import { useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  ChevronRight,
  Play,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { CourseCard } from '@/components/course/course-card';
import { useToast } from '@/hooks/use-toast';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getByIdOrSlug(slug as string),
    enabled: !!slug,
  });

  const { data: similarCourses } = useQuery({
    queryKey: ['courses', 'similar'],
    queryFn: () => coursesApi.getAll({ 
      limit: 3,
      difficulty: course?.difficulty,
    }),
    enabled: !!course,
  });

  const { data: userEnrollments } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: () => coursesApi.getEnrolled(),
    enabled: isAuthenticated,
  });

  const { data: courseProgress } = useQuery({
    queryKey: ['course-progress', course?.id],
    queryFn: () => progressApi.getCourseProgress(course?.id!),
    enabled: !!course && isAuthenticated,
  });

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(course!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-enrollments'] });
      toast({
        title: 'Inscription réussie',
        description: 'Vous êtes maintenant inscrit à ce cours',
      });
      router.push(`/learning/${course?.id}/start`);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de l\'inscription',
        variant: 'destructive',
      });
    },
  });

  if (error) {
    notFound();
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const handleEnroll = async () => {
    if (!course) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    enrollMutation.mutate();
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const isEnrolled = userEnrollments?.some(e => e.courseId === course?.id);
  const enrollment = userEnrollments?.find(e => e.courseId === course?.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  // Helper pour convertir le cours API en format CourseCard
  const convertToCourseCardFormat = (course: any) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    shortDescription: course.shortDescription,
    thumbnail: course.thumbnail,
    difficulty: course.difficulty,
    duration: course.duration,
    instructor: course.instructor,
    tags: course.tags,
    totalStudents: course.totalStudents,
    rating: course.rating,
    isFeatured: course.isFeatured,
  });

  return (
    <div className="min-h-screen">
      {/* Course Header */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Link href="/courses" className="text-primary hover:underline">
                  Cours
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{course.title}</span>
              </div>

              <h1 className="font-heading text-4xl font-bold tracking-tight mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {course.shortDescription || course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={course.instructor?.avatar} />
                    <AvatarFallback>
                      {course.instructor?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{course.instructor?.username}</span>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Mise à jour {formatDate(course.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} heures</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.totalStudents} étudiants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {course.tags?.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Right Column - Course Card */}
            <div className="lg:w-96">
              <Card className="sticky top-24">
                {course.thumbnail && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={course.thumbnail.startsWith('http') ? course.thumbnail : `/api/images${course.thumbnail}`}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                      priority
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Gratuit</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleFavorite}
                      disabled={!isAuthenticated}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <CardDescription>
                    Accès complet au cours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEnrolled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{enrollment?.progress || 0}%</span>
                      </div>
                      <Progress value={enrollment?.progress || 0} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Ce que vous apprendrez :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {course.modules?.slice(0, 4).map((module) => (
                        <li key={module.id} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{module.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolled || enrollMutation.isPending}
                    >
                      {isEnrolled ? (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Accéder au cours
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          {enrollMutation.isPending ? 'Inscription...' : 'Commencer le cours'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="curriculum">Programme</TabsTrigger>
            <TabsTrigger value="instructor">Instructeur</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="prose max-w-none">
              <h2>Description du cours</h2>
              <p>{course.description}</p>
              
              <h3>À qui s'adresse ce cours ?</h3>
              <ul>
                <li>Développeurs débutants souhaitant apprendre {course.tags?.[0]?.name || 'la programmation'}</li>
                <li>Développeurs voulant se perfectionner</li>
                <li>Étudiants en informatique</li>
                <li>Professionnels en reconversion</li>
              </ul>

              <h3>Prérequis</h3>
              <ul>
                <li>Connaissances de base en HTML/CSS</li>
                <li>Un ordinateur avec connexion internet</li>
                <li>Enthousiasme pour apprendre !</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="curriculum">
            <div className="space-y-6">
              {course.modules?.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{module.title}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {module.lessons?.length || 0} leçons
                      </span>
                    </CardTitle>
                    {module.description && (
                      <CardDescription>
                        {module.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {module.lessons?.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {lesson.duration} minutes
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                            disabled={!isEnrolled}
                          >
                            <Link href={`/learning/${course.id}/${lesson.id}`}>
                              <Play className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="instructor">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <Avatar className="h-32 w-32 mx-auto">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback className="text-2xl">
                        {course.instructor?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="md:w-3/4 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold">{course.instructor?.username}</h3>
                      <p className="text-muted-foreground">Instructeur principal</p>
                    </div>
                    <p className="text-muted-foreground">
                      Instructeur expérimenté passionné par l'enseignement.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{course.rating.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Note moyenne</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{course.totalStudents}</div>
                        <div className="text-sm text-muted-foreground">Étudiants</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Similar Courses */}
        {similarCourses && similarCourses.data.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Cours similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarCourses.data
                .filter(c => c.id !== course.id)
                .slice(0, 3)
                .map((similarCourse) => (
                  <CourseCard
                    key={similarCourse.id}
                    course={convertToCourseCardFormat(similarCourse)}
                    variant="compact"
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}