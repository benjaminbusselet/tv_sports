# INSTRUCTIONS DE DÉVELOPPEMENT

## Réponses attendues

- Concis, explicite, factuel
- Ne rien inventer - Pas de code avant validation d'approche
- Code demandé : fournir le **fichier complet**

## Formats & conventions

- **Date unique :** YYYYMMDD (jamais de tirets)
- **Fichiers data :** `public/data/` → `ics_*`, `epg_*`, `progs_*`

## Règles métier

- **ICS (Fixtur.es) :** source de vérité
- **EPG (Open-EPG) :** fenêtre J-2→J+2, cache 2h, quota 302→réutilise
- **teams.json :** clés ICS, alias auto (append-only)
- **Fusion :** tolérance ±60min via teams.json
  - Ligue 1 : `Ligue 1+` (sauf sam 17h → `beIN SPORTS 1`)
  - Serie A : `DAZN`
  - PL/Bundesliga/LaLiga : pas de défaut
- **Pipeline :** ICS → EPG → checkTeams → merge → purge T→T+7

## Commande

node scripts/build.js YYYYMMDD –keep

`--keep` conserve fichiers intermédiaires | sans `--keep` garde 8 progs\_ seulement

---

_Guidelines pour maintenir cohérence et qualité du projet_
