'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, Star, BookOpen } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Interface simplifiée pour CourseCard
interface CourseCardCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  instructor?: {
    username: string;
    avatar?: string;
  };
  tags?: Array<{ id: string; name: string }>;
  totalStudents: number;
  rating: number;
  isFeatured?: boolean;
}

interface CourseCardProps {
  course: CourseCardCourse;
  variant?: 'default' | 'compact' | 'featured';
  showProgress?: boolean;
  progress?: number;
}

const difficultyColors = {
  BEGINNER: 'bg-green-500/10 text-green-700 dark:text-green-400',
  INTERMEDIATE: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  ADVANCED: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

export function CourseCard({
  course,
  variant = 'default',
  showProgress = false,
  progress = 0,
}: CourseCardProps) {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  // Fonction pour générer l'URL de la miniature
  const getThumbnailUrl = (thumbnail?: string) => {
    if (!thumbnail) return undefined;
    if (thumbnail.startsWith('http')) return thumbnail;
    if (thumbnail.startsWith('/')) return `/api/images${thumbnail}`;
    return `/api/images/${thumbnail}`;
  };

  const thumbnailUrl = getThumbnailUrl(course.thumbnail);

  return (
    <Link href={`/courses/${course.slug}`}>
      <article
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300',
          'hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1',
          isFeatured && 'md:flex-row md:h-64',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
        )}
      >
        {/* Thumbnail */}
        <div
          className={cn(
            'relative overflow-hidden bg-muted',
            isCompact ? 'h-40' : 'h-48',
            isFeatured && 'md:w-2/5 md:h-full'
          )}
        >
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              className={cn(
                'font-medium',
                difficultyColors[course.difficulty]
              )}
            >
              {course.difficulty === 'BEGINNER' && 'Débutant'}
              {course.difficulty === 'INTERMEDIATE' && 'Intermédiaire'}
              {course.difficulty === 'ADVANCED' && 'Avancé'}
            </Badge>
          </div>

          {/* Featured Badge */}
          {course.isFeatured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-yellow-500/90 text-white">
                ⭐ Populaire
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('flex flex-1 flex-col p-5', isFeatured && 'md:w-3/5')}>
          {/* Tags */}
          {course.tags && course.tags.length > 0 && !isCompact && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {course.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className={cn(
              'font-heading font-semibold text-card-foreground line-clamp-2 mb-2',
              isCompact ? 'text-base' : 'text-lg',
              isFeatured && 'md:text-xl'
            )}
          >
            {course.title}
          </h3>

          {/* Description */}
          {!isCompact && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {course.shortDescription || course.description}
            </p>
          )}

          {/* Instructor */}
          {course.instructor && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {course.instructor.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-muted-foreground">
                {course.instructor.username}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.duration * 60)}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{course.totalStudents}</span>
            </div>

            {course.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}