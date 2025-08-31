# ROADMAP

## 1) Back-end (Node.js) ✅

- Architecture & pipeline
  - Modularité (`build.js`), organisation fichiers, responsabilités claires
- Sources de données
  - ICS Fixtur.es : extraction, parsing, filtrage par date
  - EPG Open-EPG : cache 2h, extraction J-2 à J+2, quotas
- Traitement des données
  - Fusion ICS ↔ EPG, tolérance ±60 min, mapping équipes, attribution diffuseurs automatiques
  - Règles métier spécifiques (ex: Ligue 1+, beIN SPORTS, DAZN)
- Gestion fichiers
  - Formats date YYYYMMDD, fichiers intermédiaires (`ics_*`, `epg_*`), fichiers finaux (`progs_*`)
  - Purge automatique sur fenêtre glissante T → T+7
- Configuration
  - `teams.json` enrichi automatiquement, whitelist chaînes, `icsSources.json`

## 2) Front-end (React + Vite) 🔄

- Architecture React & gestion d’états
- Intégration API et données formatées (dates, mapping)
- UI/UX
  - Navigation temporelle responsive (barre chips, menu déroulant)
  - Filtres sports & équipes, vue liste et groupée, affichage diffuseurs
- Responsive Design & adaptation mobile

## 3) Notifications 📱 (À venir)

- Règles fines : par équipe, compétition, créneau
- Gestion favoris & stockage local
- Push Web API avec permissions et abonnements

## 4) Hébergement & déploiement 🌐 (À préparer)

- GitHub Pages + workflow CI/CD avec GitHub Actions
- Gestion des chemins, optimisation cache HTTP

## 5) Automatisation & monitoring ⚙️ (À préparer)

- Cron quotidien en ligne avec alertes & logs
- Gestion artefacts & options production

## 6) Améliorations futures 🚀 (À long terme)

- Interface ajout/suppression sources (UI + validation)
- Filtres avancés, statistiques, mode hors-ligne (PWA)
- Intégration nouveaux sports, API publique documentée

---

**Légende :**

- ✅ Terminé
- 🔄 En cours
- 📱 À venir
- 🌐 Préparation
- ⚙️ Configuration
- 🚀 Futur
