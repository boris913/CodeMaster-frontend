# 🚀 Guide d'Installation - CodeMaster Frontend

## Prérequis

- Node.js 18+ installé
- npm ou yarn
- Backend CodeMaster en cours d'exécution sur http://localhost:3001

## Installation Rapide

### 1. Installation des dépendances

```bash
npm install
```

Cette commande installera toutes les dépendances nécessaires du projet.

### 2. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Modifiez `.env.local` avec vos paramètres :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CodeMaster
NEXT_PUBLIC_APP_DESCRIPTION=Plateforme E-Learning
```

### 3. Démarrage du serveur de développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Vérification du Backend

Assurez-vous que le backend est démarré :

```bash
# Dans le dossier backend
cd ../backend
npm run start:dev
```

Le backend doit être accessible sur http://localhost:3001

## Structure de Base Créée

Le projet contient actuellement :

✅ Configuration Next.js 14 avec App Router
✅ Configuration TypeScript
✅ Configuration Tailwind CSS avec thème personnalisé
✅ Client API Axios avec intercepteurs
✅ Types TypeScript pour toutes les entités
✅ Services API (auth, courses, etc.)
✅ Store Zustand pour l'authentification
✅ Composants UI de base (Button, Badge, Progress, Toast)
✅ Composant CourseCard
✅ Page d'accueil
✅ Layout principal avec providers

## Prochaines Étapes

Pour compléter l'application, vous devrez ajouter :

1. **Pages d'authentification** (/login, /register, /forgot-password)
2. **Dashboard utilisateur** (/dashboard)
3. **Liste des cours** (/courses)
4. **Détail d'un cours** (/courses/[slug])
5. **Interface d'apprentissage** (/learn/[courseId]/[lessonId])
6. **Composants additionnels** :
   - VideoPlayer
   - CodeEditor (Monaco)
   - ProgressTracker
   - CommentSection
   - Header et Sidebar

## Scripts Disponibles

```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build pour production
npm run start        # Démarrage en production
npm run lint         # Linter
npm run type-check   # Vérification TypeScript
```

## Dépannage

### Erreur de connexion à l'API

Vérifiez que :
1. Le backend est bien démarré
2. L'URL de l'API dans `.env.local` est correcte
3. Le CORS est activé dans le backend

### Erreur de dépendances

Supprimez node_modules et package-lock.json puis réinstallez :

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 déjà utilisé

Changez le port dans package.json :

```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

## Support

Pour toute question :
- Documentation : README.md
- Backend API : http://localhost:3001/api/docs

## Licence

MIT
