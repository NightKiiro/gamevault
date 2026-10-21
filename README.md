# 🎮 GameVault – Ta collection de jeux vidéo, rangée comme une vitrine

## 🎯 Présentation du projet

**GameVault** est une application web full-stack pour gérer sa bibliothèque de jeux vidéo : ajouter ses jeux avec leur **vraie jaquette Steam**, suivre ceux qu'on a terminés, les noter, et les ranger par **plateforme**.

L'objectif est simple : remplacer la liste de jeux notée au hasard dans un coin par une **vitrine visuelle et agréable à parcourir**, qui répond à la question « à quoi je joue ensuite ? ».

Le projet a été réalisé dans le cadre du bootcamp **C to TypeScript** d'EPITECH (*First fullstack website*, option *Video game library*). Il couvre les **4 milestones** et le **stretch** (seconde ressource), avec des extensions pour montrer ce qu'on peut construire au-delà du minimum demandé.

---

## 🧠 Fonctionnement global

GameVault repose sur deux projets indépendants qui communiquent uniquement en HTTP/JSON :

* 🗄️ **Une API REST** (Node.js + Express) qui stocke les jeux et les plateformes en mémoire, avec une sauvegarde dans des fichiers JSON
* 🖥️ **Un front React** (Vite) qui affiche la bibliothèque et réalise toutes les actions via `fetch`
* 🖼️ **Une recherche de jaquettes** sur le Steam Store, faite par l'API pour contourner la restriction CORS du navigateur
* 🔗 **Une relation jeux ↔ plateformes**, contrôlée par l'API (renommage répercuté, suppression protégée)
* 🧪 **Une validation des données des deux côtés** : les types TypeScript disparaissent à l'exécution, donc tout ce qui traverse le réseau est vérifié

Un troisième projet, `client-vanilla`, contient le client du Milestone 2 : TypeScript et DOM, sans framework.

---

## 📁 Structure du Projet

```
.
├── api                     # API REST Express (TypeScript strict)
│   ├── src
│   │   ├── models          # Interfaces Game et Platform
│   │   ├── validation      # Vérification des données reçues (type guards sur unknown)
│   │   ├── store           # Stockage générique en mémoire + sauvegarde JSON
│   │   ├── services        # Logique métier commune aux deux ressources
│   │   ├── routes          # Routes /games, /platforms, /covers
│   │   ├── covers          # Recherche de jaquettes sur le Steam Store
│   │   ├── middleware      # Gestion des erreurs, logs des requêtes
│   │   ├── http            # Erreurs HTTP typées
│   │   └── data            # Jeux et plateformes de départ
│   ├── test                # Tests du contrat REST (node:test + fetch)
│   └── data                # Fichiers de sauvegarde (générés, ignorés par Git)
├── client                  # Front React + Vite (Milestones 3 et 4)
│   └── src
│       ├── api             # Appels à l'API et validation des réponses
│       ├── hooks           # useGames, usePlatforms, useTheme
│       ├── lib             # Fonctions pures : filtres, tri, validation des formulaires
│       └── components      # Composants d'interface
├── client-vanilla          # Front TypeScript + DOM sans framework (Milestone 2)
├── .gitignore
└── README.md
```

---

## 🚀 Installation et Lancement

### 🔧 Prérequis

* Node.js 20 ou plus récent
* npm
* Une connexion Internet pour la recherche de jaquettes Steam (facultative : le reste fonctionne hors ligne)

---

### 📥 Installation

```bash
git clone git@github.com:NightKiiro/gamevault.git
cd gamevault
```

---

### 📦 Dépendances

```bash
cd api && npm install
cd ../client && npm install
cd ../client-vanilla && npm install
```

---

### ⚙️ Configuration

Tout est optionnel : les valeurs par défaut suffisent pour lancer le projet.

```env
# API
PORT=3000           # port d'écoute de l'API
DATA_DIR=data       # dossier de sauvegarde (games.json, platforms.json), "none" = mémoire uniquement

# Front (fichier client/.env)
VITE_API_URL=http://localhost:3000
```

---

### ▶️ Lancement

Dans un premier terminal, lance l'API :

```bash
cd api
npm run dev
```

Dans un second terminal, lance le front React :

```bash
cd client
npm run dev
```

Puis ouvre **http://localhost:5173**.

Pour la version compilée de l'API : `npm run build && npm start`.
Pour le client du Milestone 2 : `cd client-vanilla && npm run dev`.

---

## ⚡ Utilisation

### Fonctionnalités principales

* 🏠 **Ta prochaine partie** : en tête de page, le jeu le mieux noté que tu n'as pas encore terminé
* 📚 **Bibliothèque** : toutes tes jaquettes, avec un sceau holographique sur les jeux terminés
* 🔎 **Recherche, filtres et tri** : par titre, genre, plateforme ou statut, sans tenir compte des accents
* 🖼️ **Ajout d'un jeu** : tape le titre, choisis la jaquette proposée par Steam, ou colle tes propres images
* 📄 **Fiche détail** : image de fond, informations du jeu, actions (terminer, modifier, supprimer)
* 🕹️ **Plateformes** : une page dédiée, avec les jaquettes de chaque plateforme présentées en éventail
* 🌗 **Thème clair et sombre**, mémorisé d'une visite à l'autre

### 📡 Routes de l'API

| Méthode | Route               | Succès | Rôle                                                    |
|---------|---------------------|--------|---------------------------------------------------------|
| GET     | `/games`            | 200    | Liste des jeux                                          |
| GET     | `/games/:id`        | 200    | Un jeu                                                  |
| POST    | `/games`            | 201    | Créer un jeu (en-tête `Location`)                       |
| PUT     | `/games/:id`        | 200    | Corps complet : remplace le jeu. Corps partiel : fusionne |
| DELETE  | `/games/:id`        | 204    | Supprimer un jeu                                        |
| GET     | `/platforms`        | 200    | Liste des plateformes, avec leur nombre de jeux         |
| GET     | `/platforms/:id`    | 200    | Une plateforme                                          |
| POST    | `/platforms`        | 201    | Créer une plateforme                                    |
| PUT     | `/platforms/:id`    | 200    | Modifier une plateforme (le nouveau nom est recopié sur ses jeux) |
| DELETE  | `/platforms/:id`    | 204    | Supprimer une plateforme qui n'est plus utilisée        |
| GET     | `/covers/search?q=` | 200    | Jaquettes trouvées sur le Steam Store                   |

Exemple :

```bash
curl -X POST localhost:3000/games -H "Content-Type: application/json" \
  -d '{"title":"Hades","platform":"PC","platformId":1,"genre":"Roguelike","completed":true,"rating":9.5}'
```

Toutes les erreurs suivent le même format :

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Le jeu envoyé est invalide", "details": [{ "field": "rating", "message": "doit être compris entre 0 et 10" }] } }
```

| Code | Quand                                                                    |
|------|--------------------------------------------------------------------------|
| 400  | Corps invalide, JSON malformé, id non numérique, plateforme inexistante  |
| 404  | Jeu, plateforme ou route inconnus                                        |
| 409  | Nom de plateforme déjà pris, ou suppression d'une plateforme utilisée    |
| 502  | Le Steam Store ne répond pas                                             |

---

## 🧪 Tests

```bash
cd api
npm test           # 41 tests du contrat REST
npm run typecheck  # tsc --strict sur le code et les tests
```

Les tests lancent un vrai serveur sur un port libre, avec un stockage en mémoire neuf pour chaque test. La recherche Steam est remplacée par une fausse fonction : les tests n'appellent jamais Internet.

---

## 🛠 Technologies Utilisées

### 💻 Backend

* **TypeScript** (`--strict`, sans `any` ni `!`) : langage principal
* **Node.js + Express 5** : serveur HTTP et routes REST
* **Fichiers JSON** : sauvegarde relue au démarrage (aucune base de données, conformément au sujet)

### 🌐 Frontend

* **React 19 + Vite** : interface en composants fonctionnels
* **CSS natif** : variables pour les thèmes, sans framework CSS
* **Bricolage Grotesque & Instrument Sans** : typographies (Google Fonts)

### 📡 Données externes

* **Steam Store** : recherche de jeux et URLs des jaquettes officielles

### ⚙️ Outils

* **node:test** : tests de l'API
* **tsx** : exécution du TypeScript en développement
* **Git / GitHub** : gestion des versions

---

## 📊 Points Clés

* 🛡️ **Aucune donnée n'est crue sur parole** : le corps des requêtes, le fichier de sauvegarde et les réponses de Steam sont tous vérifiés à l'exécution
* ⚡ **Mises à jour optimistes** : terminer ou supprimer un jeu s'affiche immédiatement, et l'interface revient en arrière si l'API refuse
* ⏱️ **Délai maximal sur chaque requête** : une API bloquée affiche un message au lieu de faire attendre indéfiniment
* 🧯 **Pas d'écran blanc** : un composant qui plante affiche un écran de secours (ErrorBoundary)
* ♻️ **Stockage générique** : jeux et plateformes partagent le même code, grâce aux génériques TypeScript
* 🔢 **Identifiants générés par le serveur**, et jamais réutilisés après une suppression

---

## 🔐 Sécurité et Robustesse

* 🚫 **Pas d'injection HTML (XSS)** : les données sont affichées comme du texte, jamais injectées comme du HTML
* 🔗 **URLs d'images contrôlées** : seules `http://` et `https://` sont acceptées (`javascript:` est refusé)
* 💾 **Sauvegarde fiable** : l'écriture passe par un fichier temporaire, et un fichier corrompu est mis de côté au lieu d'être écrasé
* 📦 **Taille des requêtes limitée** à 100 Ko
* 🙈 **En-tête `X-Powered-By` désactivé** : l'API ne révèle pas sa technologie

---

## ⚠️ Limites Connues

* La recherche de jaquettes utilise une route du Steam Store qui n'est **pas documentée officiellement** : elle peut changer
* Seuls les **jeux vendus sur Steam** sont trouvés. Pour une exclusivité console, il faut coller une URL d'image à la main
* Les images restent **hébergées chez Steam** : si une URL disparaît, une jaquette générée prend le relais

---

## 👤 Contributeur

Ce projet a été développé en solo dans le cadre du bootcamp *C to TypeScript* à EPITECH par :

* **NightKiiro** – [github.com/NightKiiro](https://github.com/NightKiiro)
