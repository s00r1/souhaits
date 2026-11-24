# Méthode V10 — première affectation C administratif DGFiP

## Ce que représente un vœu

L’unité est le **couple direction–département**, avec emploi administratif dans le périmètre de cette application. `440@44` (DR/DDFiP de Loire-Atlantique) et `D44@44` (DiSI Centre-Ouest, implantation 44) sont distincts. `A15@13` et `A15@33` sont également distincts. Un code de direction spécialisée sans département est ambigu et refusé. Un département seul désigne sa direction territoriale. Le catalogue historique ne garantit ni l’implantation actuelle ni des postes ouverts.

## Faits embarqués et provenance

Le registre `data/history-reviewed.json` et sa version navigateur `assets/history.js` comprennent :

- quatre campagnes nationales 2023–2026 : affectations d’office, priorités et, lorsque documentés, appelés, affectés, part Île-de-France et désistements ;
- **127 directions**, dont 101 territoriales et 26 spécialisées, dans le tableau DGFiP des effectifs C projetés fin 2023 après première affectation (publication FO). Cinq mesures par direction : emplois autorisés, effectif réel, solde réel, ETP, solde ETP. Les totaux sont contrôlés : 22529 emplois autorisés, 21590 agents ;
- cinq observations locales d’arrivées de C stagiaires : Paris 2023, Meurthe-et-Moselle 2024, Nord/Pas-de-Calais/Seine-et-Marne 2025 ;
- des distributions partielles d’affectations d’office par département et le repère de l’appel spécifique Longuenesse.

Chaque fait possède un identifiant de source et chaque source un lien et un périmètre. Les données syndicales sont des comptes rendus primaires ; le tableau d’effectifs est un document administratif republié. Certaines pages CFDT étaient accessibles par leur texte indexé, avec un accès direct bloqué. Le bilan 2024 affiche une date de publication incohérente : l’année vient du texte, les nombres de priorités et d’office sont corroborés par le bilan 2026.

**Ne pas assimiler** emplois autorisés, places au concours, appelés, affectés nationaux, arrivées départementales et postes ouverts pour une direction et un département. Les 1152 affectations 2026 correspondent à 169 IDF + 983 province, hors autres CNAL. Le changement de périmètre CNAL limite les comparaisons. Les désistements rétrospectifs avant entrée en école ne sont pas les renoncements recensés à une date intermédiaire.

## Ce que le moteur sait calculer

Le moteur effectue **2400 tirages communs dans trois hypothèses**, soit 7200 scénarios. Pour chaque tirage, il tire un seuil de disponibilité par couple direction–département, puis attribue **le premier vœu encore disponible**. Les perturbations nationales et géographiques sont partagées. Il n’utilise plus les anciens faux nombres de demandes/postes départementaux ni les malus d’« ambition », l’attractivité touristique ou un bonus artificiel pour Longuenesse.

Les parts affichées sont des **fréquences dans ce modèle exploratoire**, pas des probabilités individuelles calibrées. Les trois hypothèses multiplient les seuils par 0,6 / 1 / 1,55. La plage d’une direction est le minimum et le maximum des trois fréquences : elle décrit la sensibilité aux hypothèses, **pas un intervalle de confiance**. Une direction située plus bas peut avoir une part centrale supérieure à celle du scénario favorable, parce que les vœux précédents deviennent aussi plus accessibles.

La carte additionne, dans chaque scénario, les parts des directions du même département. Elle calcule ensuite sa plage ; elle n’additionne pas les extrêmes indépendamment. Toutes les issues et la part hors liste totalisent 100 % avant arrondis. La part hors liste n’est **pas** le taux historique national d’affectation d’office : une liste réelle peut être étendue, et des procédures spécifiques existent.

Les tirages dépendent de l’année, du numéro de tirage et de l’identité du couple, jamais de la longueur ou de l’ordre de la liste. Ajouter un vœu à la fin ne change pas les parts précédentes. Un meilleur rang améliore la disponibilité de chaque direction et ne détériore pas la chance cumulée d’obtenir un vœu ; il peut modifier la répartition entre vœux.

## Hypothèses lorsque les données de postes manquent

Les références historiques utilisent uniquement les années **antérieures à la campagne** ; pondération de récence 0,65 par année. Les imports de la campagne servent de données connues et sont identifiés.

1. L’effectif autorisé territorial 2023 sert uniquement de **proxy indirect de taille**. Sa part dans le total territorial répartit un volume national simulé. La part IDF est ajustée aux parts d’affectations historiques. Lorsqu’une observation d’arrivées départementales existe, le proxy de capacité combine 65 % de la taille et 35 % de cette observation remise à l’échelle nationale.
2. En l’absence de demandes réelles, leur répartition hypothétique est proportionnelle à la racine carrée des effectifs territoriaux. C’est une hypothèse de régularisation, **pas une mesure de demande**. Le seuil central est `volume national × part de capacité / part de demande × 0,75`. Le facteur 0,75 représente une hypothèse d’épuisement non estimée statistiquement.
3. Pour une direction spécialisée sans données par implantation, aucun effectif global d’agence n’est converti en postes locaux. Le seuil exploratoire est 0,65 fois le volume national, avec une dispersion lognormale beaucoup plus large (1,25 contre 0,85 pour les directions territoriales). Ce défaut sert à explorer ; il ne permet pas de distinguer objectivement les directions spécialisées. Une direction fermée peut encore avoir un score si sa fermeture n’est pas documentée : **importer zéro poste pour la campagne la ferme explicitement**.
4. Des postes importés remplacent la capacité hypothétique. Avec des demandes importées, le seuil approximatif devient `volume national × postes / demandes` : les demandes ne décrivant pas toujours les préférences ou le rang des autres candidats, une dispersion reste nécessaire.
5. Des derniers rangs **interclassés** de campagnes précédentes remplacent ces proxies par leur moyenne pondérée. Une mesure de la campagne est marquée rétrospective. Sans effectif de population comparable entre années, ces rangs ne sont pas automatiquement normalisés.

Les perturbations sont lognormales : coefficient 0,35 national, 0,30 géographique et 0,70 propre au couple, multipliés par sa dispersion. Les groupes géographiques sont un regroupement technique grossier (IDF et premier chiffre du département), pas des bassins administratifs. Les paramètres ne sont pas ajustés à un historique individuel et peuvent produire des estimations éloignées de la réalité. Les comptes d’affectations d’office sont exposés comme contexte et ne sont pas réutilisés comme pseudo-demandes ni comme taux individuel.

## Rang et priorités

Le référentiel est le guide de première affectation C 2026 : LP avant LC et interclassement interne/externe en LP, débutant par l’interne. Le rang externe `r` devient `r + min(r, effectif interne LP)` ; le rang interne `r` devient `r + min(r−1, effectif externe LP)`. Un rang déjà interclassé reste inchangé. Pour la LC externe, le rang s’ajoute après l’ensemble des appelés LP. La simulation est **conditionnelle à l’appel**, sans prédire celui-ci.

Si l’effectif interne LP manque, il est tiré entre 8 % et 30 % du total LP : plage de sensibilité explicite, non statistique officielle. Les désistements sont approximés par le taux national historique pondéré, perturbé de 2,5 points et borné entre 0 et 35 %. La plage de « rang utile » donne les quantiles 10–90 % des rangs ainsi simulés, non une garantie de classement administratif. L’ordre relatif réel des renonçants manque.

Les priorités ont un effet **uniquement dans le département indiqué**. Le modèle compare une voie générale et une approximation de file prioritaire : seuil de moitié, rang pondéré par la proportion nationale de demandes prioritaires. Le partage 50/50 est une simplification de l’alternance administrative, pas sa reproduction complète. RQTH et CMI ne sont pas assimilées à un droit automatique ; priorité légale, critères supplémentaires, pièces, ancienneté, rang et disponibilité doivent être examinés par l’administration. Les catégories sont regroupées dans cette approximation faute de données par type. Longuenesse reste hors du calcul général.

## Import et contrôle

CSV séparé par virgules ou points-virgules, encodage UTF-8 :

`year,direction,department,offers,requests,assigned,lastRank,source,scope`

- Code de direction du catalogue et département explicite, une ligne par couple et année.
- Valeurs entières positives ou nulles ; vide signifie inconnu, zéro signifie zéro.
- `lastRank` : dernier rang interclassé, sur le même périmètre d’administratifs C et le même mouvement.
- `source` : URL HTTPS ; `scope` obligatoire : `C_first_admin_national`.
- Les doublons, contradictions territoriales, affectations supérieures aux postes, fichiers >2 Mo et autres périmètres sont refusés. Maximum 5000 lignes. Les données restent locales.

L’application contrôle le format, **pas la véracité du document source**. L’utilisateur doit vérifier le millésime et l’unité. Le CSV d’export des résultats indique direction, département, plage et base de calcul.

## Validation et limites

Les tests vérifient conservation des probabilités, répétabilité, absence de données futures, rangs, priorité ciblée, directions multiples, retrait ciblé, ordre et imports. Ce sont des contrôles de cohérence logicielle. **Aucune précision prédictive individuelle n’est mesurée** : il manque un historique de candidats avec rangs, priorités, liste ordonnée de vœux, postes ouverts et affectation obtenue. Aucun pourcentage de précision ni promesse d’affectation n’est revendiqué. Ajouter des années de totaux nationaux ne remplace pas ces données individuelles.

Reproduction de la base d’effectifs : `pdftotext -layout document.pdf staff.txt`, puis `python scripts/build-history.py --staff-text staff.txt`. Le script contrôle les totaux du PDF et traite le libellé D69 réparti sur trois lignes.
