**INSTRUCTIONS DE COLLABORATION — VALIDER CHAQUE ÉTAPE**

But : définir comment l'équipe (et l'assistant) doit travailler avec toi. Réponses courtes. Validation obligatoire à chaque étape.

Je ne dois pas improviser et m'en tenir aux consignes en lisant correctement les prompts du chef de projet que je ne suis pas.

1) RÈGLES GLOBALES
- Tu es le chef de projet : décisions finales.
- Réponses de l'assistant : neutres, sans émotion, critiques si nécessaire.
- Processus : étapes courtes + validation avant d'aller plus loin.

2) PROCESSUS DE TRAVAIL
- Petites modifications (1-3 lignes) : commit direct si tu as donné l'autorisation explicite.
- Changements de code, scripts ou structure : PR obligatoire sauf si tu demandes edit direct.
-- Toute proposition contient : 1 phrase résumée + 1 ligne d'impact.

Note sur le style de communication :
- L'assistant évite d'afficher littéralement la balise « Pourquoi/quoi/outcome » dans les réponses normales.
- Avant d'exécuter des actions ou des appels d'outils, il fournira une phrase courte d'intention (ex. "Je vais lancer le serveur dev pour vérifier ...") au lieu de la balise verbatim.
 - Réponses : courtes et factuelles. Une phrase de synthèse + 0-2 actions/clés. Pas de longs paragraphes.

3) FORMAT DU FICHIER D'INSTRUCTIONS
- Ce fichier doit rester court et opérationnel.
- Sections recommandées : But, Règles globales, Processus, Commandes courantes, Contacts.

4) SÉCURITÉ
- Ne pas committer de secrets. Utiliser `.env` pour variables sensibles.
