# Logiciel de prise de rendez-vous MG2L / VALORIALE

Application prête pour GitHub + Vercel avec questionnaire rapide, affichage des créneaux libres et création automatique dans Google Agenda.

## Architecture

- `public/index.html` : interface client
- `public/styles.css` : charte graphique
- `public/app.js` : logique navigateur
- `api/availability.js` : calcule les créneaux libres via Google Calendar FreeBusy
- `api/book.js` : crée le rendez-vous dans Google Calendar

## Déploiement conseillé

1. Créer un dépôt GitHub et y déposer tous les fichiers.
2. Importer le dépôt dans Vercel.
3. Créer un projet Google Cloud.
4. Activer Google Calendar API.
5. Créer un Service Account.
6. Télécharger la clé JSON.
7. Partager l'agenda Google `sylvie@amg2l.com` avec l'adresse email du Service Account, avec le droit `Modifier les événements`.
8. Dans Vercel > Settings > Environment Variables, ajouter :
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID=sylvie@amg2l.com`
   - `BOOKING_TIMEZONE=Europe/Paris`
   - `ADMIN_EMAIL=sylvie@amg2l.com`
9. Redéployer le projet.

## Important sécurité

Ne jamais mettre la clé privée Google dans `app.js`, `index.html` ou un dépôt public. Elle doit rester uniquement dans les variables d'environnement Vercel.

## Paramétrage simple

Les types de rendez-vous et les questions sont dans `public/app.js`, objet `meetingTypes`.
Les horaires disponibles sont dans `api/availability.js`, fonction `getBusinessHours`.

## Sources techniques officielles

- Google Calendar API : FreeBusy et Events Insert
- Vercel Functions et Environment Variables
