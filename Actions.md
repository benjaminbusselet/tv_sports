# Actions à effectuer

Issu de l'audit du 2026-08-30.

## Outillage qualité

- [ ] Réparer la config ESLint : soit installer les packages manquants (`eslint-plugin-react`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-prettier`, `eslint-config-prettier`), soit migrer vers un `eslint.config.js` (flat config) adapté à ESLint 9 et alléger les plugins réellement nécessaires (pas de TypeScript dans le projet).
- [ ] Ajouter un script `"lint"` dans `package.json` une fois la config valide.
- [ ] Ajouter une config Stylelint (`.stylelintrc.json`) ou retirer les dépendances `stylelint*` si non utilisées.
- [ ] Mettre en place des tests, au minimum sur le pipeline data (`scripts/ics.js`, `scripts/epg.js`, `scripts/merge.js`) qui font du parsing/normalisation sans filet.

## Bugs

- [x] Onglet Équipes (`sport === "teams"`) : matchs manquants car `favorites.teams` devait correspondre exactement à la clé canonique dans `teams.json`, or une même équipe a des clés différentes selon sport/compétition (ex. `"France"` football vs `"France Rugby"`).
  - Corrigé : `favorites.teams` (userSettings.json) restructuré en objets `{sport, name}`, matching mis à jour dans `src/services/api.js` (filtre sur `sport` + `homeId`/`awayId`). Testé sur données réelles : les 5 favoris (OM, FC Barcelona, Stade Toulousain, France football, France Rugby) matchent correctement.
  - Espagne : clé `teams.json` renommée `"Spain"` → `"Espagne"` (aliases `["Spain", "España"]`) pour cohérence, même si non utilisée dans les favoris actuels.
- [ ] `favorites.competitions` (`userSettings.json`) n'est lu nulle part dans `src/` — soit l'implémenter (favoriser une compétition entière, pas juste des équipes), soit le supprimer pour ne pas laisser croire qu'il a un effet.

## Nettoyage code

- [ ] Supprimer `src/services/sources.js` (non importé nulle part) ou l'intégrer si prévu pour un usage futur.
- [ ] Envisager de découper `src/App.jsx` (état + logique de tri/filtre concentrés dans un seul composant de 150 lignes) si le composant continue de grossir.

## Git / repo

- [ ] `git pull` pour rattraper le commit distant.
- [ ] Statuer sur les fichiers modifiés non commités : `CLAUDE.md`, `public/config/teams.json`, `public/config/userSettings.json` — commit ou revert.

## Documentation

- [x] `NOTES.md` supprimé (journal de migration périmé, historique conservé dans git).
- [x] `README.md` corrigé : Stack (CSS natif → Tailwind, PWA → service worker basique sans offline réel) et Déploiement (gh-pages branch → déploiement natif GitHub Pages via `deploy-pages`).
