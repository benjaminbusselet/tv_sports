# ROADMAP

## 1) Data pour le front (back/pipeline)

- Vérifier / compléter `teams.json` au fil de l’eau (aliases EPG).
- Ajuster la whitelist `channels.json` si besoin.
- Monitoring minimal : logs build (PROGS, aliases+).

## 2) Révision front

- Valider la **nomenclature** `progs_YYYYMMDD.json` côté fetch.
- Vérifier mapping des champs nécessaires (title, start/end, home/away, broadcasters, competition).
- Ajouter fallback visuel diffuseur (Ligue 1+, beIN samedi 17h, DAZN Serie A).
- Vérifier config fuseau (Europe/Paris) et tri.

## 3) Notifications

- Définir règles (par équipe, compétition, créneau).
- Générer un flux léger (JSON) “prochains matchs suivis”.
- Intégrer un service notif (e-mail/Push Web) côté front ou worker.

## 4) Hébergement (GitHub Pages)

- Publier `/public` (build artefacts) sur `gh-pages`.
- Vérifier chemins relatifs, cache HTTP (ETag/max-age court).

## 5) Cron en ligne

- Planifier build quotidien (CI GitHub Actions ou cron externe).
- Paramètres : `node scripts/build.js` (sans `--keep` en prod).
- Artefacts : ne committer que `progs_*.json` (+ cache EPG si utile).

## Futur

- Système d’ajout de source (UI/JSON) : compétitions/sports/équipes.
- Finalisation front (filtres, favoris, notifications, responsive).
