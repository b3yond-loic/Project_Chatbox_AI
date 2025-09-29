# Project_Chatbox_AI
Une assistante IA avec un acces internet.

# 🤖 Project Chatbot AI

## Introduction

Ce projet est un chatbot simple qui utilise l'intelligence artificielle pour répondre à vos questions. Il se connecte à l'API de **Google Gemini** pour générer des réponses en temps réel, offrant ainsi une expérience de conversation fluide et intelligente. Il peut aussi faire des recherches internet afin d'optenir des resultats à jour, et repondre à tout les genres de demandes.

---

## Technologies et Outils

Les technologies suivantes sont utilisées pour la création de ce chatbot :

-   **Tauri** : Un framework qui permet de créer des applications de bureau multi-plateformes en utilisant des technologies web (HTML, CSS, JavaScript).
-   **Node.js** : Un environnement d'exécution JavaScript côté serveur. Il est essentiel pour faire fonctionner l'API de notre chatbot.
-   **Express.js** : Un framework web pour Node.js. Il est utilisé pour créer l'API qui communique entre l'application de bureau et l'IA de Gemini.
-   **@google/generative-ai** : La librairie officielle de Google pour interagir avec l'API Gemini.
-   **Visual Studio Code** : Un éditeur de code. Il est recommandé d'utiliser Visual Studio Code pour ce projet.

---

## Installation et Démarrage

Suivez ces étapes pour installer et lancer l'application.

### Étape 1 : Prérequis

Assurez-vous que les logiciels suivants sont installés sur votre machine :
1.  **Node.js** : [Télécharger Node.js](https://nodejs.org/fr/download)
2.  **Visual Studio Code** : [Télécharger Visual Studio Code](https://code.visualstudio.com/download)
3.  **Rust** : Le langage de programmation sur lequel Tauri est basé. Installez-le avec le guide officiel : [Installation de Rust](https://www.rust-lang.org/tools/install)
4.  **Tauri CLI** : Le client en ligne de commande de Tauri.
    ```bash
    npm install -g @tauri-apps/cli
    ```

### Étape 2 : Configuration du Projet

1.  Clonez ce dépôt Git sur votre machine. [https://github.com/b3yond-loic/Project_Chatbox_AI.git]
    ```bash
    git clone [https://github.com/b3yond-loic/Project_Chatbox_AI.git]
    ```
2.  Allez dans le dossier du projet et installez les dépendances nécessaires.
    ```bash
    cd [NOM_DE_TON_PROJET]
    npm install
    ```
3.  Allez dans le dossier de l'API et installez les dépendances.
    ```bash
    cd [NOM_DE_TON_DOSSIER_API]
    npm install express
    npm install cors
    npm install @google/generative-ai
    ```

### Étape 3 : Création de la Clé API

1.  Allez sur [Google AI Studio](https://aistudio.google.com/app/apikey) et connectez-vous.
2.  Créez une nouvelle clé API et copiez-la.
3.  Ouvrez le fichier `serveur.js` dans votre éditeur de code et remplacez `'VOTRE_CLÉ_API'` par votre clé.

### Étape 4 : Lancement de l'Application

1.  Dans le dossier de votre API (`serveur.js`), lancez le serveur :
    ```bash
    node serveur.js
    ```
2.  Ouvrez un nouveau terminal, allez à la racine de votre projet et lancez l'application Tauri :
    ```bash
    npm run tauri dev
    ```

---

## Accès à Internet et à l'IA

Ce projet a besoin d'un accès à Internet pour que l'IA puisse générer des réponses. Voici comment cela fonctionne :
1.  **Votre Serveur Local** : Le fichier `serveur.js` que vous lancez est une API locale sur votre machine. Il agit comme un pont entre votre application de bureau et l'IA de Google.
2.  **L'API de Google Gemini** : Lorsque votre serveur local reçoit un message, il envoie une requête via Internet à l'API de Google Gemini.
3.  **Le Moteur de l'IA** : Le modèle **`gemini-1.5-flash`** (ou tout autre modèle que vous avez choisi) est hébergé sur les serveurs de Google. C'est ce modèle qui accède à Internet pour trouver des informations et formuler sa réponse, puis la renvoie à votre serveur local.

Votre application n'a donc pas besoin d'une connexion Internet directe, car le serveur s'occupe de la communication avec l'API.
