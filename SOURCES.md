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
- Groq : https://console.groq.com/docs/models et https://console.groq.com/docs/api-reference — catalogue des modèles et API Chat Completions ; les permissions de projet peuvent restreindre l’inférence : https://console.groq.com/docs/model-permissions.

## Hypothèses du simulateur

Les bases `deptDB` et `deptFlowStats` et les formules de la version précédente ont été conservées. Les valeurs de postes, demandes et tendances ne sont pas rattachées à une source administrative vérifiable ni à une campagne officielle ; ce sont des hypothèses de simulation. Le classement « Conseillés pour Souhaits » des modèles Groq est éditorial, appliqué uniquement aux modèles présents dans la réponse de l’API. Les services externes peuvent évoluer ou devenir indisponibles.
