# Agrégateur de Programmes TV Sportifs

> **Agrégation quotidienne### 🔧 À faire - Priorité haute
- [ ] **Automatisation** : Cron quotidien en production
- [ ] **PWA** : Mode hors-ligne, installation app

### 📊 À faire - Expérience utilisateur
- [ ] **Gestion favoris** : Stockage local des préférences
- [ ] **Notifications push** : Règles par équipe/compétition
- [ ] **Filtres avancés** : Statistiques et analytics

### ⚙️ À faire - Infrastructure
- [ ] **Monitoring** : Logs et alertes de pipeline
- [ ] **Cache optimisé** : Stratégie cache HTTP
- [ ] **Sports additionnels** : Basket, tennis, etc.
- [ ] **Interface admin** : Ajout/suppression sources
- [ ] **API publique** : Documentation et endpointsévénements sportifs et de diffusions TV en flux de données unifié**

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

**Sports supportés :** Football ⚽, F1 🏎️, Rugby 🏉

**Appariement intelligent :**

- Corrélation ICS ↔ EPG avec tolérance ±60min
- Résolution intelligente des alias d'équipes (Toulouse → Stade Toulousain)
- Diffuseurs par défaut si EPG vide (TF1, Canal+, beIN Sports, DAZN)

**Pipeline (`build.js`) - Architecture en mémoire :**

1. Extraction événements sportifs (objet en mémoire)
2. Récupération programmes TV (objet en mémoire)
3. Fusion intelligente des données (passage d'objets)
4. Auto-enrichissement correspondances équipes
5. Génération finale → `progs_YYYYMMDD.json`
6. Purge automatique (fenêtre glissante T→T+7)

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
