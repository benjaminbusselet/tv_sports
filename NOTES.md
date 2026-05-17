# Pense-bête — Migration CSS / Thèmes

## État actuel

### ✅ Étape 1 — Migration Tailwind (terminée)
- `LoadingSpinner` → 100% Tailwind
- `DayStrip` → layout Tailwind, effets glass dans `src/styles/glass.css`
- `SportsTabs` → layout Tailwind, effets glass dans `src/styles/glass.css`
- `EventsList` → layout Tailwind, effets glass dans `src/styles/glass.css`
- `App` → layout Tailwind, effets glass dans `src/styles/glass.css`

### ✅ Étape 2 — Architecture 4 thèmes + refactor CSS (terminée)
- `body.dark` → `data-mode="dark"` sur `<html>`
- `dark_theme.css` → uniquement les overrides de variables CSS
- `utilities.css` → nettoyé, plus de `body.dark`
- Effets glass centralisés dans `src/styles/glass.css` (`@layer components`)
- CSS composants vidés et imports retirés (DayStrip.css, SportsTabs.css, App.css)
- `EventsList.css` → garde uniquement les badges de statut

### ✅ Étape 3 — Variables thème Sport (terminée)
- `variables.css` → ajout des variables `--sport-*` (Light + Dark)
- Sélecteurs `[data-brand="sport"]` et `[data-brand="sport"][data-mode="dark"]`
- Accent Sport : `--sport-accent: #46d369`

### ✅ Étape 4 — ThemeSwitch + LightSwitch + Drawer (terminée)
- `ThemeSwitch.jsx` → bascule `data-brand` (Glass ↔ Sport), persiste dans localStorage
- `LightSwitch.jsx` → bascule `data-mode` (light ↔ dark), persiste dans localStorage
- `src/styles/sport.css` → styles plats Sport (`@layer components`) scopés à `[data-brand="sport"]`
- `Drawer.jsx` → panel latéral droit, fermeture Escape/backdrop/bouton ✕, scroll body bloqué
- `App.jsx` → bouton ☰ dans le header ouvre le Drawer (ThemeSwitch + LightSwitch dedans)
- `ThemeSwitcher.jsx` → supprimé

### ✅ Build (npm run build)
- Import `./App.css` mort retiré de App.jsx
- Imports `./DayStrip.css` et `./SportsTabs.css` morts retirés des JSX
- Build passe sans erreur

---

## Fichiers à nettoyer manuellement (si pas encore fait)
- `src/components/DayStrip.css` → vide, peut être supprimé
- `src/components/SportsTabs.css` → vide, peut être supprimé
- `src/App.css` → vide, peut être supprimé

---

## Architecture finale

```
src/
├── components/
│   ├── Drawer.jsx        ← menu latéral (ThemeSwitch + LightSwitch + Compte)
│   ├── ThemeSwitch.jsx   ← bascule data-brand
│   ├── LightSwitch.jsx   ← bascule data-mode
│   ├── DayStrip.jsx
│   ├── SportsTabs.jsx
│   ├── EventsList.jsx
│   ├── EventsList.css    ← badges statut uniquement
│   └── LoadingSpinner.jsx
├── styles/
│   ├── glass.css         ← effets Liquid Glass (@layer components)
│   └── sport.css         ← overrides thème Sport (@layer components)
├── variables.css          ← toutes les variables CSS (Glass + Sport)
├── dark_theme.css         ← variables [data-mode="dark"]
├── base.css               ← @import tailwindcss + glass.css + sport.css
└── utilities.css          ← utilitaires surface, boutons base
```

**Thèmes actifs via attributs sur `<html>` :**
| data-brand | data-mode | Résultat    |
|------------|-----------|-------------|
| (aucun)    | light     | Glass Light |
| glass      | light     | Glass Light |
| glass      | dark      | Glass Dark  |
| sport      | light     | Sport Light |
| sport      | dark      | Sport Dark  |

---

## Règles importantes
- **Toujours `--ui-bg` et `--ui-text`** dans les composants (jamais `--ui-bg-light` etc.)
- Les effets glass restent en CSS — pas en Tailwind inline
- `--sport-accent` (`#46d369`) disponible pour les styles Sport futurs
- Les styles Sport sont des **overrides** : ils écrasent glass.css via la spécificité du sélecteur `[data-brand="sport"]`
