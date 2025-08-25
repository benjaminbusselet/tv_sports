# PROJET

## Objectif

Générer chaque jour un fichier unique `progs_YYYYMMDD.json` fusionnant :

- Événements sportifs (ICS Fixtur.es).
- Diffusions TV (EPG Open-EPG).
  Ce fichier alimente directement le front.

## Sources

- **ICS (Fixtur.es)** : compétitions officielles.
- **EPG (Open-EPG)** : programmes J-2 → J+2.
- **teams.json** : dictionnaire équipes ICS + alias EPG (enrichi auto).

## Fichiers (`public/data`)

- `ics_YYYYMMDD.json` : matchs ICS.
- `epg_YYYYMMDD.json` : programmes filtrés.
- `progs_YYYYMMDD.json` : fusion finale.
- `epg-raw_france1.xml` : cache brut (2h).

## Règles de fusion

- Match ICS↔EPG : tolérance ±60 min.
- Alias EPG résolus via `teams.json`.
- Diffuseurs par défaut :
  - Ligue 1 : `Ligue 1+` (sauf samedi 17h → `beIN SPORTS 1`).
  - Serie A : `DAZN`.
  - PL / Bundesliga / LaLiga : pas de défaut (broadcasters vides si absent).

## Pipeline (`build.js`)

1. `ics.js` → export.
2. `epg.js` → uniquement J-2 → J+2 (cache unique).
3. `checkTeams.js` → enrichit `teams.json`.
4. `merge.js` → génère `progs_YYYYMMDD.json`.
5. Purge automatique : fenêtre glissante T→T+7.

## Utilisation

```bash
node scripts/build.js [YYYYMMDD] --keep
```

- Avec --keep : conserve ics*/epg*.
- Sans --keep : seuls les 8 progs\_ T→T+7 persistent.
