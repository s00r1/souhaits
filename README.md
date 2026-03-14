# 🧭 Guide — DGFIP Predictor Map 

> Bienvenue 👋 Ce projet est une **page HTML locale** qui aide à simuler des scénarios d'affectation (listes LC/LP), visualiser des tendances par département, et obtenir une aide textuelle enrichie (optionnelle) via **Groq API**.

---

## ✨ À quoi sert cette page ?

Cette page te permet de :

- saisir ton profil de simulation (type de liste, rang, priorités, etc.) ;
- lancer une simulation locale pour estimer des chances de résultats ;
- visualiser une **carte départementale** et une **heatmap** pour repérer les zones plus ou moins favorables ;
- lire un **radar d’aide à la décision** ;
- générer un texte d’analyse enrichi avec Groq (si tu renseignes une clé API) ;
- consulter des images contextuelles (Wikimedia) selon les zones.

En résumé : c’est un tableau de bord local pour t’aider à prendre des décisions de vœux plus réfléchies.

---

## 🚀 Démarrage rapide (niveau zéro)

### 1) Préparer les fichiers
1. Mets `liste.html` dans un dossier de ton choix.
2. Assure-toi d’avoir Internet actif (utile pour Leaflet/CDN + éventuels appels API).

### 2) Ouvrir la page
- Double-clique simplement sur `liste.html`.
- Ou ouvre-la dans ton navigateur (Chrome, Firefox, Edge, Brave…).

### 3) Vérifier l’interface
Tu verras plusieurs panneaux :
- **Saisie & réglages**
- **Carte / Heatmap**
- **Bloc DGFIP / calculs**
- **Panneau d’informations**

### 4) Lancer une simulation
1. Remplis les champs principaux (`Type de liste`, `Rang`, etc.).
2. Ajuste les pondérations si nécessaire.
3. Clique sur le bouton de simulation.
4. Analyse les résultats et la carte.

---

## 🧩 Guide complet des options (vraiment pour noobs)

## 1) Zone **Saisie & réglages**

### 🏷️ Type de liste (`LC` / `LP`)
- **LC** : liste complémentaire.
- **LP** : liste principale.

👉 Si tu ne sais pas, commence par le type qui correspond à ta situation officielle, puis compare les deux en faisant 2 simulations.

### 🔢 Rang
- Saisis ton rang exact (exemple : 317).
- Plus la valeur est fiable, plus la simulation est utile.

### 🤖 Modèle Groq
- Valeur par défaut : `llama-3.3-70b-versatile`.
- Tu peux le laisser tel quel pour débuter.

### 📦 Base postes simulés
- Nombre total de postes servant de base à la simulation.
- En général, laisse la valeur par défaut puis teste des variations (optimiste / réaliste / prudent).

### 🔐 Clé API Groq
- Champ facultatif mais recommandé pour l’enrichissement texte.
- Format attendu : commence souvent par `gsk_...`.

### ♿ Priorités / situations
- **Priorité handicap / RQTH / CMI invalidité**
- **Priorité rapprochement conjoint / PACS**
- **CS résidence des enfants**
- **CS soutien de famille**

👉 Active uniquement ce qui correspond à ta réalité.

### 🗺️ Mode Longuenesse (62)
- Coche cette option si tu veux inclure ce scénario spécifique.

### ⚖️ Pondérations
- **Poids ordre des vœux** : impact du classement de tes choix.
- **Poids attractivité** : impact de la demande globale des zones.
- **Poids tension** : impact des zones très demandées/saturées.

👉 Débutant : garde les valeurs par défaut.
👉 Avancé : fais plusieurs runs et compare.

---

## 2) Zone **Carte & Heatmap**

### 🧭 Carte départementale
- Permet de visualiser la dynamique géographique de tes résultats.
- Les couleurs/aides visuelles servent à repérer les zones favorables ou tendues.

### 🌡️ Heatmap
- Bouton dédié pour activer/désactiver la vue chaleur.
- Plus une zone est « chaude », plus la tension/compétition est élevée (interprétation générale).

👉 Astuce noob : compare la carte standard + heatmap pour confirmer une tendance avant de décider.

---

## 3) Zone **Résultats / aide à la décision**

Tu y trouveras généralement :
- des indicateurs de probabilité/tendance ;
- un radar de décision ;
- des messages explicatifs ;
- potentiellement du texte enrichi via Groq.

👉 Important : c’est une **aide** et non une vérité absolue.

---

## 🧠 Pourquoi Groq est utile ici ?

Sans Groq : la page fonctionne déjà en local pour les calculs/simulations.

Avec Groq :
- tu obtiens des explications textuelles plus naturelles ;
- tu peux avoir des synthèses plus lisibles (forces, faiblesses, stratégie) ;
- c’est pratique pour comprendre rapidement un scénario complexe.

En gros, Groq sert de « copilote texte » pour mieux interpréter les sorties chiffrées.

---

## 🔑 Créer une API Groq (pas à pas, super détaillé)

> Site officiel : **https://console.groq.com/**

### Étape 1 — Créer un compte
1. Ouvre : https://console.groq.com/
2. Clique sur **Sign up** / **Create account**.
3. Inscris-toi avec e-mail (ou méthode proposée).
4. Vérifie ton e-mail si demandé.

### Étape 2 — Accéder au tableau de bord
1. Connecte-toi à la console Groq.
2. Ouvre la section **API Keys** (ou rubrique équivalente).

### Étape 3 — Générer une clé API
1. Clique sur **Create API key**.
2. Donne un nom clair (ex : `dgfip-predictor-local`).
3. Copie la clé immédiatement (souvent affichée une seule fois).

### Étape 4 — Stocker la clé en sécurité
- Utilise un gestionnaire de mots de passe.
- **Ne publie jamais** la clé dans un repo public.
- Évite les captures d’écran avec la clé visible.

### Étape 5 — Utiliser la clé dans la page
1. Ouvre `liste.html` dans ton navigateur.
2. Colle la clé dans le champ **Clé API Groq**.
3. Laisse le modèle par défaut pour commencer.
4. Lance la simulation et consulte la partie texte enrichie.

### Étape 6 — En cas d’erreur
- Clé invalide : régénère une clé.
- Limites/quota : vérifie ton plan dans la console Groq.
- Modèle introuvable : reviens au modèle par défaut de la page.

---

## 🛡️ Bonnes pratiques (très important)

- La page est une **simulation locale non officielle**.
- Toujours croiser avec les informations administratives officielles.
- Teste plusieurs hypothèses (optimiste/réaliste/prudent).
- Ne partage pas ta clé API publiquement.

---

## 🧪 Méthode conseillée pour bien utiliser la page

1. **Run 1 (base)** : valeurs par défaut + ton rang réel.
2. **Run 2 (prudent)** : augmente tension, baisse attractivité favorable.
3. **Run 3 (optimiste)** : scénario inverse.
4. Compare les 3 résultats :
   - zones stables ;
   - zones très variables ;
   - décisions robustes.

---

## ❓FAQ rapide

### « Je suis perdu, je commence par quoi ? »
- Remplis seulement : Type de liste, Rang, Base postes.
- Laisse le reste par défaut.
- Lance une simulation, puis ajuste progressivement.

### « Groq est obligatoire ? »
- Non, la simulation locale fonctionne sans Groq.
- Groq améliore surtout les explications textuelles.

### « La simulation est-elle officielle ? »
- Non. C’est un outil d’aide local.

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [`LICENSE`](./LICENSE).

---

## 🧰 Maintenance (si tu modifies la page)

- Travaille dans un éditeur simple (VS Code recommandé).
- Fais de petites modifications et teste souvent dans le navigateur.
- Conserve les noms de champs cohérents pour éviter de casser les scripts.

Bon usage 👊
