---
trigger: model_decision
description: Actif uniquement avec Claude Sonnet 4
---

# OPTIMISATION TOKENS (CLAUDE SONNET UNIQUEMENT)

## STRATÉGIES ÉCONOMIE
- Lire max 3 fichiers par requête
- Privilégier grep/search au lieu de lecture complète
- Compacter contexte avec /compact toutes les 3 interactions
- Clear complet avec /clear entre projets différents

## ANTI-PATTERNS COÛTEUX
- ❌ Analyser tout le codebase "au cas où"
- ❌ Lire fichiers de config non pertinents
- ❌ Générer multiple alternatives non demandées
- ❌ Expliquer les choix architecturaux par défaut

## INDICATEURS DÉCLENCHEMENT COMPACT
- Conversation >300 lignes
- >5 fichiers lus dans la session
- Changement de contexte projet/feature
- Message "contexte saturé" ou réponses vagues