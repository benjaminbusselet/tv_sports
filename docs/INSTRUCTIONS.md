# INSTRUCTIONS

## Réponses attendues

- Concis, explicite, factuel.
- Ne rien inventer. Pas de code avant validation d’approche.
- Quand code demandé : fournir le **fichier complet**.

## Formats & fichiers

- Date unique : **YYYYMMDD** (jamais de tirets).
- `public/data` :
  - `ics_YYYYMMDD.json`
  - `epg_YYYYMMDD.json`
  - `progs_YYYYMMDD.json`

## Règles projet

- **ICS** : Fixtur.es = source de vérité.
- **EPG** : Open-EPG, fenêtre **J-2 → J+2**.
  - Cache brut : `epg-raw_france1.xml` (2h). 1 téléchargement/run.
  - Si quota (302/limit), on réutilise le cache existant, sinon EPG vide pour le jour.
- **teams.json** : clés ICS, alias ajoutés auto (append-only, jamais manuel).
- **merge** : tolérance ±60min, alias via `teams.json`.
  - Ligue 1 : défaut `Ligue 1+`, sauf samedi 17:00 (Europe/Paris) → `beIN SPORTS 1`.
  - Serie A : défaut `DAZN`.
  - PL / Bundesliga / LaLiga : pas de défaut.
- **build.js** : pipeline unique (ICS → EPG → checkTeams → merge), purge fenêtre **T→T+7**.
- Commande :
  ```bash
  node scripts/build.js [YYYYMMDD] --keep
  ```
  --keep conserve ics*/epg* ; sans --keep, seuls les 8 progs\_ restent.
