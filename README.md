# Velhop Tracker

Application Next.js pour suivre l’état des stations et des vélos (Velhop/Nextbike) avec persistance via Prisma/PostgreSQL et visualisation cartographique.

## Stack

- **Framework**: `Next.js` (`next dev/build/start`)
- **DB ORM**: `Prisma` (`@prisma/client`, `prisma`)
- **Base de données**: PostgreSQL (`DATABASE_URL`)
- **Map**: `react-leaflet` / `leaflet`

## Prérequis

- Node.js 18+ et npm
- Une base PostgreSQL accessible (locale ou managée)

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine avec au minimum :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
```

## Base de données (Prisma)

Appliquer le schéma `prisma/schema.prisma` et générer le client :

```bash
npx prisma migrate dev
npx prisma generate
```

## Ingestion des données (boucle 60s)

Le script `scripts/getData.js` récupère périodiquement les données Nextbike et met à jour la base (stations, snapshots, mouvements de vélos).

Exécuter en développement :

```bash
node scripts/getData.js
```

Interrompre avec `Ctrl+C` (le script déconnecte Prisma proprement).

## Lancer l’application

```bash
npm run dev
```

L’app tourne ensuite sur `http://localhost:3000/`.

Build et démarrage en production :

```bash
npm run build
npm run start
```

## API disponible

- `GET /api/get-bike-historic/[id]` — retourne l’historique des déplacements pour un `bikeId`.

Exemple :

```bash
curl http://localhost:3000/api/get-bike-historic/12345
```

## Dépannage

- Vérifier `DATABASE_URL` et l’accessibilité PostgreSQL.
- Si Prisma échoue : `npx prisma generate` puis relancer.
- S’assurer d’avoir exécuté l’ingestion (`node scripts/getData.js`) pour voir des données dans l’UI/API.
