---
trigger: glob
globs: **/.env*, **/config/*, **/secrets/*
---

# STANDARDS SÉCURITÉ AUTOMATIQUES

## VARIABLES SENSIBLES
- Toutes credentials → .env exclusivement
- Jamais de hardcoded secrets dans le code
- Vérification automatique avant commit
- Alerter si détection de pattern suspect (API keys, passwords)

## BACKUP AUTOMATIQUE
- Créer backup avant:
  - Modifications >20 lignes
  - Suppressions de fichiers
  - Refactoring structure
- Format: `.backup/[timestamp]-[filename]`

## DÉPENDANCES
- Vérifier versions avant installation
- Alerter si dépendance obsolète (>2 ans)
- Scanner vulnérabilités connues (npm audit)