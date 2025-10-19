# TV Sports - Documentation Projet

## Table des matières
- [TV Sports - Documentation Projet](#tv-sports---documentation-projet)
  - [Table des matières](#table-des-matières)
  - [1. Présentation du projet](#1-présentation-du-projet)
  - [2. Stack technique](#2-stack-technique)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Outils](#outils)
  - [3. Architecture](#3-architecture)
  - [4. Modules principaux](#4-modules-principaux)
    - [Gestion des sources de données](#gestion-des-sources-de-données)
    - [Composants UI](#composants-ui)
    - [Services](#services)
  - [5. Processus de contribution](#5-processus-de-contribution)
    - [Code Review](#code-review)
    - [Bonnes pratiques](#bonnes-pratiques)
  - [6. Roadmap/TODO](#6-roadmaptodo)
    - [En cours](#en-cours)
    - [À venir](#à-venir)
  - [7. Points forts \& limitations](#7-points-forts--limitations)
    - [Limitations techniques](#limitations-techniques)

## 1. Présentation du projet
Application web de suivi des événements sportifs en temps réel avec affichage de grille de programmes.

## 2. Stack technique

### Frontend
- Framework : React (Vite)
- UI : Composants personnalisés
- Gestion d'état : Hooks React
- Notifications : API Web Notifications

### Backend
- Runtime : Node.js
- Serveur : Express
- Données : Fichiers JSON locaux (`config/`)

### Outils
- Build : Vite
- Package Manager : npm
- Linter : ESLint

## 3. Architecture
```
tv_sports/
├── config/
│   ├── channels.json
│   ├── icsSources.json
│   ├── teams.json
│   └── userSettings.json
├── public/
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/
│   ├── build.js
│   ├── dev-check.js
│   ├── epg.js
│   └── ics.js
└── src/
    ├── components/
    │   ├── DayStrip.jsx
    │   ├── EventsList.jsx
    │   └── LoadingSpinner.jsx
    │   ├── SportsTabs.jsx
    │   └── ThemeSwitcher.jsx
    ├── hooks/
    │   └── useNotifications.js
    ├── lib/
    │   └── dateUtils.js
    └── services/
        ├── api.js
        ├── sources.js
        └── userConfig.js
```

## 4. Modules principaux

### Gestion des sources de données
- Lecture/écriture des configurations utilisateur
- Récupération des données EPG (Electronic Program Guide)
- Gestion des sources ICS (calendriers)

### Composants UI
- `DayStrip` : Affichage des jours de programmation
- `EventsList` : Liste des événements sportifs
- `LoadingSpinner` : Indicateur de chargement
- `SportsTabs` : Onglets des sports
- `ThemeSwitcher` : Switcher de thème

### Services
- `api.js` : Communication avec le backend
- `sources.js` : Gestion des sources de données
- `userConfig.js` : Configuration utilisateur

## 5. Processus de contribution

### Code Review
- Tester les modifications localement
- Vérifier la qualité du code (ESLint)
- Documenter les changements majeurs

### Bonnes pratiques
- Ne pas commiter les fichiers de configuration sensibles
- Utiliser des variables d'environnement
- Valider les entrées utilisateur

## 6. Roadmap/TODO

### En cours
- [ ] Refactoring des composants UI
- [ ] Mise en place du responsive Mobile

### À venir
- [ ] Ajouter plus de sources de données -> (scraping)
- [ ] Ajouter un système d'authentification
- [ ] Ajouter des fonctionnalités de configuration utilisateur
- [ ] Ajouter des notifications -> (web push)

## 7. Points forts & limitations

### Limitations techniques
- Dépendance aux sources de données externes
- Gestion basique des erreurs