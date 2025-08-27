# ROADMAP

## 1) Back-end (Node.js) ✅

- [x] Architecture des scripts

  - [x] Pipeline modulaire (`build.js`)
  - [x] Structure de fichiers organisée
  - [x] Séparation des responsabilités

- [x] Sources de données

  - [x] ICS (Fixtur.es)
    - [x] Extraction des données
    - [x] Parsing et normalisation
    - [x] Filtrage par date
  - [x] EPG (Open-EPG)
    - [x] Gestion du cache (2h)
    - [x] Extraction J-2 → J+2
    - [x] Gestion des quotas

- [x] Traitement des données
  - [x] Fusion ICS ↔ EPG
    - [x] Tolérance ±60 min
    - [x] Mapping des équipes
    - [x] Attribution des diffuseurs
  - [x] Règles métier
    - [x] Ligue 1+ par défaut
    - [x] beIN SPORTS 1 samedi 17h
    - [x] DAZN pour Serie A
- [x] Gestion des fichiers

  - [x] Format YYYYMMDD
  - [x] Fichiers intermédiaires (`ics_`, `epg_`)
  - [x] Fichiers finaux (`progs_`)
  - [x] Purge automatique (T → T+7)

- [x] Configuration
  - [x] `teams.json` auto-enrichi
  - [x] `channels.json` whitelist
  - [x] `icsSources.json`

## 2) Front-end (React + Vite) 🔄

- [x] Architecture React

  - [x] Structure des composants
  - [x] Gestion des états (useState, useMemo)
  - [x] Organisation des fichiers

- [x] Intégration des données

  - [x] Service API (`fetchEvents`)
  - [x] Format YYYYMMDD validé
  - [x] Mapping des champs
  - [x] Gestion des dates et fuseaux

- [x] Interface utilisateur

  - [x] Navigation temporelle
    - [x] Vue desktop : barre de chips
    - [x] Vue mobile : menu déroulant
  - [x] Filtres
    - [x] Sélection du sport
    - [x] Sélection des équipes
  - [x] Affichage des événements
    - [x] Vue liste simple
    - [x] Vue groupée par compétition
    - [x] Affichage des diffuseurs

- [x] Responsive Design

  - [x] Adaptation mobile
  - [x] Layout fluide
  - [x] Composants adaptatifs

- [ ] Optimisations
  - [ ] Mise en cache des données
  - [ ] Preloading des jours adjacents
  - [ ] États de chargement
  - [ ] Gestion des erreurs
  - [ ] Performances générales

## 3) Notifications 📱

- [ ] Définir règles (par équipe, compétition, créneau)
- [ ] Système de favoris
  - [ ] Stockage local des préférences
  - [ ] Interface de gestion des favoris
- [ ] Générer un flux léger (JSON) "prochains matchs suivis"
- [ ] Intégrer Push Web API
  - [ ] Demande de permission
  - [ ] Gestion des souscriptions
  - [ ] Tests des notifications

## 4) Hébergement (GitHub Pages) 🌐

- [ ] Configuration du déploiement
  - [ ] Workflow GitHub Actions
  - [ ] Base path pour GitHub Pages
- [ ] Publier `/public` (build artefacts) sur `gh-pages`
- [ ] Vérifier chemins relatifs
- [ ] Optimisation cache HTTP
  - [ ] Configuration ETag
  - [ ] Headers cache appropriés

## 5) Cron en ligne ⚙️

- [ ] Planifier build quotidien via GitHub Actions
- [ ] Configuration production
  - [ ] Retrait de l'option `--keep`
  - [ ] Gestion des artefacts
- [ ] Monitoring et alertes
  - [ ] Logs d'exécution
  - [ ] Notification en cas d'échec

## 6) Améliorations futures 🚀

- [ ] Système d'ajout de source (UI/JSON)
  - [ ] Interface d'administration
  - [ ] Validation des sources
- [ ] Enrichissement front
  - [ ] Filtres avancés
  - [ ] Statistiques
  - [ ] Mode hors-ligne (PWA)
- [ ] Intégration de nouveaux sports
- [ ] API publique documentée

---

Légende :

- ✅ Section terminée
- 🔄 En cours
- 📱 À venir
- 🌐 Préparation
- ⚙️ Configuration
- 🚀 Évolutions
