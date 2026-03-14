<a id="sommaire"></a>

# 🧭 Guide — DGFIP Predictor Map

> Bienvenue 👋 Ce projet est une **page HTML locale** qui aide à simuler des scénarios d'affectation (listes LC/LP), visualiser des tendances par département, et obtenir une aide textuelle enrichie (optionnelle) via **Groq API**.

---

## 📚 Sommaire

- [✨ À quoi sert cette page ?](#a-quoi-sert-cette-page)
- [🚀 Démarrage rapide (niveau zéro)](#demarrage-rapide)
  - [1) Préparer les fichiers](#preparer-les-fichiers)
  - [2) Ouvrir la page](#ouvrir-la-page)
  - [3) Vérifier l’interface](#verifier-interface)
  - [4) Lancer une simulation](#lancer-simulation)
- [🧩 Guide complet des options (vraiment pour noobs)](#guide-complet)
  - [1) Zone Saisie & réglages](#zone-saisie)
    - [Type de liste (LC / LP)](#type-liste)
    - [Rang](#rang)
    - [Modèle Groq](#modele-groq)
    - [Base postes simulés](#base-postes)
    - [Clé API Groq](#cle-api-groq)
    - [Priorités / situations](#priorites)
    - [Mode Longuenesse (62)](#mode-longuenesse)
    - [Pondérations](#ponderations)
  - [2) Zone Carte & Heatmap](#zone-carte)
    - [Carte départementale](#carte-departementale)
    - [Heatmap](#heatmap)
  - [3) Zone Résultats / aide à la décision](#zone-resultats)
- [🧠 Pourquoi Groq est utile ici ?](#pourquoi-groq)
- [🔑 Créer une API Groq (pas à pas, super détaillé)](#creer-api-groq)
  - [Étape 1 — Créer un compte](#etape-1)
  - [Étape 2 — Accéder au tableau de bord](#etape-2)
  - [Étape 3 — Générer une clé API](#etape-3)
  - [Étape 4 — Stocker la clé en sécurité](#etape-4)
  - [Étape 5 — Utiliser la clé dans la page](#etape-5)
  - [Étape 6 — En cas d’erreur](#etape-6)
- [🛡️ Bonnes pratiques (très important)](#bonnes-pratiques)
- [🧪 Méthode conseillée pour bien utiliser la page](#methode-conseillee)
- [❓ FAQ rapide](#faq)
  - [« Je suis perdu, je commence par quoi ? »](#faq-debut)
  - [« Groq est obligatoire ? »](#faq-groq)
  - [« La simulation est-elle officielle ? »](#faq-officielle)
- [📄 Licence](#licence)
- [🧰 Maintenance (si tu modifies la page)](#maintenance)

---

<a id="a-quoi-sert-cette-page"></a>
## ✨ À quoi sert cette page ?

Cette page te permet de :

- saisir ton profil de simulation (type de liste, rang, priorités, etc.) ;
- lancer une simulation locale pour estimer des chances de résultats ;
- visualiser une **carte départementale** et une **heatmap** pour repérer les zones plus ou moins favorables ;
- lire un **radar d’aide à la décision** ;
- générer un texte d’analyse enrichi avec Groq (si tu renseignes une clé API) ;
- consulter des images contextuelles (Wikimedia) selon les zones.

En résumé : c’est un tableau de bord local pour t’aider à prendre des décisions de vœux plus réfléchies.

[⬆️ Retour au sommaire](#sommaire)

---

<a id="demarrage-rapide"></a>
## 🚀 Démarrage rapide (niveau zéro)

<a id="preparer-les-fichiers"></a>
### 1) Préparer les fichiers
1. Mets `liste.html` dans un dossier de ton choix.
2. Assure-toi d’avoir Internet actif (utile pour Leaflet/CDN + éventuels appels API).

[⬆️ Retour au sommaire](#sommaire)

<a id="ouvrir-la-page"></a>
### 2) Ouvrir la page
- Double-clique simplement sur `liste.html`.
- Ou ouvre-la dans ton navigateur (Chrome, Firefox, Edge, Brave…).

[⬆️ Retour au sommaire](#sommaire)

<a id="verifier-interface"></a>
### 3) Vérifier l’interface
Tu verras plusieurs panneaux :
- **Saisie & réglages**
- **Carte / Heatmap**
- **Bloc DGFIP / calculs**
- **Panneau d’informations**

[⬆️ Retour au sommaire](#sommaire)

<a id="lancer-simulation"></a>
### 4) Lancer une simulation
1. Remplis les champs principaux (`Type de liste`, `Rang`, etc.).
2. Ajuste les pondérations si nécessaire.
3. Clique sur le bouton de simulation.
4. Analyse les résultats et la carte.

[⬆️ Retour au sommaire](#sommaire)

[⬆️ Retour au sommaire](#sommaire)

---

<a id="guide-complet"></a>
## 🧩 Guide complet des options (vraiment pour noobs)

<a id="zone-saisie"></a>
## 1) Zone **Saisie & réglages**

<a id="type-liste"></a>
### 🏷️ Type de liste (`LC` / `LP`)
- **LC** : liste complémentaire.
- **LP** : liste principale.

👉 Si tu ne sais pas, commence par le type qui correspond à ta situation officielle, puis compare les deux en faisant 2 simulations.

[⬆️ Retour au sommaire](#sommaire)

<a id="rang"></a>
### 🔢 Rang
- Saisis ton rang exact (exemple : 317).
- Plus la valeur est fiable, plus la simulation est utile.

[⬆️ Retour au sommaire](#sommaire)

<a id="modele-groq"></a>
### 🤖 Modèle Groq
- Valeur par défaut : `llama-3.3-70b-versatile`.
- Tu peux le laisser tel quel pour débuter.

[⬆️ Retour au sommaire](#sommaire)

<a id="base-postes"></a>
### 📦 Base postes simulés
- Nombre total de postes servant de base à la simulation.
- En général, laisse la valeur par défaut puis teste des variations (optimiste / réaliste / prudent).

[⬆️ Retour au sommaire](#sommaire)

<a id="cle-api-groq"></a>
### 🔐 Clé API Groq
- Champ facultatif mais recommandé pour l’enrichissement texte.
- Format attendu : commence souvent par `gsk_...`.

[⬆️ Retour au sommaire](#sommaire)

<a id="priorites"></a>
### ♿ Priorités / situations
- **Priorité handicap / RQTH / CMI invalidité**
- **Priorité rapprochement conjoint / PACS**
- **CS résidence des enfants**
- **CS soutien de famille**

👉 Active uniquement ce qui correspond à ta réalité.

[⬆️ Retour au sommaire](#sommaire)

<a id="mode-longuenesse"></a>
### 🗺️ Mode Longuenesse (62)
- Coche cette option si tu veux inclure ce scénario spécifique.

[⬆️ Retour au sommaire](#sommaire)

<a id="ponderations"></a>
### ⚖️ Pondérations
- **Poids ordre des vœux** : impact du classement de tes choix.
- **Poids attractivité** : impact de la demande globale des zones.
- **Poids tension** : impact des zones très demandées/saturées.

👉 Débutant : garde les valeurs par défaut.
👉 Avancé : fais plusieurs runs et compare.

[⬆️ Retour au sommaire](#sommaire)

[⬆️ Retour au sommaire](#sommaire)

<a id="zone-carte"></a>
## 2) Zone **Carte & Heatmap**

<a id="carte-departementale"></a>
### 🧭 Carte départementale
- Permet de visualiser la dynamique géographique de tes résultats.
- Les couleurs/aides visuelles servent à repérer les zones favorables ou tendues.

[⬆️ Retour au sommaire](#sommaire)

<a id="heatmap"></a>
### 🌡️ Heatmap
- Bouton dédié pour activer/désactiver la vue chaleur.
- Plus une zone est « chaude », plus la tension/compétition est élevée (interprétation générale).

👉 Astuce noob : compare la carte standard + heatmap pour confirmer une tendance avant de décider.

[⬆️ Retour au sommaire](#sommaire)

[⬆️ Retour au sommaire](#sommaire)

<a id="zone-resultats"></a>
## 3) Zone **Résultats / aide à la décision**

Tu y trouveras généralement :
- des indicateurs de probabilité/tendance ;
- un radar de décision ;
- des messages explicatifs ;
- potentiellement du texte enrichi via Groq.

👉 Important : c’est une **aide** et non une vérité absolue.

[⬆️ Retour au sommaire](#sommaire)

[⬆️ Retour au sommaire](#sommaire)

---

<a id="pourquoi-groq"></a>
## 🧠 Pourquoi Groq est utile ici ?

Sans Groq : la page fonctionne déjà en local pour les calculs/simulations.

Avec Groq :
- tu obtiens des explications textuelles plus naturelles ;
- tu peux avoir des synthèses plus lisibles (forces, faiblesses, stratégie) ;
- c’est pratique pour comprendre rapidement un scénario complexe.

En gros, Groq sert de « copilote texte » pour mieux interpréter les sorties chiffrées.

[⬆️ Retour au sommaire](#sommaire)

---

<a id="creer-api-groq"></a>
## 🔑 Créer une API Groq (pas à pas, super détaillé)

> Site officiel : **https://console.groq.com/**

<a id="etape-1"></a>
### Étape 1 — Créer un compte
1. Ouvre : https://console.groq.com/
2. Clique sur **Sign up** / **Create account**.
3. Inscris-toi avec e-mail (ou méthode proposée).
4. Vérifie ton e-mail si demandé.

[⬆️ Retour au sommaire](#sommaire)

<a id="etape-2"></a>
### Étape 2 — Accéder au tableau de bord
1. Connecte-toi à la console Groq.
2. Ouvre la section **API Keys** (ou rubrique équivalente).

[⬆️ Retour au sommaire](#sommaire)

<a id="etape-3"></a>
### Étape 3 — Générer une clé API
1. Clique sur **Create API key**.
2. Donne un nom clair (ex : `dgfip-predictor-local`).
3. Copie la clé immédiatement (souvent affichée une seule fois).

[⬆️ Retour au sommaire](#sommaire)

<a id="etape-4"></a>
### Étape 4 — Stocker la clé en sécurité
- Utilise un gestionnaire de mots de passe.
- **Ne publie jamais** la clé dans un repo public.
- Évite les captures d’écran avec la clé visible.

[⬆️ Retour au sommaire](#sommaire)

<a id="etape-5"></a>
### Étape 5 — Utiliser la clé dans la page
1. Ouvre `liste.html` dans ton navigateur.
2. Colle la clé dans le champ **Clé API Groq**.
3. Laisse le modèle par défaut pour commencer.
4. Lance la simulation et consulte la partie texte enrichie.

[⬆️ Retour au sommaire](#sommaire)

<a id="etape-6"></a>
### Étape 6 — En cas d’erreur
- Clé invalide : régénère une clé.
- Limites/quota : vérifie ton plan dans la console Groq.
- Modèle introuvable : reviens au modèle par défaut de la page.

[⬆️ Retour au sommaire](#sommaire)

[⬆️ Retour au sommaire](#sommaire)

---

<a id="bonnes-pratiques"></a>
## 🛡️ Bonnes pratiques (très important)

- La page est une **simulation locale non officielle**.
- Toujours croiser avec les informations administratives officielles.
- Teste plusieurs hypothèses (optimiste/réaliste/prudent).
- Ne partage pas ta clé API publiquement.

[⬆️ Retour au sommaire](#sommaire)

---

<a id="methode-conseillee"></a>
## 🧪 Méthode conseillée pour bien utiliser la page

1. **Run 1 (base)** : valeurs par défaut + ton rang réel.
2. **Run 2 (prudent)** : augmente tension, baisse attractivité favorable.
3. **Run 3 (optimiste)** : scénario inverse.
4. Compare les 3 résultats :
   - zones stables ;
   - zones très variables ;
   - décisions robustes.

[⬆️ Retour au sommaire](#sommaire)

---

<a id="faq"></a>
## ❓FAQ rapide

<a id="faq-debut"></a>
### « Je suis perdu, je commence par quoi ? »
- Remplis seulement : Type de liste, Rang, Base postes.
- Laisse le reste par défaut.
- Lance une simulation, puis ajuste progressivement.

[⬆️ Retour au sommaire](#sommaire)

<a id="faq-groq"></a>
### « Groq est obligatoire ? »
- Non, la simulation locale fonctionne sans Groq.
- Groq améliore surtout les explications textuelles.

[⬆️ Retour au sommaire](#sommaire)

<a id="faq-officielle"></a>
### « La simulation est-elle officielle ? »
- Non. C’est un outil d’aide local.

[⬆️ Retour au sommaire](#sommaire)

[⬆️ Retour au sommaire](#sommaire)

---

<a id="licence"></a>
## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [`LICENSE`](./LICENSE).

[⬆️ Retour au sommaire](#sommaire)

---

<a id="maintenance"></a>
## 🧰 Maintenance (si tu modifies la page)

- Travaille dans un éditeur simple (VS Code recommandé).
- Fais de petites modifications et teste souvent dans le navigateur.
- Conserve les noms de champs cohérents pour éviter de casser les scripts.

Bon usage 👊

[⬆️ Retour au sommaire](#sommaire)
