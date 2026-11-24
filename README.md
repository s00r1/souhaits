# Souhaits V7 — Simulateur DGFiP

[Ouvrir le site](https://s00r1.github.io/souhaits/)

Comparez une liste de départements, explorez une carte et obtenez une analyse facultative avec votre clé Groq.

**Outil personnel non officiel.** Les flux, postes, prix et pourcentages du moteur sont des hypothèses historiques non vérifiées. Ils ne prédisent pas une décision réelle de la DGFiP. Les priorités et règles d’affectation doivent être vérifiées auprès de l’administration. Le modèle IA ne remplace pas les règles officielles.

## Utilisation

1. Saisissez votre type de liste, votre rang et vos départements dans l’ordre souhaité, un par ligne. Les codes et noms sont acceptés.
2. Cliquez sur **Calculer**, ou **Exemple** pour essayer avec un profil complet.
3. Cliquez sur un département de la carte, une carte du top 3, un vœu du tableau complet, ou utilisez la recherche par code/nom.
4. Activez/désactivez la heatmap et utilisez le sélecteur pour la métropole, les Antilles, la Guyane, La Réunion ou Mayotte.
5. Enregistrez vos réglages avec **Sauver local** ou téléchargez vos résultats en CSV. **Effacer** supprime le formulaire et la sauvegarde de cette application.

Les lignes inconnues sont signalées. Un département répété ne compte qu’une fois ; l’ordre de sa première occurrence est conservé. La somme des parts simulées et du risque résiduel d’affectation d’office est de 100 % avant arrondis.

## Groq : découvrir et choisir un modèle réel

1. Créez une clé sur la [console Groq](https://console.groq.com/keys).
2. Collez-la dans le champ de l’application : le catalogue est automatiquement récupéré via `GET https://api.groq.com/openai/v1/models`. **Actualiser les modèles** relance cette découverte.
3. Sélectionnez un identifiant retourné par l’API. Les modèles de texte connus pour l’analyse sont classés dans **Conseillés pour Souhaits**. Les autres candidats sont proposés séparément et les modèles audio, de transcription, de modération ou d’embeddings sont exclus.
4. **Tester le modèle** fait un court appel à Chat Completions pour confirmer l’accès réel de cette clé. La liste de modèles ne garantit pas à elle seule les permissions d’inférence du projet ou le quota disponible.
5. Sélectionnez un département, puis cliquez sur **Analyser ce département avec Groq**. L’analyse utilise exactement le modèle choisi. Elle est affichée séparément des données publiques et ne remplace pas les faits par des chiffres générés.

Les recommandations sont un classement éditorial, pas un benchmark automatique. Un modèle inconnu peut demander d’autres paramètres ou être incompatible ; utilisez le test. L’application ne substitue pas silencieusement un autre modèle. Les erreurs de clé, permissions, quota et timeout sont expliquées. Les changements de clé, modèle ou département annulent les anciennes opérations pour éviter les réponses hors contexte.

La clé est transmise uniquement à `api.groq.com`, dans un en-tête d’autorisation. Par défaut elle reste en mémoire de la page, sans stockage persistant. L’option **Mémoriser la clé sur cet appareil** permet de la stocker dans le navigateur ; la décocher la retire immédiatement de la sauvegarde. Une clé conservée par l’ancienne version est retirée du stockage lors de la migration, sauf consentement explicite enregistré en V7. Aucune clé ne doit être ajoutée au dépôt. Les appels de test et d’analyse consomment le quota Groq.

## Carte et données

Leaflet et les contours des **101 départements** sont inclus dans le dépôt : leur chargement ne dépend pas d’un CDN ou d’une API géographique. Les fonds de carte OpenStreetMap restent facultatifs et nécessitent Internet. Les contours demeurent cliquables sans ces tuiles.

Le profil local apparaît immédiatement. Les communes/populations et positions réelles proviennent de l’API géographique de l’État ; les prévisions sur 7 jours d’Open-Meteo ; les résumés et photos de Wikipédia/Wikimedia Commons. Ces services ont un délai limite et restent facultatifs. La fiche précise les sources effectivement disponibles. Les marqueurs de villes utilisent de vraies coordonnées ; aucune position n’est inventée. Les prix, distances et autres données locales restent des estimations identifiées.

Voir [SOURCES.md](./SOURCES.md) pour les sources et licences.

## Développement et vérifications

```sh
npm ci
npm test
npm start
# Ouvrir http://localhost:4173
npx playwright install chromium
npm run test:browser
```

Le site est statique : aucun build et aucun serveur applicatif ne sont nécessaires sur GitHub Pages. Pour un usage local complet, lancez `npm start` plutôt que de copier uniquement `index.html` : le dossier `assets/` est indispensable.

- `index.html` : interface.
- `assets/app.js` et `assets/app.css` : carte, profils, calculs et réglages.
- `assets/groq.js` : découverte, erreurs, test et analyse Groq.
- `assets/departements.js` : contours simplifiés embarqués.
- `assets/vendor/leaflet/` : bibliothèque cartographique locale.
- `tests/` : régressions avec API simulées, contrôle des opérations tardives et tests navigateur desktop/mobile.

La CI lance les tests et conserve les captures navigateur. Le site existant est publié par GitHub Pages depuis `main`.

Licence MIT pour le code du projet ; dépendances et données sous leurs licences respectives.
