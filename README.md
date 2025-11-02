# TV Sports - Agrégateur de Programmes Sportifs

> **🚀 Application web qui agrège quotidiennement événements sportifs et diffusions TV**

[![Déploiement](https://img.shields.io/badge/d%C3%A9ploy%C3%A9-GitHub%20Pages-success)](https://benjaminbusselet.github.io/tv_sports/)
[![Daily Updates](https://img.shields.io/badge/mises%20%C3%A0%20jour-quotidiennes%201h%20UTC-blue)]()

## 🎯 Vue d'ensemble

TV Sports génère quotidiennement des fichiers JSON unifiés (`progs_YYYYMMDD.json`) qui combinent :

- **📅 Événements sportifs** issus de calendriers ICS officiels
- **📺 Programmes TV** des diffuseurs via EPG
- **🤖 Correspondance intelligente** avec tolérance temporelle ±60min

**Interface moderne** : React responsive, onglet "Toutes" par défaut, filtres par sport/équipe

## 🏗️ Architecture

### Sources de données
- **🏎️ F1 & ⚽ Football** : Web scraping des sites officiels (Ligue 1, La Liga, Premier League, Serie A, Bundesliga)
- **🏉 Rugby** : Web scraping (Top 14, Rugby Championship, Tournoi des 6 Nations)
- **🥊 Combat** : Web scraping (UFC, combats de boxe)
- **📺 EPG** : Open-EPG (grilles TV, fenêtre J-2 à J+2)
- **👥 Équipes** : `config/teams.json` (normalisation des noms)
- **⚙️ Configuration** : `scrapingSources.json` (sources de scraping) + `userSettings.json` (préférences personnelles)
- **💾 Cache** : `cache/` (calendriers saison complète)
- **📝 Logs** : `logs/` (historique des scrapers)

### Stack technique
- **Backend** : Node.js, pipeline en mémoire, parsing XML
- **Scraping** : axios (requêtes HTTP) + cheerio (parsing HTML)
- **Frontend** : React + Vite, CSS moderne, Service Worker
- **Déploiement** : GitHub Pages + Actions (CI/CD quotidien 1h UTC)

## 💻 Développement

### Installation et démarrage
```bash
npm install
npm run dev    # Frontend + backend local
```

### Stratégie de récupération des données
- **Cache saison complète** : Scraping mensuel des calendriers complets
- **Fenêtre glissante** : Génération quotidienne des 7 prochains jours
- **Mises à jour intelligentes** : Scraping quotidien des modifications récentes (14 jours)
- **Fallback** : Données en cache si scraping échoue

### Scripts de données
```bash
# Génération complète (défaut: aujourd'hui → +7 jours)
node scripts/build.js

# Période spécifique  
node scripts/build.js 20250905 20250907

# Tests individuels
node scripts/events.js 20250905    # Événements sportifs (web scraping)
node scripts/epg.js 20250905       # Programmes TV
node scripts/merge.js 20250905     # Fusion événements ↔ EPG
```

> **🔄 Système glissant** : Le pipeline maintient automatiquement **7 jours de données** en supprimant les fichiers anciens à chaque exécution.

## 📊 Roadmap

### ✅ Opérationnel
- **Cron quotidien** : Automatisation GitHub Actions 1h UTC
- **Multi-sports** : F1, Football, Rugby avec correspondance EPG
- **Interface complète** : Onglet "Toutes" par défaut, filtres, navigation temporelle
- **Déploiement automatique** : GitHub Pages avec Service Worker
- **Responsive mobile** : Interface adaptative mobile/tablette/desktop avec optimisations touch

### 🔄 Priorité haute
- **Migration web scraping** : Finalisation des scrapers pour tous les sports (en cours)
- **PWA** : Mode hors-ligne, installation app

### 📋 À venir
- **Ajout de sources** : Configuration utilisateur personnalisée
- **Gestion favoris** : Préférences en dur puis migration Vercel
- **Interface admin** : Modification `userSettings.json`

## 🌐 Production

**URL** : https://benjaminbusselet.github.io/tv_sports/

Mise à jour automatique quotidienne à 1h UTC avec génération des données et déploiement.

## 🎨 Thème et Design

### Thème iOS 26 Minimaliste
- Design épuré inspiré d'iOS 26 avec effets de verre liquide (Liquid Glass)
- Mode clair/sombre natif avec transition fluide
- Interface fluide et réactive, optimisée pour mobile et desktop

### Variables CSS Globales
- **Couleurs** : Palette dynamique avec variables pour les thèmes clair/sombre
- **Typographie** : Police système native avec hiérarchie visuelle claire
- **Espacements** : Système cohérent basé sur des unités `rem`
- **Effets visuels** : Ombres portées, flous et transparences variables

### Effets Liquid Glass
- Surfaces translucides avec `backdrop-filter: blur()`
- Bordures subtiles avec effet de luminosité
- Ombres douces et naturelles
- Effets de survol et de focus subtils

### Typographie
- Police système native pour des performances optimales
- Hiérarchie claire avec variables de taille :
  - `--text-xs` (0.75rem) à `--text-2xl` (1.5rem)
  - Poids de police de 300 (light) à 700 (bold)

### Mise en Page
- Grille à 3 colonnes pour les cartes d'événements :
  1. Heure (colonne étroite)
  2. Informations du match (largeur principale)
  3. Diffuseur (colonne étroite)
- Cartes réduites à 80% de la largeur des barres latérales
- Espacement généreux pour une lecture aérée

### Interactions
- Effets de survol sur les cartes et boutons
- Transitions fluides pour les changements d'état
- Retours visuels au toucher
- Accessibilité optimisée (contraste, focus visible)

### Responsive Mobile
- **Breakpoints** :
  - Mobile : ≤767px
  - Tablette : 768px - 1023px
  - Desktop : ≥1024px
  - Petit mobile : ≤520px (ajustements spécifiques)
- **Grille adaptative** :
  - Desktop : 3 colonnes (heure, infos match, diffuseur)
  - Tablette : 2 colonnes pour les cartes
  - Mobile : 1 colonne, grille compacte `2.5rem 1fr 6rem`
- **Navigation jours** :
  - Desktop/Tablette : Chips horizontaux cliquables
  - Mobile : Select dropdown (max-width 280px)
- **Onglets sports** :
  - Mobile : Scroll horizontal avec `scroll-snap`, zones touch 44px min
  - Tablette : Espacement réduit (0.5rem)
  - Masquage scrollbar native (`scrollbar-width: none`)
- **Typographie responsive** :
  - Header mobile : 1.125rem (≤767px), 1rem (≤520px)
  - Cartes mobile : Titre 13px, diffuseur 10px, heure 11px
  - Ellipsis automatique sur titres longs
- **Optimisations touch** :
  - `-webkit-overflow-scrolling: touch` pour scroll fluide iOS
  - `min-height: 44px` sur tous les éléments interactifs
  - Padding augmenté sur petits écrans

---

*Configuration actuelle : usage personnel avec préférences en dur*
