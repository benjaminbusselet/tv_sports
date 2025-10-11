---
trigger: always_on
---

# RÈGLES D'OPÉRATIONS CODE

## MODIFICATIONS CODE
- Grouper modifications connexes en batch unique
- Max 50 lignes/modification pour Claude Sonnet
- Illimité pour SWE-1
- Backup automatique si modifications >20 lignes

## LECTURE FICHIERS
- Lire UNIQUEMENT les fichiers explicitement nécessaires
- Jamais d'analyse exploratoire sans demande explicite
- Spécifier les chemins exacts avant lecture
- Ignorer: node_modules/, .git/, dist/, build/

## EXÉCUTION COMMANDES
- Auto-exécution: npm/yarn install, tests, linters, formatters
- Validation requise: git push, deployments, suppression fichiers
- Toujours vérifier les dépendances avant exécution

## CONTEXTE & TOKENS (Claude Sonnet uniquement)
- Utiliser /compact après chaque tâche majeure
- Utiliser /clear entre tâches distinctes
- Ne jamais garder conversations >500 lignes sans compaction