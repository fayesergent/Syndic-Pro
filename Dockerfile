# ═══════════════════════════════════════════════════════════════
# SyndicPro — Dockerfile multi-stage
# Stage 1 : deps        → installation des dépendances npm
# Stage 2 : development → serveur Vite dev (hot-reload)
# Stage 3 : builder     → build Vite production
# Stage 4 : production  → serveur Nginx statique
# ═══════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────
# STAGE 1 — deps
# But : installer node_modules une seule fois,
#        partagé entre les stages dev et builder
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copier UNIQUEMENT les fichiers de manifeste npm
# (avant le COPY . . pour bénéficier du cache Docker :
#  si package.json ne change pas, cette couche est réutilisée)
COPY package.json ./

# Installer les dépendances
# npm install (pas npm ci car pas de package-lock.json encore)
# --prefer-offline évite les téléchargements redondants
RUN npm install --prefer-offline


# ──────────────────────────────────────────────────────────────
# STAGE 2 — development
# But : serveur Vite avec hot-reload (HMR)
#        monté via volume dans docker-compose
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

# Récupérer node_modules depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
# (sera remplacé en dev par le volume mount de docker-compose)
COPY . .

# Port exposé par le serveur Vite
EXPOSE 5173

# --host 0.0.0.0 : écoute sur toutes les interfaces
# (indispensable pour sortir du conteneur)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# ──────────────────────────────────────────────────────────────
# STAGE 3 — builder
# But : compiler l'application avec Vite
#
# ⚠️  IMPORTANT — Variables Vite et Docker
# Les variables VITE_* sont injectées dans le bundle JS
# au moment du build (pas au runtime).
# Elles doivent donc passer par ARG (build-time),
# pas par ENV (runtime).
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Déclaration des build arguments (fournis par docker-compose)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Rendre les ARG visibles en tant que variables d'environnement
# pour que Vite les inclue dans le bundle
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Compiler → génère le dossier dist/
RUN npm run build


# ──────────────────────────────────────────────────────────────
# STAGE 4 — production
# But : servir les fichiers statiques compilés avec Nginx
#        Image finale ultra-légère (~25 MB)
# ──────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Supprimer la config nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compilés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Port HTTP standard
EXPOSE 80

# nginx en avant-plan (obligatoire pour Docker)
CMD ["nginx", "-g", "daemon off;"]
