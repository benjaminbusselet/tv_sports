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
- **🏎️ F1 & ⚽ Football** : Fixtur.es (calendriers ICS officiels)  
- **🏉 Rugby** : tv-sports.fr (Top 14, Champions Cup, Équipe de France)
- **📺 EPG** : Open-EPG (grilles TV, fenêtre J-2 à J+2)
- **👥 Équipes** : `config/teams.json` (normalisation des noms)
- **⚙️ Configuration** : `icsSources.json` (sources disponibles) + `userSettings.json` (préférences personnelles)

### Stack technique
- **Backend** : Node.js, pipeline en mémoire, parsing XML
- **Frontend** : React + Vite, CSS moderne, Service Worker
- **Déploiement** : GitHub Pages + Actions (CI/CD quotidien 1h UTC)

## 💻 Développement

### Installation et démarrage
```bash
npm install
npm run dev    # Frontend + backend local
```

### Scripts de données
```bash
# Génération complète (défaut: aujourd'hui → +7 jours)
node scripts/build.js

# Période spécifique  
node scripts/build.js 20250905 20250907

# Tests individuels
node scripts/ics.js 20250905    # Événements sportifs
node scripts/epg.js 20250905    # Programmes TV
node scripts/merge.js 20250905  # Fusion ICS ↔ EPG
```

## 📊 Roadmap

### ✅ Opérationnel
- **Cron quotidien** : Automatisation GitHub Actions 1h UTC
- **Multi-sports** : F1, Football, Rugby avec correspondance EPG
- **Interface complète** : Onglet "Toutes" par défaut, filtres, navigation temporelle
- **Déploiement automatique** : GitHub Pages avec Service Worker

### 🔄 Priorité haute
- **PWA** : Mode hors-ligne, installation app
- **Notifications push** : Système basé sur `userSettings.json`

### 📋 À venir
- **Ajout de sources** : Configuration utilisateur personnalisée
- **Gestion favoris** : Préférences en dur puis migration Vercel
- **Interface admin** : Modification `userSettings.json`

## 🌐 Production

**URL** : https://benjaminbusselet.github.io/tv_sports/

Mise à jour automatique quotidienne à 1h UTC avec génération des données et déploiement.

---

*Configuration actuelle : usage personnel avec préférences en dur*
