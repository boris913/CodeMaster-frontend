'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  order: number;
  type?: 'video' | 'exercise';
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons?: Lesson[];
  completedLessons?: number;
  totalLessons?: number;
  progress?: number;
}

interface ProgressTrackerProps {
  modules: Module[];
  currentLessonId?: string;
  onLessonSelect?: (lessonId: string) => void;
}

export function ProgressTracker({ 
  modules, 
  currentLessonId, 
  onLessonSelect 
}: ProgressTrackerProps) {
  return (
    <div className="space-y-6">
      {modules.map((module) => (
        <div key={module.id} className="border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted/50">
            <h3 className="font-semibold">{module.title}</h3>
            {module.description && (
              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
            )}
            {module.progress !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progression</span>
                  <span>{module.progress}%</span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>
            )}
          </div>
          
          <div className="p-2">
            {module.lessons?.map((lesson) => {
              const isCurrent = lesson.id === currentLessonId;
              const isCompleted = lesson.completed;
              const isLocked = lesson.locked;
              
              return (
                <Button
                  key={lesson.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-auto py-3 px-3 mb-1',
                    isCurrent && 'bg-primary/10 text-primary',
                    !isCurrent && !isLocked && 'hover:bg-accent',
                    isLocked && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !isLocked && onLessonSelect?.(lesson.id)}
                  disabled={isLocked}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{lesson.duration} min</span>
                      {lesson.type && (
                        <span className="capitalize">• {lesson.type}</span>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}