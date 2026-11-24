# Souhaits V10 — Simulateur autonome DGFiP

[Ouvrir Souhaits](https://s00r1.github.io/souhaits/)

Carte, fiches territoriales, calculs, synthèses et listes de test fonctionnent **sans Groq, sans clé et sans IA**. Les fichiers nécessaires et les données géographiques sont inclus dans le projet.

**Outil indépendant et non officiel.** Le moteur utilise des faits historiques sourcés et des hypothèses explicites. Ses fréquences restent exploratoires, sans validation prédictive individuelle ; les prix et indices de cadre de vie sont des estimations locales. Vérifiez les postes et les règles de priorité auprès de la DGFiP. Les repères démographiques embarqués sont distingués de ces hypothèses.

## Préparer et comparer

1. Saisissez votre rang, votre liste LC/LP et vos couples direction–département, un par ligne, dans l’ordre de préférence.
2. Cliquez sur **Calculer mes perspectives** ou utilisez le générateur de test.
3. Sélectionnez un département sur la carte ou avec la recherche. Ses villes, populations, coordonnées et sa synthèse locale apparaissent immédiatement.
4. Le champ de direction sous la carte permet d’ajouter ou retirer un seul couple direction–département. Le tableau **Tous les vœux** permet de monter/descendre un choix et recalcule la simulation.
5. **Sauvegarder** conserve le projet dans ce navigateur. **Exporter CSV** télécharge les résultats. **Effacer** supprime le projet sauvegardé, en conservant votre thème.

Seuls les doublons exacts du même couple sont ignorés et les lignes inconnues signalées. `44 DDFiP` et `44 DiSI Centre-Ouest` sont deux vœux ; `33 SDNC` et `13 SDNC` aussi. Une direction spécialisée nécessite toujours son département. La carte additionne leurs parts par département, le tableau et le CSV conservent chaque direction. Modifier le profil invalide les anciens résultats. Les parts de tous les vœux et la part hors liste totalisent 100 % avant arrondis.

## Générer des vœux de test

Le panneau **Générer des vœux de test** propose :

- 1 à 101 vœux demandés ;
- métropole, France entière ou outre-mer ;
- liste équilibrée, aléatoire, littorale, montagne ou budget logement modéré ;
- option pour inclure des directions spécialisées de démonstration, sans présumer de postes ouverts.

**Générer et simuler** remplace la liste affichée sans doublons, conserve les autres réglages et ajoute le rang de test 317 si le champ est vide. La liste est limitée au nombre de départements correspondant aux critères (par exemple cinq en outre-mer). Cliquez à nouveau pour varier les choix. Les critères « littoral », « montagne » et « budget » utilisent les catégories du modèle local ; ils ne constituent pas un catalogue administratif de postes.

## Clair, sombre ou automatique

Le sélecteur en haut de page propose **Clair**, **Sombre** et **Auto**. Le choix est conservé sur l’appareil. Auto suit le thème système et réagit à ses changements. La carte, les champs, les fiches, les indicateurs et la navigation sont adaptés aux deux thèmes. Les mouvements sont réduits si le système le demande.

Les résultats utilisent des repères colorés et des textes explicites : top 3, part hors liste, rang utile simulé, plages de sensibilité et sélection. La synthèse locale sépare les faits embarqués, les éléments à comparer et les points de vigilance. Elle est calculée par des règles transparentes, sans modèle génératif.

## Fonctionnement autonome et hors connexion

Les calculs, fiches et contours ne nécessitent aucun service tiers. Les photos sont recherchées automatiquement à la sélection ; décochez **Photos automatiques** pour désactiver ces requêtes. La carte utilise ses contours embarqués, sans fond de tuiles distant. Les 101 fiches comprennent les principales communes, leurs populations et leurs coordonnées, ainsi que la région, une population agrégée et une densité calculée.

Après une première ouverture sur HTTPS et la mise en cache, le pied de page affiche **Application prête hors connexion**. La page peut alors être rechargée sans réseau. Cela dépend du support des service workers et du stockage disponible dans le navigateur. Les contrôles restent utilisables si ce stockage est bloqué ; seule la sauvegarde persistante ou le cache peuvent être indisponibles.

Les photos sont récupérées automatiquement via Wikimedia Commons, avec recherche par département, par ville et par proximité géographique si nécessaire, filtrage des cartes/logos, légendes et crédits. Elles nécessitent Internet mais ne bloquent jamais la fiche locale.

Deux options explicites restent disponibles :

- **Fond de carte en ligne** : tuiles OpenStreetMap, chargées uniquement sur activation.
- **Compléments en ligne** : météo et Wikipédia, chargés uniquement sur activation. Une panne n’empêche pas l’utilisation des fiches locales. Désactiver l’option empêche une réponse tardive de modifier la fiche.

Les tuiles et contenus de tiers ne sont pas préchargés par le cache hors connexion. Sans Internet, les photos et la météo en direct ne sont pas disponibles ; les fonctions locales restent opérationnelles.

Les anciennes sauvegardes sont migrées en conservant le projet et en retirant les champs de connexion. Le client Groq a été supprimé.

## Moteur historique V10

- Quatre campagnes nationales 2023–2026, **127 directions** dans le tableau d’effectifs DGFiP 2023 et cinq observations locales d’arrivées C stagiaires. Les totaux du tableau sont contrôlés contre le PDF.
- 7200 scénarios conjoints : le premier vœu disponible gagne. Ajouter un vœu tardif ne pénalise pas les précédents. Les parts et le hors-liste totalisent 100 %.
- LP avant LC, interclassement interne/externe en LP, désistements historiques et priorité limitée au département indiqué. Longuenesse est un appel spécifique séparé.
- Trois hypothèses avec plage de sensibilité, **sans prétendre à un intervalle de confiance**. Effectifs ≠ postes ouverts ; les seuils manquants restent hypothétiques. Les directions spécialisées sans données locales sont explicitement signalées.
- Import local CSV des postes, demandes et derniers rangs **interclassés** par année, direction et département. Zéro poste connu pour la campagne ferme ce vœu. Les sources et le périmètre sont obligatoires.

Le panneau **Données & méthode** expose les chiffres, les sources et un modèle CSV vide. Les données des années futures sont exclues. [METHODOLOGY.md](./METHODOLOGY.md) décrit les équations, les hypothèses non calibrées et les données manquantes. Aucune précision prédictive individuelle n’est revendiquée.

## Données et limites

Photographie de l’API géographique de l’État récupérée le **24 novembre 2026**. Les populations sont celles exposées par les réponses communales à cette date ; la réponse ne précise pas un millésime de recensement. Les totaux sont des sommes communales. Les surfaces et densités sont approchées à partir des contours simplifiés, sans valeur cadastrale. Aucune population de ville, température ou distance routière n’est inventée pour remplir une fiche.

Les prix restent des ordres de grandeur du modèle, signalés comme tels. Voir [SOURCES.md](./SOURCES.md) pour les sources et licences.

## Développer et vérifier

```sh
npm ci
npm test
npm start
# Ouvrir http://localhost:4173
npx playwright install chromium
npm run test:browser
```

Aucun build n’est nécessaire sur GitHub Pages. Pour un usage local, conservez **tout le dossier** : copier uniquement `index.html` ne suffit pas. Les fonctions locales peuvent aussi s’ouvrir avec `file://`, mais la mise en cache par service worker nécessite un contexte web sécurisé ou localhost.

- `assets/app.js` : interface, carte, fiches et actions sur les vœux.
- `assets/directions.js` et `assets/direction-catalog.js` : identité des couples et catalogue historique.
- `assets/prediction.js` : scénarios, interclassement, priorités ciblées et validation CSV.
- `assets/history.js` et `data/` : faits historiques sourcés ; reconstruction avec `scripts/build-history.py`.
- `assets/local-tools.js` : générateur de test et synthèse à règles fixes, sans réseau.
- `assets/theme.js` : thème appliqué avant le chargement du style.
- `assets/territoires.js` : photographie démographique et coordonnées des villes.
- `assets/departements.js` et `assets/vendor/leaflet/` : carte embarquée.
- `sw.js` : cache des seuls fichiers de l’application. À chaque mise à jour, changer sa version et les URLs de cache en même temps que celles de `index.html`.
- `scripts/build-territories.py` : reconstruction de la photographie à partir des réponses publiques enregistrées.
- `tests/` : régressions locales et tests navigateur sur ordinateur et mobile, dont une vraie réouverture hors connexion.

Licence MIT pour le code ; dépendances et données sous leurs licences respectives.
