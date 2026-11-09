# Tsumiki 積

Jeu de blocs pour Android dans l'esthétique de la série : fond bleu nuit, blocs blanc cassé, lignes effacées en bordeaux. « Tsumiki » signifie « blocs de construction » en japonais.

## Installer l'application sur le téléphone

1. Sur ton téléphone, ouvre la page **Releases** de ce dépôt (colonne de droite sur GitHub, ou `…/tsumiki/releases`).
2. Dans la dernière version, touche le fichier `tsumiki-1.0.X.apk` pour le télécharger.
3. Ouvre le fichier téléchargé. Android demande d'autoriser l'installation depuis cette source : accepte, puis touche **Installer**.
4. Si Google Play Protect affiche un avertissement (« application inconnue »), choisis **Installer quand même**. C'est normal pour une appli qui ne vient pas du Play Store.

Les mises à jour s'installent par-dessus l'ancienne version sans perdre la partie en cours ni les records.

## Le jeu

- **Règles** : faire glisser les trois pièces proposées sur le plateau (elles ne tournent pas) ; une ligne ou une colonne complète s'efface et rapporte des points. Quand les trois pièces sont posées, trois nouvelles arrivent ; la partie s'arrête quand plus aucune pièce ne rentre.
- **Points** : un point par case posée, et pour les lignes effacées 10 × (nombre de lignes)², plus un bonus de **série** quand on efface des lignes plusieurs coups de suite (la série s'arrête après 3 coups sans ligne).
- **3 modes** : Défi 7×7 (surtout de grandes pièces, sans garantie qu'une pièce rentre), Classique 8×8, Grand 10×10, avec un record par mode.
- Aperçu de la pose et des lignes qui vont s'effacer pendant le glissement, pièces qui ne rentrent plus estompées, mode clair / sombre, sauvegarde automatique de la partie. Fonctionne hors connexion.

## Structure

- `src/` : sources de l'appli. `core.js` (noyau commun à la série : accueil, niveaux, zoom, indices, records, thème), `template.html`, les fichiers du jeu, `app.json` (nom, kanji). `python3 src/build.py` assemble `www/index.html` (APK, polices incluses) et `preview.html` (version web).
- `assets/` : icône et écran de démarrage (sources des images générées dans `android/`).
- `android/` : projet Android généré par Capacitor, signé avec une clé fixe pour que les mises à jour s'installent par-dessus.
- `.github/workflows/build-apk.yml` : compile l'APK et le publie dans les Releases à chaque modification sur `main` (ou à la demande depuis l'onglet **Actions**).

## Modifier l'appli

Modifier les fichiers de `src/`, lancer `python3 src/build.py`, puis tester dans un navigateur : servir le dossier `www/` (par exemple `python3 -m http.server` dans `www/`) et ouvrir la page en mode mobile.
