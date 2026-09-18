# Plateforme de Formation en Ligne (swap)

Plateforme SaaS de formations en ligne : catalogue public, tunnel d'inscription
avec paiement mobile money (Djomy), espace apprenant par lien d'accès privé,
dashboard administrateur (statistiques, CRUD formations, CRM apprenants) et
chatbot IA (Gemini).

## Stack

- **Frontend** : React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + Framer Motion + Recharts
- **Backend** : Node.js / Express (`server.ts`) — sert aussi le frontend en dev (middleware Vite)
- **Base de données** : PostgreSQL (Neon)
- **Paiement** : Djomy (optionnel — désactivé tant que les clés ne sont pas configurées)
- **IA** : Google Gemini via proxy serveur (`/api/chat`)

## Démarrage rapide

**Prérequis** : Node.js 18+

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Copier `.env.example` vers `.env.local` et renseigner au minimum `DATABASE_URL` :
   ```bash
   cp .env.example .env.local
   ```
3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
   → Application sur http://localhost:3000 (les tables sont créées automatiquement
   au premier démarrage, avec une formation de démonstration).

## Variables d'environnement (`.env.local`)

| Variable | Requis | Rôle |
|---|---|---|
| `DATABASE_URL` | ✅ | Chaîne de connexion PostgreSQL (Neon) |
| `ADMIN_PASSWORD` | — | Mot de passe admin par défaut (défaut : `admin123`) |
| `APP_URL` | — | URL publique (redirections de paiement) — sinon déduite de la requête |
| `GEMINI_API_KEY` | — | Active le chatbot IA (`/api/chat`) |
| `DJOMY_API_URL` | — | API Djomy (défaut : `https://api.djomy.africa`) |
| `DJOMY_CLIENT_ID` / `DJOMY_CLIENT_SECRET` / `DJOMY_PARTNER_DOMAIN` | — | Clés marchand Djomy — **vides = paiements désactivés** |

## Accès administrateur

- URL : `/admin/login`
- Identifiant : `admin`
- Mot de passe : valeur de `ADMIN_PASSWORD` (modifiable dans Dashboard → Paramètres)

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur Express + Vite en mode développement |
| `npm run build` | Build de production du frontend (`dist/`) |
| `npm run start` | Serveur Express en mode production (sert `dist/`) |
| `npm run preview` | Build puis serveur de production |
| `npm run lint` | Vérification TypeScript (`tsc --noEmit`) |

## Déploiement

Le backend est un serveur Express classique : compatible Railway, Render,
Fly.io, VPS… Définir `NODE_ENV=production`, `DATABASE_URL` et les variables
optionnelles, puis `npm run build && npm run start`.
