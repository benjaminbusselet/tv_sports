# Instructions pour TV Sports

## 📋 Vue d'ensemble

#

# ⚡️ Exigences prioritaires

#

# - Le code doit être le plus concis et compréhensible possible.

# - Aucune supposition : seules les instructions explicites de l'utilisateur sont suivies.

# - Pas de compassion, pas d'émotion : réponses neutres et factuelles.

#

TV Sports est une application qui agrège automatiquement des événements sportifs et des diffusions TV en un flux de données unifié. Le système génère quotidiennement des fichiers JSON (`progs_YYYYMMDD.json`) qui combinent des événements sportifs issus de calendriers ICS avec les grilles de programmes TV des diffuseurs (EPG).

## 🏗️ Architecture

Le projet est structuré en deux parties principales :

### Backend (Node.js)

- **Pipeline de données** (`scripts/build.js`) : Orchestre tout le processus de génération des données
  - **ICS** (`scripts/ics.js`) : Récupère et traite les événements sportifs depuis Fixtur.es
  - **EPG** (`scripts/epg.js`) : Récupère et traite les programmes TV depuis Open-EPG
  - **Merge** (`scripts/merge.js`) : Fusionne les données ICS et EPG avec correspondance intelligente

### Frontend (React + Vite)

- Interface utilisateur responsive pour afficher les événements sportifs et leurs diffuseurs
- Filtrage par sport, date et équipes

## 🔑 Concepts clés

1. **Flux de données en mémoire** : Les données transitent d'un script à l'autre en mémoire (pattern pipe)
2. **Correspondance ICS ↔ EPG** :
   - Pour les sports d'équipe : matching des équipes avec tolérance temporelle ±60min
   - Pour la F1 et sports individuels : matching par titre et horaire (code spécifique dans `merge.js`)
3. **Normalisation des équipes** : Utilisation de `config/teams.json` pour résoudre les différentes orthographes

## 🛠️ Workflows développeur

```bash
# Build complet pour une plage de dates (par défaut: aujourd'hui → +7 jours)
node scripts/build.js [YYYYMMDD_start] [YYYYMMDD_end]

# Build pour un jour spécifique uniquement
node scripts/build.js 20250905 20250905

# Tests individuels des composants
node scripts/ics.js 20250905    # Extraire événements ICS
node scripts/epg.js 20250905    # Extraire programmes EPG
node scripts/merge.js 20250905  # Fusionner données (avec fichiers existants)

# Serveur de développement
npm run dev
```

## ⚠️ Points d'attention importants

1. **Limitation EPG** : Les données EPG ne sont disponibles que pour une fenêtre J-2 à J+2
2. **Gestion de la F1** : Cas spécial dans `merge.js` avec logique dédiée pour capturer tous les diffuseurs
3. **Format de sortie** : Le format final `progs_YYYYMMDD.json` contient les diffuseurs dans un tableau `broadcasters`

## 📁 Fichiers clés

- `config/icsSources.json` : Configuration des sources de calendriers sportifs
- `config/teams.json` : Dictionnaire des équipes et leurs alias
- `config/channels.json` : Mapping des chaînes et leurs variantes
- `public/data/progs_*.json` : Fichiers générés contenant les événements et leurs diffuseurs

## 🧪 Exemples concrets

```javascript
// Exemple d'événement football dans progs_YYYYMMDD.json
{
  "uid": "20250906-PSG-Lille-Ligue-1",
  "title": "PSG vs Lille",
  "start": "2025-09-06T19:00:00Z",
  "end": "2025-09-06T21:00:00Z",
  "sport": "football",
  "competition": "Ligue 1",
  "home": "Paris Saint-Germain",
  "away": "Lille",
  "broadcasters": ["Canal+", "Ligue 1+"]
}

// Exemple d'événement F1 avec multiples diffuseurs
{
  "uid": "20250906-Italian-GP-Qualifying",
  "title": "Italian GP Qualifying",
  "start": "2025-09-06T14:00:00Z",
  "end": "2025-09-06T15:00:00Z",
  "sport": "f1",
  "competition": "Formule 1",
  "home": "",
  "away": "",
  "broadcasters": ["Canal+ Sport", "Canal+ Live 1"]
}
```
