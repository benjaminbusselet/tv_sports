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

- [x] Droits TV mis à jour : Ligue 1 → `Ligue 1+` uniquement, LaLiga → `Disney+` (`icsSources.json`, `channels.json`), retrait du cas spécial codé en dur "Ligue 1 samedi 17h → beIN SPORTS 1" dans `merge.js`.
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
  - Ajouté : Champions League, Europa League, Coupe de France, Coupe de la Ligue, Copa del Rey (foot) ; Top 14, Pro D2, Champions Cup, Tournoi des 6 Nations, Summer Nations Series, Autumn Nations Series (rugby) — toutes vérifiées fonctionnelles (HTTP 200) avant intégration.
  - `team_france_football`/`team_espagne` **gardés tels quels** : aucun flux compétition équivalent trouvé sur `ics.fixtur.es` (`friendlies`, `euro-qualifiers`, `world-cup` → tous 404), migrer aurait créé un trou de couverture (amicaux, qualifs Euro, phase finale).
  - `teams.json` : section `Rugby` unique restructurée en sections par compétition (`Top 14`, `Champions Cup`, `Tournoi des 6 Nations`, `Summer Nations Series`, `Autumn Nations Series`) — cohérent avec le fait que ces flux n'ont pas de tag `[...]` dans leurs titres, donc `ev.competition` est déjà le nom exact de la source.
  - `merge.js` : suppression du hack codé en dur qui forçait `comp = "Rugby"`/`"Ligue 1"` pour Toulouse — devenu inutile (et faux, écrasait le vrai nom de compétition) puisque les nouvelles sources fournissent déjà la bonne compétition nativement.
  - Testé en réel : `build.js` sur 3 jours (19 sources, aucune erreur), matching des favoris (OM/Barcelona) toujours fonctionnel via les flux championnat existants. `npm test` (11/11), `npm run lint` (0 erreur).
- [x] `src/services/sources.js` supprimé (non importé nulle part, et cassé de toute façon : filtrait sur `source.enabled`, un champ qui n'existe pas dans `icsSources.json` — l'activation se fait via `userSettings.json`).
