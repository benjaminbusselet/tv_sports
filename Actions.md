# Actions à effectuer

Issu de l'audit du 2026-08-30.

## Nettoyage code

- [ ] Supprimer `src/services/sources.js` (non importé nulle part) ou l'intégrer si prévu pour un usage futur.
- [ ] Envisager de découper `src/App.jsx` (état + logique de tri/filtre concentrés dans un seul composant de 150 lignes) si le composant continue de grossir.
- [ ] Logique de date Europe/Paris (`fmtParis`/`ymdParis`/`addDaysYMD`) dupliquée 4 fois : bloc identique copié-collé entre `build.js` et `dev-check.js`, et réimplémentation différente (locale `fr-FR` + split) dans `epg.js`/`ics.js`. À extraire dans un module partagé (ex. `scripts/lib/dates.js`).
- [ ] Double source de vérité sur les alias "Stade Toulousain" : `merge.js` (lignes ~76 et ~79) hardcode `["stade toulousain", "toulouse", "toulouse rugby"]` pour deviner la compétition, alors que `teams.json` a déjà la liste d'alias officielle. Risque de désync silencieuse (même catégorie de bug que celui corrigé sur France Rugby).
- [ ] `translations.json` référencé dans `merge.js` (`countries`/`cities`/`teams`) mais le fichier n'existe pas dans `public/config/` — dégradation silencieuse actuellement (pas cassé), mais fonctionnalité fantôme à clarifier (implémenter ou retirer la référence).

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
