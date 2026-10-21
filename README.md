# GameVault

Bibliothèque de jeux vidéo full-stack en TypeScript : une API REST Express et un front React + Vite.

Projet « First fullstack website » (bootcamp C to TypeScript, Epitech), option *Video game library*.

## Structure

```
api/             API REST Node.js + Express (TypeScript strict)
client/          Front React + Vite (Milestones 3 et 4)
client-vanilla/  Front TypeScript + DOM sans framework (Milestone 2)
```

## Prérequis

Node.js 20 ou plus récent, et npm.

## Installer les dépendances

```bash
cd api && npm install
cd ../client && npm install
cd ../client-vanilla && npm install
```

## Lancer l'API

```bash
cd api
npm run dev        # mode développement, rechargement automatique
```

L'API écoute sur http://localhost:3000. Variables d'environnement :

| Variable    | Défaut            | Rôle                                                     |
|-------------|-------------------|----------------------------------------------------------|
| `PORT`      | `3000`            | Port d'écoute                                            |
| `DATA_FILE` | `data/games.json` | Fichier de sauvegarde. `none` = mémoire uniquement       |

Version compilée : `npm run build && npm start`.

## Lancer l'application React

Dans un second terminal, avec l'API démarrée :

```bash
cd client
npm run dev
```

Puis ouvrir http://localhost:5173. Pour viser une autre URL d'API : `VITE_API_URL=http://localhost:4000 npm run dev`.

## Lancer le client du Milestone 2

```bash
cd client-vanilla
npm run dev
```

## Tests et vérification des types

```bash
cd api
npm test           # tests du contrat REST (node:test + fetch)
npm run typecheck  # tsc --strict sur le code et les tests
```

## Routes

| Méthode | Route                 | Succès | Rôle                                   |
|---------|-----------------------|--------|----------------------------------------|
| GET     | `/games`              | 200    | Liste des jeux                         |
| GET     | `/games/:id`          | 200    | Un jeu                                 |
| POST    | `/games`              | 201    | Créer un jeu (en-tête `Location`)      |
| PUT     | `/games/:id`          | 200    | Corps complet : remplace. Partiel : fusionne |
| DELETE  | `/games/:id`          | 204    | Supprimer un jeu                       |
| GET     | `/covers/search?q=`   | 200    | Jaquettes trouvées sur le Steam Store  |

Erreurs : `400` corps ou id invalide, `404` id ou route inconnus, `502` Steam indisponible. Format :

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [{ "field": "rating", "message": "..." }] } }
```
