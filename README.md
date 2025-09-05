# TV Sports - Agrégateur de Programmes Sportifs

> **🚀 Application web qui agrège quotidiennement événements sportifs et diffusions TV**

[![Déploiement](https://img.shields.io/badge/d%C3%A9ploy%C3%A9-GitHub%20Pages-success)](https://benjaminbusselet.github.io/tv_sports/)
[![Build Status](https://img.shields.io/badge/build-passing-success)]()
[![Daily Updates](https://img.shields.io/badge/mises%20%C3%A0%20jour-quotidiennes%201h%20UTC-blue)]()

## 🎯 Vue d'ensemble

TV Sports génère quotidiennement des fichiers JSON unifiés (`progs_YYYYMMDD.json`) qui combinent :

- **📅 Événements sportifs** issus de calendriers ICS officiels
- **📺 Programmes TV** des diffuseurs via EPG
- **🤖 Correspondance intelligente** avec tolérance temporelle

**Interface moderne** : React + Vite, responsive, PWA-ready

## 🏗️ Architecture

### Sources de données
- **🏎️ F1 & ⚽ Football** : Fixtur.es (calendriers ICS officiels)  
- **🏉 Rugby** : tv-sports.fr (Top 14, Champions Cup, etc.)
- **📺 EPG** : Open-EPG (grilles TV, fenêtre J-2 à J+2)
- **👥 Équipes** : `config/teams.json` (normalisation des noms)

### Sports supportés
- **Formule 1** 🏎️ : Tous les GP, qualifications, essais
- **Football** ⚽ : Ligue 1, Champions League, etc.  
- **Rugby** 🏉 : Top 14, Champions Cup, Pro D2

### Interface utilisateur
- **🔀 Onglet "Toutes"** : Vue chronologique mixte (par défaut)
- **🎯 Filtres par sport** : F1, Football, Rugby, Équipes favorites
- **📅 Navigation temporelle** : Frise 7 jours avec compteurs
- **⚡ Tri intelligent** : Par ligue (football) ou horaire (mixte)

## 🚀 Stack Technique

- **Backend** : Node.js, architecture pipeline en mémoire
- **Frontend** : React + Vite, CSS moderne, Service Worker
- **Données** : JSON, XML parsing, cache HTTP
- **Déploiement** : GitHub Pages + Actions (CI/CD quotidien)
- **PWA** : Manifest, notifications push, mode hors-ligne

## 💻 Développement

### Installation
```bash
npm install
```

### Scripts principaux
```bash
# 🔄 Génération complète (défaut: aujourd'hui → +7 jours)
node scripts/build.js

# 📅 Période spécifique  
node scripts/build.js 20250905 20250907

# 🧪 Tests individuels
node scripts/ics.js 20250905    # Événements sportifs
node scripts/epg.js 20250905    # Programmes TV
node scripts/merge.js 20250905  # Fusion ICS ↔ EPG

# 🖥️ Développement local
npm run dev                     # Frontend + backend
npm run dev:front              # Frontend seul (Vite)
npm run dev:server             # Backend seul (Express)
```

## 📊 Fonctionnalités

### ✅ Implémenté
- ✅ Pipeline de données ICS/EPG fonctionnel
- ✅ Interface React responsive avec filtres
- ✅ **Onglet "Toutes" par défaut** (vue chronologique mixte)
- ✅ Support F1, Football, Rugby complet
- ✅ Correspondance intelligente ICS ↔ EPG (±60min)
- ✅ Déploiement automatique GitHub Pages quotidien
- ✅ Service Worker et PWA-ready
- ✅ Navigation temporelle (frise 7 jours)
- ✅ Tri intelligent par sport ou chronologique

### 🔄 En cours
- 🔄 Optimisation cache et performance
- 🔄 Notifications push personnalisées

### 📋 À venir
- 📋 Sports additionnels (Tennis, Basket)
- 📋 Gestion favoris avec LocalStorage
- 📋 Interface admin (ajout sources)

## 🌐 Déploiement

**URL Production :** https://benjaminbusselet.github.io/tv_sports/
- **Mise à jour** : Quotidienne à 1h UTC via GitHub Actions
- **Build automatique** : Pipeline → Build → Déploiement

---

**🚀 Application déployée :** https://benjaminbusselet.github.io/tv_sports/

_Pipeline de données optimisé au service d'une expérience utilisateur moderne._

## 🚀 Stack Technique

- **Backend :** Node.js, architecture modulaire en mémoire
- **Frontend :** React + Vite, design responsive
- **Données :** JSON, parsing XML, stratégie de cache
- **Déploiement :** GitHub Pages + Actions

## 💻 Utilisation

```bash
# Build complet (par défaut: aujourd'hui → +7 jours)
node scripts/build.js

# Build pour période spécifique
node scripts/build.js 20250905 20250907

# Tests individuels
node scripts/ics.js 20250905    # Événements sportifs
node scripts/epg.js 20250905    # Programmes TV
```

## ✅ Status & TODO

### Terminé
- **Backend** : Pipeline en mémoire, fusion ICS/EPG, règles métier
- **Frontend** : Interface React responsive, navigation temporelle, filtres
- **Déploiement** : GitHub Pages + CI/CD automatisé

### � À faire - Priorité haute
- [ ] **Automatisation** : Cron quotidien en production
- [ ] **Sports additionnels** : Basket, tennis, etc.
- [ ] **PWA** : Mode hors-ligne, installation app

### 📊 À faire - Expérience utilisateur
- [ ] **Gestion favoris** : Stockage local des préférences
- [ ] **Notifications push** : Règles par équipe/compétition
- [ ] **Filtres avancés** : Statistiques et analytics

### ⚙️ À faire - Infrastructure
- [ ] **Monitoring** : Logs et alertes de pipeline
- [ ] **Cache optimisé** : Stratégie cache HTTP
- [ ] **Interface admin** : Ajout/suppression sources
- [ ] **API publique** : Documentation et endpoints

---

_Pipeline de données optimisé en mémoire au service d'un frontend moderne pour découvrir facilement les programmes sportifs._
