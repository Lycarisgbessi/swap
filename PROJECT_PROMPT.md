# PROMPT MASTER : PLATEFORME DE FORMATION SAAS (FORMATEUR / ÉLÈVES)

**Rôle de l'IA :** Tu es un développeur Full-Stack Senior, expert en UI/UX Design (style cinématographique, épuré, premium) et en architecture SaaS (React, Node.js, Base de données). Tu dois concevoir, structurer et développer une plateforme de formation en ligne complète.

## 1. VISION GLOBALE ET DESIGN SYSTEM
- **Style Visuel :** Épuré, minimaliste, qualité "cinématographique". Interfaces sombres (Dark Mode premium, fond ardoise/noir), avec des bordures extrêmement fines (hairline borders), des effets de glassmorphisme légers, et des ombres douces.
- **Images :** Visuels haute définition, finitions très poussées, cadrages parfaits.
- **Typographie :** Polices modernes (sans-serif type Inter ou Space Grotesk), hiérarchie claire.

## 2. PARTIE FRONT-END (VISITEURS / ÉLÈVES)
Le côté public de la plateforme ne nécessite pas la création obligatoire d'un compte pour naviguer.
- **Pages principales :**
  - **Accueil :** Hero section à fort impact visuel, carrousel des formations à la une, présentation de l'instructeur, widget Chatbot IA intelligent intégré (Gemini).
  - **À Propos :** L'histoire du formateur, la vision.
  - **Nos Formations :** Catalogue complet. Doit inclure un système de recherche et de filtres multi-critères : Thématique, Certification (Oui/Non), Format (En ligne/Présentiel), Tarif, Durée.
  - **Détail d'une Formation :** Titre, description, plan/programme détaillé, FAQ spécifique.
  - **Contact & FAQ globale.**
- **Parcours Utilisateur (Inscription & Paiement) :**
  - L'utilisateur peut s'inscrire "gratuitement" (accès restreint/mise en attente) ou "payer" pour un accès complet instantané.
  - Formulaire de collecte des données obligatoires : Nom, Prénom, Téléphone, Email.
  - Système de panier + Checkout : Génération automatique d'un reçu après paiement.

## 3. PARTIE BACK-OFFICE / DASHBOARD (ADMINISTRATEUR)
Interface privée pour le formateur, véritable cockpit de gestion avec données en temps réel.
- **Tableau de bord (Vue globale) :**
  - **Statistiques filtrables** par durée (24h, 7 jours, 30 jours, 90 jours, Toujours).
  - KPI : Nombre de visiteurs uniques par formation (scroll trackers), Inscriptions gratuites (prospects), Inscriptions payées, CA généré (Revenus).
- **Gestion des Formations (CRUD) :**
  - Lister les formations avec état (Publié, Brouillon/Invisible).
  - Création/Édition d'une formation.
  - **3 Options de distribution :**
    1. **Natif :** Contenu hébergé structurellement sur le site (Lecteur Vidéo intégré, Textes, Images, PDF, Audios) structuré par Modules & Chapitres gérés par drag-and-drop.
    2. **Package :** Fichier d'archive unique téléchargeable (ZIP via stockage S3/Firebase Storage).
    3. **Lien Externe :** Redirection vers un lien privé (ex: Zoom). Un "Paywall" bloquera l'accès à ce lien tant que l'utilisateur n'a pas prouvé son paiement.
- **Gestion des Utilisateurs / CRM :**
  - Base de données complète des inscrits (payants et gratuits).
  - Informations : Nom, Prénom, Email, Téléphone, Mode de paiement, Liste de reçus, Historique de connexions.

## 4. ARCHITECTURE TECHNIQUE & LOGIQUE BACK-END
- **Frontend :**
  - Architecture React via Vite avec un typage fort TypeScript. 
  - Tailwind CSS + Framer Motion pour les animations fluelles, le routing géré via `react-router-dom`.
- **Backend & Logique :**
  - Backend basé sur **Node.js (Express)** ou **Serverless (Cloud Functions/Firebase)**.
  - **Modèle de données Relationnel ou NoSQL (PostgreSQL / Firestore) :**
    - `Courses`: {id, title, content (Rich Text), status (visible/hidden), type (native/package/external), link/fileUrl, price, category...}
    - `Students`: {id, name, email, phone, enrolled_courses: [{course_id, status: paid/unpaid, enrolledAt}]}
    - `Analytics_Events`: {id, type: 'page_view'|'intent'|'purchase', course_id, timestamp...}
  - **Logique de paiement & Inscription :**
    - Lors du clic, une entrée "Unpaid" est créée en BDD.
    - Une fois l'API de paiement (Stripe ou autre) confirmée en webhook, le statut passe à "Paid" et le lien Zoom/Dossier natif se débloque.
  - **Intelligence Artificielle (Chatbot) :**
    - API Google Gemini intégrée de manière sécurisée côté Serveur (Ne **jamais** exposer l'API key `$GEMINI_API_KEY` sur le front-end React). Le front interrogera un proxy Express API (`/api/chat`) qui fera l'appel à Gemini.
    - Modèle : `gemini-pro`, nourri d'un "System Prompt" (RAG) avec la liste des formations via la base de données.

