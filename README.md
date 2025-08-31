# Agrégateur de Programmes TV Sportifs

> **Agrégation quotidienne automatisée d'événements sportifs et de diffusions TV en flux de données unifié**

## 🎯 Objectif

Génère quotidiennement des fichiers JSON (`progs_YYYYMMDD.json`) fusionnant :

- **Événements sportifs** issus de compétitions officielles (ICS Fixtur.es)
- **Grilles TV** des diffuseurs EPG (Open-EPG)

Le résultat : une source de données propre et unifiée alimentant une interface React responsive.

## 🏗️ Architecture

**Sources de données :**

- **ICS (Fixtur.es) :** Compétitions sportives officielles
- **EPG (Open-EPG) :** Données programmes TV (fenêtre J-2 à J+2)
- **teams.json :** Dictionnaire de correspondances équipes auto-enrichi

**Appariement intelligent :**

- Corrélation ICS ↔ EPG avec tolérance ±60min
- Résolution intelligente des alias d'équipes
- Règles de diffuseurs par défaut (Ligue 1+, beIN SPORTS, DAZN)

**Pipeline (`build.js`) :**

1. Extraction événements sportifs → `ics_YYYYMMDD.json`
2. Récupération programmes TV → `epg_YYYYMMDD.json`
3. Auto-enrichissement correspondances équipes → `teams.json`
4. Fusion & génération → `progs_YYYYMMDD.json`
5. Purge automatique (fenêtre glissante T→T+7)

## 🚀 Stack Technique

- **Backend :** Node.js, architecture modulaire
- **Frontend :** React + Vite, design responsive
- **Données :** JSON, parsing XML, stratégie de cache
- **Déploiement :** GitHub Pages + Actions

## 💻 Utilisation

node scripts/build.js YYYYMMDD –keep

**--keep :** conserve les fichiers intermédiaires | **sans :** garde seulement les 8 fichiers progs finaux

---

_Une architecture de données propre au service d'un frontend moderne pour découvrir facilement les programmes sportifs._
