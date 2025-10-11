# TV Sports - Documentation Projet

## Table des matières
- [1. Présentation du projet](#1-présentation-du-projet)
- [2. Stack technique](#2-stack-technique)
- [3. Architecture](#3-architecture)
- [4. Modules principaux](#4-modules-principaux)
- [5. Commandes de développement](#5-commandes-de-développement)
- [6. Processus de contribution](#6-processus-de-contribution)
- [7. Sécurité & configuration](#7-sécurité--configuration)
- [8. Déploiement/CI-CD](#8-déploiementci-cd)
- [9. Roadmap/TODO](#9-roadmaptodo)
- [10. Points forts & limitations](#10-points-forts--limitations)

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

### Services
- `api.js` : Communication avec le backend
- `sources.js` : Gestion des sources de données
- `userConfig.js` : Configuration utilisateur

## 5. Commandes de développement

```bash
# Installation des dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build

# Vérification du code
npm run lint
```

## 6. Processus de contribution

### Workflow Git
1. Créer une branche depuis `main`
2. Nommer la branche : `feature/nom-de-la-fonctionnalité`
3. Soumettre une Pull Request

### Code Review
- Tester les modifications localement
- Vérifier la qualité du code (ESLint)
- Documenter les changements majeurs

## 7. Sécurité & configuration

### Fichiers sensibles
- `.env` (à créer)
  ```
  PORT=3000
  NODE_ENV=development
  ```

### Bonnes pratiques
- Ne pas commiter les fichiers de configuration sensibles
- Utiliser des variables d'environnement
- Valider les entrées utilisateur

## 8. Déploiement/CI-CD

### Prérequis
- Node.js 16+
- npm 8+

### Checklist de déploiement
- [ ] Exécuter les tests
- [ ] Mettre à jour la version
- [ ] Mettre à jour le changelog
- [ ] Créer un tag Git
- [ ] Déployer sur le serveur

## 9. Roadmap/TODO

### À venir
- [ ] Améliorer la gestion des fuseaux horaires
- [ ] Ajouter plus de sources de données
- [ ] Optimiser les performances de chargement

### En cours
- [ ] Refactoring des composants UI
- [ ] Amélioration de la documentation

## 10. Points forts & limitations

### Points forts
- Interface utilisateur réactive
- Chargement progressif des données
- Support des notifications navigateur

### Limitations techniques
- Dépendance aux sources de données externes
- Gestion basique des erreurs
- Pas de système d'authentification

---
*Document généré le 11/10/2025*
