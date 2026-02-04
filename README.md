# 🎓 CodeMaster Frontend - Plateforme E-Learning

Application frontend moderne pour plateforme d'apprentissage de la programmation, inspirée du design épuré de Grafikart.fr.

## 📋 Table des matières

- [Caractéristiques](#caractéristiques)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Structure du projet](#structure-du-projet)
- [API Integration](#api-integration)
- [Composants](#composants)
- [Déploiement](#déploiement)

## ✨ Caractéristiques

### Fonctionnalités principales

- ✅ **Authentification complète** - Login, register, forgot password, JWT refresh
- 📚 **Catalogue de cours** - Filtrage, recherche, pagination
- 🎥 **Lecteur vidéo** - Support YouTube, Vimeo, vidéos uploadées
- 💻 **Éditeur de code** - Monaco Editor avec coloration syntaxique
- 📊 **Suivi de progression** - Dashboard personnalisé, statistiques
- 💬 **Système de commentaires** - Discussions sur les leçons
- 🏆 **Exercices interactifs** - Soumission et évaluation de code
- 🔔 **Notifications** - En temps réel
- 🌙 **Mode sombre** - Thème clair/sombre
- 📱 **Responsive** - Mobile-first design

### Design System

- **Palette de couleurs** inspirée de Grafikart.fr
- **Typographie** - Inter, Lexend, Fira Code
- **Composants** - ShadCN/UI avec personnalisation
- **Animations** - Framer Motion pour les transitions
- **Icons** - Lucide React

## 🛠️ Technologies

### Core

- **Next.js 14** - React framework avec App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Query** - Server state management
- **Zustand** - Client state management

### UI/UX

- **Radix UI** - Composants accessibles
- **Framer Motion** - Animations
- **Monaco Editor** - Éditeur de code
- **React Player** - Lecteur vidéo
- **React Markdown** - Rendu Markdown

### Validation & Forms

- **Zod** - Schema validation
- **React Hook Form** - Form management

### HTTP & API

- **Axios** - HTTP client
- **Interceptors** - Token refresh automatique

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Backend CodeMaster en cours d'exécution

### Étapes

```bash
# 1. Extraire l'archive
unzip codemaster-frontend.zip
cd codemaster-frontend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local

# 4. Modifier .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 5. Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## ⚙️ Configuration

### Variables d'environnement

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_NAME=CodeMaster
NEXT_PUBLIC_APP_DESCRIPTION=Plateforme E-Learning

# Features (optionnel)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
```

### Backend

Assurez-vous que le backend est configuré et en cours d'exécution :

```bash
cd backend
npm run start:dev
```

Le backend doit être accessible sur `http://localhost:3001`

## 🚀 Développement

### Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement

# Production
npm run build        # Build pour production
npm run start        # Démarrer en mode production

# Qualité du code
npm run lint         # Linter ESLint
npm run type-check   # Vérification TypeScript
```

### Structure du projet

```
codemaster-frontend/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── (auth)/            # Routes authentification
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/       # Routes dashboard
│   │   │   └── dashboard/
│   │   ├── courses/           # Routes cours
│   │   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── learn/             # Interface d'apprentissage
│   │   │   └── [courseId]/[lessonId]/
│   │   ├── community/         # Forum
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/               # Composants UI de base
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/           # Composants de layout
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── course/           # Composants cours
│   │   │   ├── course-card.tsx
│   │   │   ├── course-list.tsx
│   │   │   └── ...
│   │   ├── editor/           # Éditeur de code
│   │   │   └── code-editor.tsx
│   │   ├── video/            # Lecteur vidéo
│   │   │   └── video-player.tsx
│   │   └── progress/         # Progression
│   │       └── progress-tracker.tsx
│   ├── lib/
│   │   ├── api/              # Services API
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── lessons.ts
│   │   │   ├── exercises.ts
│   │   │   └── ...
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-course.ts
│   │   │   └── ...
│   │   ├── utils.ts          # Utilitaires
│   │   └── validation/       # Schémas Zod
│   │       ├── auth.ts
│   │       └── course.ts
│   ├── stores/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── courseStore.ts
│   │   └── uiStore.ts
│   ├── types/                # Types TypeScript
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   └── fonts/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🔌 API Integration

### Client API

Le client Axios est configuré avec :

- **Base URL** : `NEXT_PUBLIC_API_URL`
- **Timeout** : 30 secondes
- **Intercepteurs** :
  - Request: Ajout automatique du token JWT
  - Response: Refresh automatique des tokens expirés

```typescript
import apiClient from '@/lib/api/client';

// Exemple d'utilisation
const response = await apiClient.get('/courses');
```

### Services disponibles

```typescript
// Authentification
import { authApi } from '@/lib/api/auth';
await authApi.login({ email, password });
await authApi.register(data);

// Cours
import { coursesApi } from '@/lib/api/courses';
await coursesApi.getAll(filters);
await coursesApi.enroll(courseId);

// Leçons
import { lessonsApi } from '@/lib/api/lessons';
await lessonsApi.getByModule(moduleId);

// Exercices
import { exercisesApi } from '@/lib/api/exercises';
await exercisesApi.submit(exerciseId, code);
```

## 🎨 Composants

### Composants UI

Tous les composants UI suivent le design system et sont hautement personnalisables :

```typescript
// Button
<Button variant="default" size="lg" isLoading={false}>
  Click me
</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Badge
<Badge variant="default">New</Badge>
```

### Composants métier

```typescript
// CourseCard
<CourseCard 
  course={course} 
  variant="default" 
  showProgress={true}
  progress={75}
/>

// VideoPlayer
<VideoPlayer
  src={lesson.videoUrl}
  onProgress={(time) => saveProgress(time)}
  onComplete={() => markAsComplete()}
/>

// CodeEditor
<CodeEditor
  language="javascript"
  defaultValue={starterCode}
  onRun={async (code) => {
    const result = await executeCode(code);
    return result;
  }}
/>
```

## 🎓 Pages principales

### Dashboard (`/dashboard`)

- Vue d'ensemble de la progression
- Cours en cours
- Statistiques
- Activités récentes
- Badges et réalisations

### Catalogue de cours (`/courses`)

- Liste des cours avec filtres
- Recherche
- Pagination
- Tri (popularité, date, difficulté)

### Détail du cours (`/courses/[slug]`)

- Description complète
- Curriculum (modules et leçons)
- Instructeur
- Avis
- Bouton d'inscription

### Interface d'apprentissage (`/learn/[courseId]/[lessonId]`)

Layout en 3 colonnes :
- **Gauche** : Tracker de progression
- **Centre** : Contenu (vidéo, texte, éditeur)
- **Droite** : Outils (notes, ressources)

## 📊 Gestion d'état

### Zustand Stores

```typescript
// Auth Store
const { user, login, logout } = useAuthStore();

// Course Store
const { currentCourse, setCurrentCourse } = useCourseStore();

// UI Store
const { theme, setTheme } = useUIStore();
```

### React Query

```typescript
// Fetch courses
const { data, isLoading } = useQuery({
  queryKey: ['courses'],
  queryFn: () => coursesApi.getAll(),
});

// Enroll mutation
const enrollMutation = useMutation({
  mutationFn: (courseId: string) => coursesApi.enroll(courseId),
  onSuccess: () => {
    queryClient.invalidateQueries(['courses']);
  },
});
```

## 🚀 Déploiement

### Build de production

```bash
npm run build
npm run start
```

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t codemaster-frontend .
docker run -p 3000:3000 codemaster-frontend
```

## 🔒 Sécurité

- ✅ JWT avec refresh automatique
- ✅ CSRF protection
- ✅ XSS protection via React
- ✅ Input validation avec Zod
- ✅ Secure HTTP headers
- ✅ Rate limiting côté backend

## 🎯 Performance

- ✅ Code splitting automatique
- ✅ Image optimization avec next/image
- ✅ Font optimization
- ✅ Lazy loading des composants
- ✅ React Query caching
- ✅ Compression gzip

## 📝 Licence

MIT License - voir LICENSE pour plus de détails

## 👥 Support

Pour toute question ou problème :
- 📧 Email: support@codemaster.com
- 💬 Discord: [Rejoindre](https://discord.gg/codemaster)
- 📚 Documentation: [docs.codemaster.com](https://docs.codemaster.com)

## 🙏 Remerciements

- Design inspiré de [Grafikart.fr](https://grafikart.fr)
- UI Components par [ShadCN](https://ui.shadcn.com)
- Icons par [Lucide](https://lucide.dev)

---

Made with ❤️ by CodeMaster Team
