# JARVIS — Interface Web

Interface web de l'assistant JARVIS. Dashboard avec chat, statut des modules, projets et mémoire.

## Déploiement

```bash
# 1. Créer le repo GitHub
gh repo create jarvis-web --public --source=. --remote=origin --push

# 2. Déployer sur Vercel
vercel --prod

# Ou connecter le repo GitHub directement depuis vercel.com
```

## Développement local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## API embarquée

Tous les endpoints sont dans les Next.js API routes (`/api/jarvis/*`). Pas de backend séparé nécessaire.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- lucide-react (icônes)
