# Actions à effectuer

Issu de l'audit du 2026-08-30.

## Nettoyage code

- [ ] Envisager de découper `src/App.jsx` (état + logique de tri/filtre concentrés dans un seul composant de 150 lignes) si le composant continue de grossir.
- [ ] Logique de date Europe/Paris (`fmtParis`/`ymdParis`/`addDaysYMD`) dupliquée 4 fois : bloc identique copié-collé entre `build.js` et `dev-check.js`, et réimplémentation différente (locale `fr-FR` + split) dans `epg.js`/`ics.js`. À extraire dans un module partagé (ex. `scripts/lib/dates.js`).

## Améliorations futures

- [ ] `favorites.competitions` (`userSettings.json`, ex. `["Formule 1", "Top 14", "Ligue 1"]`) existe dans la config mais n'a aucun effet dans le code actuellement — décision prise de ne pas le supprimer, en garder l'usage pour plus tard (onglet/filtre "toute une compétition favorite", en plus du filtre par équipe existant).

---

# Actions effectuées

## Outillage qualité

- [x] ESLint réparé : `eslint.config.js` (flat config ESLint 9) remplace `.eslintrc.json` cassé, `eslint-plugin-react` ajouté (nécessaire pour la détection JSX), scripts `"lint"`/`"lint:js"` ajoutés. 3 vrais problèmes trouvés et corrigés au passage (variable morte, 2 `catch {}` volontaires reconfigurés proprement).
- [x] Stylelint réparé : `.stylelintrc.json` ajouté (`stylelint-config-standard` + `config-prettier`), overrides alignés sur les conventions existantes du projet plutôt que réécriture du CSS. 2 vrais problèmes corrigés (`.sectionTitle` → `.section-title`, déclarations multi-props éclatées). Script `"lint:css"` ajouté, `"lint"` enchaîne JS + CSS.
- [x] Tests mis en place (Vitest) sur le pipeline data : `epg.test.js`, `ics.test.js`, `merge.test.js` (11 tests), ciblés sur les fonctions déjà responsables de bugs réels (`looksLikeLimitPage`, `extractTeams`, résolution d'alias/cross-check dans `mergeData`). Étape `npm test` ajoutée dans `deploy.yml` avant le build, pour bloquer le déploiement en cas de régression.

## Bugs

- [x] Onglet Équipes (`sport === "teams"`) : matchs manquants car `favorites.teams` devait correspondre exactement à la clé canonique dans `teams.json`, or une même équipe a des clés différentes selon sport/compétition (ex. `"France"` football vs `"France Rugby"`).
  - Corrigé : `favorites.teams` (userSettings.json) restructuré en objets `{sport, name}`, matching mis à jour dans `src/services/api.js` (filtre sur `sport` + `homeId`/`awayId`). Testé sur données réelles : les 5 favoris (OM, FC Barcelona, Stade Toulousain, France football, France Rugby) matchent correctement.
  - Espagne : clé `teams.json` renommée `"Spain"` → `"Espagne"` (aliases `["Spain", "España"]`) pour cohérence, même si non utilisée dans les favoris actuels.

## EPG / Diffuseurs

- [x] Droits TV mis à jour : Ligue 1 → `Ligue 1+` uniquement, LaLiga → `Disney+` (`icsSources.json`, `channels.json`), retrait du cas spécial codé en dur "Ligue 1 samedi 17h → beIN SPORTS 1" dans `merge.js`. *(⚠️ LaLiga re-changé depuis, voir section "Droits TV 2026-2027" plus bas.)*
- [x] Gaspillage de quota Open-EPG : `build.js` retéléchargeait le même XML une fois par jour traité (3 requêtes identiques par run). Corrigé : `fetchEpgAll()` télécharge une fois, `filterEpgByDay()` filtre en mémoire par jour.
- [x] Cache CI ajouté (`actions/cache` sur `epg-raw_france1.xml` dans `deploy.yml`) pour retomber sur un cache réel en cas de blocage Open-EPG.
- [x] Faux positif critique dans `looksLikeLimitPage()` (`epg.js`) : `!/]/i.test(txt)` était vrai sur **tout** XML EPG valide (le format n'utilise jamais `]`), donc chaque téléchargement réussi était pris à tort pour un blocage de quota — depuis toujours. Remplacé par un test de forme XML (`startsWith("<?xml")`). Vérifié en prod : cross-check EPG réel fonctionnel (diffuseurs précis type "Canal+ Live 1" au lieu des fallbacks génériques).

## Git / repo

- [x] `git pull` effectué, branche à jour.
- [x] `CLAUDE.md` retiré du suivi git (instructions personnelles, ajouté au `.gitignore`). `teams.json` et `userSettings.json` commités avec le fix de l'onglet Équipes.

## Documentation

- [x] `NOTES.md` supprimé (journal de migration périmé, historique conservé dans git).
- [x] `README.md` corrigé : Stack (CSS natif → Tailwind, PWA → service worker basique sans offline réel) et Déploiement (gh-pages branch → déploiement natif GitHub Pages via `deploy-pages`).

## Nettoyage code

- [x] `translations.json` : décision prise de ne pas implémenter (pas de traduction prévue). Code mort retiré de `merge.js` (lecture du fichier, fusion `countries`/`cities`/`teams`, indirection `allTranslations[...]`) — `homeOfficial`/`awayOfficial` utilisent directement le nom résolu par `teams.json`.
- [x] Sources ICS par équipe remplacées par des flux compétition (foot : Barcelona/OM cassés en 404 silencieux — `ics.js` ne vérifiait jamais le code HTTP ; rugby : Stade Toulousain/France Rugby fonctionnaient mais restaient hardcodés).
  - Retiré : `team_barcelone`, `team_om`, `team_toulouse_rugby`, `team_france_rugby` (`icsSources.json`, `userSettings.json`).
  - Ajouté : Champions League, Europa League, Coupe de France, Coupe de la Ligue, Copa del Rey (foot) ; Top 14, Pro D2, Champions Cup, Tournoi des 6 Nations, Summer Nations Series, Autumn Nations Series (rugby) — toutes vérifiées fonctionnelles (HTTP 200) avant intégration. *(⚠️ Coupe de la Ligue retirée depuis, voir section "Droits TV 2026-2027" plus bas.)*
  - `team_france_football`/`team_espagne` **gardés tels quels** : aucun flux compétition équivalent trouvé sur `ics.fixtur.es` (`friendlies`, `euro-qualifiers`, `world-cup` → tous 404), migrer aurait créé un trou de couverture (amicaux, qualifs Euro, phase finale). *(⚠️ Les deux retirés depuis, voir section "Droits TV 2026-2027" plus bas.)*
  - `teams.json` : section `Rugby` unique restructurée en sections par compétition (`Top 14`, `Champions Cup`, `Tournoi des 6 Nations`, `Summer Nations Series`, `Autumn Nations Series`) — cohérent avec le fait que ces flux n'ont pas de tag `[...]` dans leurs titres, donc `ev.competition` est déjà le nom exact de la source.
  - `merge.js` : suppression du hack codé en dur qui forçait `comp = "Rugby"`/`"Ligue 1"` pour Toulouse — devenu inutile (et faux, écrasait le vrai nom de compétition) puisque les nouvelles sources fournissent déjà la bonne compétition nativement.
  - Testé en réel : `build.js` sur 3 jours (19 sources, aucune erreur), matching des favoris (OM/Barcelona) toujours fonctionnel via les flux championnat existants. `npm test` (11/11), `npm run lint` (0 erreur).
- [x] `src/services/sources.js` supprimé (non importé nulle part, et cassé de toute façon : filtrait sur `source.enabled`, un champ qui n'existe pas dans `icsSources.json` — l'activation se fait via `userSettings.json`).

## Droits TV 2026-2027 & sources (2026-08-30, suite)

- [x] Droits TV 2026-2027 revérifiés par compétition (recherche web, saison qui démarre) :
  - LaLiga : `Disney+` seul → **`DAZN` + `Disney+`** (co-exclusivité dès août 2026, beIN perd les droits après 14 saisons).
  - Europa League : `beIN Sports` → **`Canal+`** (répartition Canal+/beIN sur les coupes UEFA n'existe plus depuis l'appel d'offres 2024).
  - Copa del Rey : `beIN Sports` → **`DAZN`** (nouveau diffuseur exclusif, 4 saisons).
  - Champions Cup (rugby) : `Canal+` → **`beIN Sports`** (le réel détenteur des droits ; accessible via le bundle Canal+ Sport mais label diffuseur = beIN, cohérent avec Bundesliga/Coupe de France).
  - Summer/Autumn Nations Series (rugby) : `France 2` → **`TF1`** (accord TF1 Group 2026-2029 sur le rugby international hors Tournoi des 6 Nations).
  - Inchangés (vérifiés) : F1 → Canal+, Ligue 1 → Ligue 1+, Premier League/Champions League → Canal+, Serie A → DAZN, Bundesliga → beIN Sports, Six Nations → France 2, Top 14/Pro D2 → Canal+.
  - Toutes les URLs ICS re-testées (HTTP 200).
- [x] **`football_coupe_de_la_ligue` supprimé** (`icsSources.json`, `userSettings.json`) : la compétition est dissoute en France depuis la saison 2019-2020, plus aucun diffuseur possible, flux devenu obsolète.
- [x] Champ **`notifications` supprimé** (19 blocs `icsSources.json` + bloc top-level `userSettings.json`) : `grep` sur tout le repo → 0 usage dans le code, jamais implémenté. `defaultBroadcasters` conservé (fallback réel utilisé dans `merge.js`, `src?.defaultBroadcasters?.[0]`).
- [x] `team_espagne` supprimé (`ics.fixtur.es/v2/es.ics`) : pas de favori associé, source jugée non essentielle.
- [x] `team_france_football` (`fr.ics`) supprimé puis remplacé par deux flux compétition globaux découverts via un token d'accès fixtur.es (`nations-league.ics`, `world-cup-qualifiers.ics` → 404 sans token, 200 avec) :
  - Ajouté : `football_nations_league` ("Ligue des Nations"), `football_world_cup_qualifiers` ("Éliminatoires Coupe du Monde") — défaut `L'Equipe` (matchs France en intégralité sur TF1, le reste sur L'Equipe ; cross-check EPG corrige au cas par cas).
  - Risque de doublon identifié et évité : `fr.ics` incluait déjà les matchs France de ces deux compétitions sans tag `[...]`, donc `competition` retombait sur `source.name = "France"` (`ics.js` → `norm()`) ; avec les nouveaux flux globaux, ces mêmes matchs auraient été comptés deux fois (dédoublonnage `ics.js` basé sur `competition+home+away+start`, donc labels différents = pas fusionné). Résolu en retirant `fr.ics` plutôt qu'en le faisant cohabiter.
  - Trou de couverture assumé (décision utilisateur) : amicaux, qualifs Euro et phase finale Coupe du Monde de l'équipe de France ne sont plus alimentés (aucun flux équivalent trouvé sur `ics.fixtur.es`, même avec le token — `friendlies`, `euro-qualifiers`, `world-cup` restent en 404).
  - Favori "France" (foot, `userSettings.json`) conservé : le matching se fait par nom d'équipe résolu (`homeId`/`awayId`), indépendamment de la source, donc toujours fonctionnel sur les compétitions restantes.
  - Vérifié en réel : `node scripts/ics.js 20261002` → `France - Italy (Ligue des Nations)` présent, sans doublon.
- [x] Total sources : **18** (`icsSources.json`). Tests (`npm test`, 11/11) et lint (`npm run lint`) verts après chaque étape.
