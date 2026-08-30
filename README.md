# TV Sports

Agrégateur personnel de programmes sportifs TV. Combine des calendriers ICS (football, rugby, F1) avec les grilles EPG pour afficher les matchs et leurs diffuseurs sur 7 jours.

Déployé sur [GitHub Pages](https://benjaminbusselet.github.io/tv_sports/) — mise à jour automatique quotidienne à 1h UTC.

## Stack

- **Frontend** : React 19 + Vite 7, Tailwind CSS, Service Worker basique (pas encore de mode hors-ligne, voir Roadmap)
- **Pipeline** : Node.js — sources ICS + EPG → JSON fusionnés
- **CI/CD** : GitHub Actions (build + deploy quotidien)

## Installation

```bash
npm install
npm run dev
```

## Pipeline de données

```bash
# Générer aujourd'hui → +7 jours
node scripts/build.js

# Période spécifique
node scripts/build.js 20260510 20260517

# Debug par script
node scripts/ics.js 20260510    # événements ICS
node scripts/epg.js 20260510    # grille TV
node scripts/merge.js 20260510  # fusion
```

Les fichiers générés (`public/data/progs_YYYYMMDD.json`) sont conservés sur une fenêtre glissante de 7 jours.

## Sources de données

Configurées dans `public/config/` :

- `icsSources.json` — sources ICS activées + diffuseurs par défaut
- `userSettings.json` — préférences personnelles (onglet par défaut, équipes favorites)
- `teams.json` — normalisation des noms d'équipes
- `channels.json` — correspondance chaînes EPG

## Déploiement

GitHub Actions lance `node scripts/build.js` puis `vite build` chaque nuit à 1h UTC et publie `dist/` via le déploiement natif GitHub Pages (`actions/upload-pages-artifact` + `actions/deploy-pages`, sans branche `gh-pages`).

## Roadmap

- [ ] Migration vers le web scraping (remplacer les sources ICS)
- [ ] Mode hors-ligne complet (PWA)
- [ ] Interface de configuration utilisateur
