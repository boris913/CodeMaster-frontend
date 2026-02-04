# 📦 Guide d'Implémentation des Composants

Ce document liste tous les composants à implémenter pour compléter l'application CodeMaster Frontend.

## ✅ Composants Déjà Créés

### UI Components
- ✅ Button
- ✅ Badge
- ✅ Progress
- ✅ Toast/Toaster

### Business Components
- ✅ CourseCard

### Pages
- ✅ Home page (/)
- ✅ Layout principal
- ✅ Providers (React Query, Theme)

## 🔨 Composants à Créer

### 1. UI Components de Base

#### Card
```typescript
// src/components/ui/card.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border bg-card text-card-foreground shadow', className)}
      {...props}
    />
  )
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-heading text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

#### Input
```typescript
// src/components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
export { Input };
```

#### Label, Select, Dialog, Tabs, Accordion
Utiliser Radix UI pour ces composants (voir documentation ShadCN/UI)

### 2. Layout Components

#### Header
```typescript
// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="font-heading text-2xl font-bold">
          CodeMaster
        </Link>

        {/* Navigation */}
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/courses">Cours</Link>
          <Link href="/community">Communauté</Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button onClick={() => logout()}>Déconnexion</Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button>S'inscrire</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

#### Sidebar
```typescript
// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Trophy, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/courses', label: 'Mes Cours', icon: BookOpen },
  { href: '/achievements', label: 'Réussites', icon: Trophy },
  { href: '/profile', label: 'Profil', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card p-6">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### 3. Feature Components

#### VideoPlayer
```typescript
// src/components/video/video-player.tsx
'use client';

import ReactPlayer from 'react-player';
import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  onProgress?: (seconds: number) => void;
  onComplete?: () => void;
  startAt?: number;
}

export function VideoPlayer({ 
  src, 
  onProgress, 
  onComplete,
  startAt = 0 
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={src}
        playing={playing}
        muted={muted}
        width="100%"
        height="100%"
        controls
        onProgress={({ playedSeconds }) => {
          setProgress(playedSeconds);
          onProgress?.(playedSeconds);
        }}
        onEnded={() => onComplete?.()}
      />
    </div>
  );
}
```

#### CodeEditor
```typescript
// src/components/editor/code-editor.tsx
'use client';

import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
  language: string;
  defaultValue: string;
  onRun?: (code: string) => Promise<any>;
  readOnly?: boolean;
}

export function CodeEditor({ 
  language, 
  defaultValue, 
  onRun,
  readOnly = false 
}: CodeEditorProps) {
  const [code, setCode] = useState(defaultValue);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { theme } = useTheme();

  const handleRun = async () => {
    if (!onRun) return;
    
    setIsRunning(true);
    try {
      const result = await onRun(code);
      setOutput(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setOutput(`Erreur: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
        <Button
          size="sm"
          onClick={handleRun}
          disabled={isRunning || readOnly}
        >
          <Play className="h-4 w-4 mr-1" />
          Exécuter
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCode(defaultValue)}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly,
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Output */}
      {output && (
        <div className="border-t p-4 bg-muted/20">
          <div className="text-sm font-medium mb-2">Sortie :</div>
          <pre className="text-xs overflow-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}
```

#### ProgressTracker
```typescript
// src/components/progress/progress-tracker.tsx
'use client';

import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  locked?: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface ProgressTrackerProps {
  modules: Module[];
  currentLessonId?: string;
  onLessonSelect?: (lessonId: string) => void;
}

export function ProgressTracker({
  modules,
  currentLessonId,
  onLessonSelect,
}: ProgressTrackerProps) {
  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.id} className="border rounded-lg p-4">
          <h3 className="font-heading font-semibold mb-3">{module.title}</h3>
          
          <div className="space-y-2">
            {module.lessons.map((lesson) => {
              const isActive = lesson.id === currentLessonId;
              const Icon = lesson.completed
                ? CheckCircle2
                : lesson.locked
                ? Lock
                : Circle;

              return (
                <button
                  key={lesson.id}
                  onClick={() => !lesson.locked && onLessonSelect?.(lesson.id)}
                  disabled={lesson.locked}
                  className={cn(
                    'flex items-center gap-3 w-full p-2 rounded-lg text-sm transition-colors text-left',
                    isActive && 'bg-primary/10 text-primary font-medium',
                    !isActive && !lesson.locked && 'hover:bg-accent',
                    lesson.locked && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      lesson.completed && 'text-green-500',
                      isActive && 'text-primary'
                    )}
                  />
                  <span className="flex-1">{lesson.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {lesson.duration}min
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 📄 Pages à Créer

### Authentication Pages
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`

### Dashboard
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/layout.tsx`

### Courses
- `src/app/courses/page.tsx`
- `src/app/courses/[slug]/page.tsx`

### Learning Interface
- `src/app/learn/[courseId]/[lessonId]/page.tsx`

### Community
- `src/app/community/page.tsx`

## 🔄 API Services à Créer

- `src/lib/api/lessons.ts`
- `src/lib/api/modules.ts`
- `src/lib/api/exercises.ts`
- `src/lib/api/progress.ts`
- `src/lib/api/comments.ts`
- `src/lib/api/notifications.ts`
- `src/lib/api/users.ts`

## 🎨 Validation Schemas (Zod)

```typescript
// src/lib/validation/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z.string().min(3, 'Au moins 3 caractères'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
```

## 📦 Installation des Dépendances Manquantes

Si vous rencontrez des erreurs, installez :

```bash
npm install @radix-ui/react-toast @radix-ui/react-progress
npm install @tanstack/react-query-devtools
npm install next-themes
```

## 🎯 Prochaines Étapes

1. Créer les composants UI manquants (Card, Input, Dialog, etc.)
2. Créer les pages d'authentification
3. Créer le dashboard
4. Implémenter l'interface d'apprentissage
5. Ajouter les services API restants
6. Tester l'intégration avec le backend

---

**Note**: Ce guide fournit des exemples de base. Vous devrez adapter et étendre ces composants selon vos besoins spécifiques.
