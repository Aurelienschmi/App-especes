# App Especes

## Table des matières
- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [APIs utilisées](#apis-utilisées)
- [Auteurs](#auteurs)
- [Homepage](#homepage)
- [Documentation](#documentation)

## Description
App Especes est une application Node.js qui permet d'afficher la liste des pays dans un ordre alphabétique avec leurs noms en français. Lorsqu'un pays est sélectionné, l'application affiche la liste des espèces menacées dans ce pays, ainsi que leur niveau de menace.

## Fonctionnalités
- Récupération de la liste des pays par ordre alphabétique avec leurs noms en français.
- Affichage des espèces menacées pour un pays sélectionné.
- Affichage du niveau de menace de chaque espèce.
- Affichage du nom scientifique (latin) de chaque espèce.
- Affichage du nom français des espèces si disponible.

## Prérequis
- npm >= 5.5.0
- node >= 9.3.0

## Installation
```sh
npm install
npm install --save-dev nodemon
```

## Démarrage
```sh
npm run dev
```

## APIs utilisées
L'application repose sur deux APIs pour récupérer les données nécessaires.

## Auteurs
- Maxime Labbe (@Maxime-Labbe)
- Charles Belot (@Charly-miaouu)
- Alexis Hazebrouck (@Alexis-aka-Yazm)
- Mathis Dacacio (@MathisDacacio)

## Homepage

Une fois le serveur allumé, le voir ici:

http://localhost:3000/

## Documentation

### Description
Ce composant permet de sélectionner un pays via un menu déroulant. Lorsqu'un pays est sélectionné, une liste d'espèces menacées spécifiques à ce pays s'affiche. Chaque espèce est accompagnée de son nom et de son niveau de menace.

### Fonctionnalités
- Affichage d'une liste de pays sous forme de menu déroulant.
- Sélection dynamique : Lorsqu'un pays est sélectionné, les espèces menacées correspondantes s'affichent.
- Informations fournies pour chaque espèce :
    - Nom de l'espèce
    - Niveau de menace (ex. Vulnérable, En danger, En danger critique, etc.)
### Utilisation
- Sélectionner un pays dans le menu déroulant.
- Les espèces menacées du pays choisi s'affichent dynamiquement.
- L'utilisateur peut consulter les informations sur chaque espèce et son niveau de menace.


### Modifications

Nous avons modifié l'arborescence du projet pour qu'il soit plus lisible.
Nous avons terminé l'issue 8
Nous avons aujouté des actions de test Github
Nous avons supprimé les fichiers inutiles
