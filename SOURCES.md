# Sources et licences

## Carte locale

- **Contours administratifs Etalab 2025** : https://etalab-datasets.geo.data.gouv.fr/contours-administratifs/2025/geojson/departements-100m.geojson
- Producteur : Etalab / services de l’État. Licence Ouverte / Open Licence 2.0 : https://www.etalab.gouv.fr/licence-ouverte-open-licence/
- Copie récupérée le 24 novembre 2026, limitée aux 101 départements (collectivités exclues), géométries simplifiées à une tolérance de 0,008 degré avec conservation de topologie, coordonnées arrondies à 5 décimales. Cette simplification est destinée à la visualisation, pas à un usage cadastral.
- **Leaflet 1.9.4** : https://leafletjs.com/ — BSD-2-Clause, texte dans `assets/vendor/leaflet/LICENSE`.
- **Fond OpenStreetMap** : https://www.openstreetmap.org/copyright et https://operations.osmfoundation.org/policies/tiles/ — attribution affichée dans la carte. Les tuiles ne sont pas embarquées.

## Enrichissements facultatifs

- API géographique de l’État : https://geo.api.gouv.fr/ — communes, populations et centres géographiques.
- Open-Meteo : https://open-meteo.com/ — prévisions météorologiques ; aucune assimilation à des normales climatiques.
- Wikipédia FR : https://fr.wikipedia.org/ — résumés via API REST, textes soumis à leurs conditions de réutilisation (CC BY-SA). Le contenu reste distinct de l’analyse IA.
- Wikimedia Commons : https://commons.wikimedia.org/ — chaque photo conserve un lien vers sa fiche indiquant auteur et licence. Les résultats de recherche sont des illustrations, sans vérification éditoriale individuelle.


## Hypothèses du simulateur

Les bases `deptDB` et `deptFlowStats` et les formules de la version précédente ont été conservées. Les valeurs de postes, demandes et tendances ne sont pas rattachées à une source administrative vérifiable ni à une campagne officielle ; ce sont des hypothèses de simulation. Les services externes peuvent évoluer ou devenir indisponibles.

## Photographie territoriale V9

Les données `assets/territoires.js` sont issues des réponses suivantes, récupérées le 24 novembre 2026 :

- `https://geo.api.gouv.fr/departements?fields=nom,code,codeRegion`
- `https://geo.api.gouv.fr/regions?fields=nom,code`
- Pour chacun des 101 départements : `https://geo.api.gouv.fr/departements/{code}/communes?fields=nom,code,population,centre`

Documentation officielle : https://geo.api.gouv.fr/decoupage-administratif/communes. Réutilisation sous Licence Ouverte 2.0. Les six communes les plus peuplées de chaque département sont conservées, ou toutes s’il y en a moins. Les totaux additionnent les populations de toutes les communes renvoyées. Le millésime de population n’étant pas fourni dans ces réponses, la date indiquée est une date de photographie, pas une année de recensement revendiquée. Les arrondissements municipaux n’ont pas été ajoutés aux communes.

Les surfaces sont approchées par une intégration sphérique sur les contours simplifiés embarqués, avec retrait des trous des polygones. La densité en découle ; aucune précision cadastrale n’est revendiquée.

Reconstruction : placer `departements.json`, `regions.json` et un sous-dossier `communes/{code}.json` dans un répertoire d’entrée, puis lancer `python scripts/build-territories.py --input-dir REPERTOIRE --date AAAA-MM-JJ`. Les fichiers JSON d’entrée sont des réponses brutes aux endpoints ci-dessus.

Les synthèses sont des règles locales appliquées aux données présentes et aux hypothèses du modèle. Aucun service d’IA n’est utilisé. Les compléments publics et le fond OpenStreetMap sont désactivés par défaut et ne sont pas stockés dans le cache hors connexion.
