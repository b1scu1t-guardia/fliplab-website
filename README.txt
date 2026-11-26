Flip.lab - site Flipper Zero (animation 3D au scroll)

Site 100 % statique : double-cliquez sur index.html pour l'ouvrir, ou hebergez-le sur GitHub Pages.

Fichiers
- index.html : pages (accueil, fonctions, fiche technique, contact) et menu hamburger
- css/style.css : couleurs (variables en haut : --o = orange), mise en page
- js/model-data.js : le modele 3D encode dans le fichier
- js/viewer.js : affichage 3D, ecran et boutons du Flipper
- js/main.js : scroll, compteurs, menu, navigation entre pages
- js/three.min.js + GLTFLoader.js : three.js r128
- assets/flipper_zero.glb : modele d'origine
- .nojekyll : evite le traitement Jekyll sur GitHub Pages

Hebergement sur GitHub Pages
1. Creer un depot et y envoyer tout le contenu du dossier (index.html a la racine)
2. Settings > Pages > Source : "Deploy from a branch", branche main, dossier / (root)
3. Le site sera disponible sur https://VOTRE-NOM.github.io/NOM-DU-DEPOT/

Navigation sur l'accueil
- Le Flipper s'arrete face a la camera aux 3/4 du scroll. Touchez sa fleche droite pour ouvrir le menu,
  haut/bas pour choisir, rond du milieu pour ouvrir la page, gauche pour revenir. Le clavier marche aussi.
- Pages et libelles du menu : tableau PAGES dans js/viewer.js
