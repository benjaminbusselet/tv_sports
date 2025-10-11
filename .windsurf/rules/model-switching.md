---
trigger: model_decision
description: Appliquer selon présence mots-clés détection modèle
---

# DÉTECTION AUTOMATIQUE DU MODÈLE

## DÉCLENCHEURS SWE-1 (Sans limite crédits)
Activer SWE-1 si le prompt contient:
- "analyser tout", "analyser l'architecture", "refactorer complètement"
- "créer projet", "générer application", "scaffolder"
- "tous les fichiers", "codebase entier", "scan complet"
- "design pattern", "architecture", "structure globale"
- Modifications >100 lignes ou >5 fichiers simultanés

## DÉCLENCHEURS CLAUDE SONNET 4 (Économie tokens)
Activer Claude Sonnet si le prompt contient:
- "corriger bug", "fix erreur", "réparer"
- "modifier ligne", "ajuster", "petite modification"
- "question rapide", "expliquer", "comment"
- "ajouter fonction", "créer composant" (unitaire)
- Modifications <50 lignes ou fichier unique

## COMPORTEMENT PAR DÉFAUT
- Prompt vague ou neutre → SWE-1 (maximiser performance)
- Doute sur complexité → SWE-1 (assumer la puissance)
- Utiliser Claude Sonnet uniquement pour tâches explicitement légères