# Gérer les conflits : roulette de situations et fiches par rôle

Outil web statique (HTML, CSS, JavaScript natif) pour animer, en présentiel, des mises en situation de gestion de conflit. Il reprend l'architecture des plateformes précédentes (liens et QR codes, fiches confidentielles par rôle, grille d'observation à tuiles) avec un démarrage ludique : **une roulette de type bandit manchot** distribue la situation et les rôles.

Aucun serveur, aucun compte, aucune base de données, aucune bibliothèque externe, aucun cookie, aucun outil d'analyse. Les QR codes sont générés localement (`qr.js`).

---

## 1. Contenu pédagogique

### Ce qui vient du support « Simulations_gestion_conflits_J3 »
- le **cadre de jeu** en cinq temps : Qualifier, Sécuriser, Choisir, Conduire, Contractualiser, avec l'enjeu (« Ne pas rechercher un coupable… ») et la règle (7 minutes, stratégie explicitée avant de conclure) ;
- les **six situations** : famille, titre, contexte, décisions à prendre, repères pour agir, réplique ;
- le **conseil formateur** : projeter le contexte commun uniquement, distribuer les briefs privés par lien ou QR code, déroulé 1 + 2 + 7 + 6 + 3 minutes, décision finale et suivi daté, rejeu court.

### Ce qui a été rédigé pour l'outil (à relire)
- les **fiches confidentielles des collaborateurs** (le support n'en contient pas) : profil, vécu, attentes, réplique d'ouverture (celle du support quand elle existe), façon de réagir selon l'attitude du manager ;
- la **grille d'observation universelle** (13 critères, groupés selon les cinq temps du cadre de jeu) ;
- les **questions de débriefing** (formulées à partir des intitulés du support : auto-retour, vécu du rôle, faits observés) et les textes d'aide.

### Les six situations et leurs rôles

| N° | Situation | Rôles joués | Participants compatibles |
|---|---|---|---|
| 01 | La rétention d'information | Manager, collaborateur 1, collaborateur 2 | 3 ou 4 |
| 02 | L'expert qui conteste le manager | Manager, collaborateur 1 | 2 ou 3 |
| 03 | La bataille de la reconnaissance | Manager, collaborateur 1, collaborateur 2 | 3 ou 4 |
| 04 | Le conflit hybride | Manager, collaborateur 1 (à distance), collaborateur 2 (sur site) | 3 ou 4 |
| 05 | Le planning devenu personnel | Manager, collaborateur 1, collaborateur 2 | 3 ou 4 |
| 06 | Le signalement de propos répétés | Manager, collaborateur 1 | 2 ou 3 |

L'**observateur** est un participant s'il en reste un ; sinon, c'est le **formateur**. Dans les deux cas, un QR code « Observateur » ouvre la grille.

---

## 2. Parcours de l'animateur (trois étapes)

1. **Les participants** : saisie du nombre de participants (le formateur n'est pas compté), puis des prénoms.
2. **La roulette** : le levier lance les rouleaux. Un rouleau désigne la **situation**, puis un rouleau par participant s'arrête sur son **rôle**. Le tirage est calculé et vérifié avant l'animation, puis révélé.
3. **Les QR codes et l'animation** : sous le tableau des rôles, un **QR code par rôle** (manager, collaborateur 1, collaborateur 2 si prévu, observateur). Une section d'animation minutée suit le support : Projeter (1 min), Distribuer (2), Simuler (7), Débriefer (6), Rejouer (3).

Autres pages : **Situations et fiches** (aperçu des 22 fiches pour le formateur), **Aide**, et **Paramètres** (roue crantée en haut à gauche : adresse du site, remises à zéro).

---

## 3. Règles du tirage et cohérence

| Participants (par table) | Situations tirées | Observateur |
|---|---|---|
| 2 | 02, 06 | Formateur |
| 3 | les six | Participant (02, 06) ou formateur (01, 03, 04, 05) |
| 4 | 01, 03, 04, 05 | Participant |
| 5 et plus | sous-groupes de 2 à 4 | selon la table |

- Un participant a **un seul rôle** et **tous les rôles joués sont affectés**.
- La roulette ne tire que des situations **compatibles avec le nombre de participants** : 1 participant est refusé, 2 à 4 forment une table, au-delà des **tables** de 2 à 4 sont composées au hasard (par exemple 7 : 4 + 3 ; 9 : 3 + 3 + 3). Chaque table tire sa situation. Avec plusieurs tables, un observateur participant est privilégié, car le formateur ne peut pas observer partout.
- Les situations déjà tirées sont évitées tant qu'il en reste d'autres. L'**historique** évite de redonner à une personne un rôle déjà tenu, le rôle de manager en priorité.
- Après chaque tirage, la console affiche cinq **contrôles de cohérence** : un seul rôle par personne ; tous les participants affectés ; tous les rôles joués pourvus ; nombre de participants cohérent avec la situation (et observateur participant ou formateur) ; **chaque lien ouvre la situation tirée avec les informations de son rôle**. Si un contrôle échoue, les QR codes ne sont pas affichés.
- Les saisies sont contrôlées : nombre entre 2 et 24, prénoms non vides, pas de doublon (accents et casse ignorés).

---

## 4. Ce que voit chaque rôle

Chaque QR code ouvre une page unique, **cohérente avec la situation tirée** :

| Rôle | Contenu |
|---|---|
| **Manager** | contexte commun, mission (7 minutes, stratégie explicitée, **décision finale et suivi daté**), décisions à prendre, cadre de jeu, chronomètre de 7 minutes |
| **Collaborateur 1 / 2** | contexte commun, **fiche confidentielle** de son personnage, réplique d'ouverture, règles de jeu communes, réactions selon l'attitude du manager |
| **Observateur** | contexte commun, **repères pour agir** de la situation, cadre de jeu, **grille d'observation universelle** (13 critères), champs de notes |

Un manager ne voit ni la fiche d'un collaborateur, ni les repères ; un collaborateur ne voit ni les décisions du manager, ni la fiche de l'autre collaborateur ; l'observateur ne voit aucune fiche de collaborateur. Ces garde-fous sont vérifiés pour les 22 combinaisons situation × rôle. Un lien incohérent (par exemple le collaborateur 2 de la situation 02) affiche un message clair.

**À la projection :** seul le contexte commun est affiché. Les repères pour agir n'apparaissent qu'au débriefing, à la demande.

**Grille d'observation** : 13 critères en cinq groupes (Qualifier 2, Sécuriser 2, Choisir 2, Conduire 4, Contractualiser 3), sous l'amorce « Le manager… ». Chaque tuile a un **+** et un **−** (1 clic : observé une fois ; jusqu'à 5 : renforcé ; jauge et compteur « ×n »). Rien n'oblige à tout renseigner. Les notes sont conservées sur l'appareil, séparément pour chaque situation.

---

## 5. Structure des fichiers

```
gestion-conflits/
├── index.html   Page unique (structure, accessibilité, roue crantée, confirmation)
├── styles.css   Mise en forme responsive (couleurs modifiables en tête de fichier)
├── app.js       Outils communs, validation des liens, pages de rôle
├── console.js   Console animateur : saisie, tirage, roulette, QR, animation, paramètres, aide
├── qr.js        Générateur de QR codes autonome (norme QR Code, niveau de correction M)
├── data.js      Contenus : situations, fiches, grille, déroulé, débriefing
└── README.md    Ce document
```

Format d'un lien de rôle : `index.html?s=<situation>&r=<rôle>&n=<prénom>&t=<table>`, avec `r` parmi `m` (manager), `c1`, `c2`, `o` (observateur). `n` et `t` sont facultatifs. Sans paramètre, la console s'affiche.

---

## 6. Test local et déploiement

**Test local.** Ouvrez `index.html` (console) ou, pour une fiche, `index.html?s=3&r=m`. Depuis un fichier local, les QR codes pointent vers `file://…` et ne fonctionnent pas sur d'autres appareils.

Avec un petit serveur : `python3 -m http.server 8000`, puis `http://localhost:8000/`.

**GitHub Pages.**
1. Créez un dépôt **public** (nom conseillé : `gestion-conflits`).
2. Déposez les sept fichiers à la **racine** (Add file → Upload files), puis **Commit changes**.
3. **Settings → Pages** : *Deploy from a branch*, branche `main`, dossier `/ (root)`, **Save**.
4. Après une à deux minutes : `https://<compte>.github.io/gestion-conflits/`. Ouvrez cette adresse : la console fabrique elle-même les liens et les QR codes.

Ce site est indépendant des précédents. Les clés de stockage sont distinctes (`gestion-conflits-…`) : aucune interférence, même sur un même compte GitHub.

---

## 7. Modifier les contenus (`data.js`)

- **Une situation** : `famille`, `titre`, `contexte`, `decisions`, `reperes`, `citation`, et `acteurs` (`c1`, et `c2` s'il y a deux collaborateurs). **Le nombre de participants compatibles se déduit automatiquement** de la présence de `c2` : retirer `c2` fait passer la situation à « 2 ou 3 participants ».
- **Une fiche de collaborateur** : `titre`, `profil`, `vecu`, `veut`, `ouverture`, `jeu`.
- **Ajouter une situation** : copier un bloc de `situations` avec un nouvel `id`/`num`. Elle entre dans le tirage et dans la page « Situations et fiches ».
- **Grille** : `grille.groupes` et `criteres` (`id` stable ; changer un `id` perd les notes déjà enregistrées). Champs de notes : `champsObservateur`.
- **Cadre de jeu, règle, déroulé, durée** : `cadre`, `deroule`, `dureeSimulation` (secondes).
- **Débriefing** : `debrief`. **Règles communes des collaborateurs** : `reglesCollab`.

Respectez la syntaxe JavaScript (guillemets, virgules) et testez en local après chaque modification.

---

## 8. Remise à zéro

- **Console** (Paramètres) : effacer l'historique des tirages, ou tout effacer (participants, tirages, adresse du site).
- **Observateur** : « Effacer mes observations » sur sa fiche.
- **En développement** (F12, onglet *Application*, *Local Storage*) : clés `gestion-conflits-console-v1`, `gestion-conflits-admin-v1`, `gestion-conflits-obs-v1:<situation>`.

---

## 9. Limites

- **Le cloisonnement est pédagogique, pas informatique.** L'interface n'affiche que le contenu du rôle du lien, mais un site statique envoie tous les fichiers au navigateur : le code source (`data.js`) ou la modification de l'adresse donnent accès aux autres fiches. La console n'est pas protégée. L'exercice repose sur la bonne foi des participants.
- **Prénoms dans les liens** : ils figurent dans l'adresse, donc dans les journaux de l'hébergeur du site. Utilisez des prénoms d'usage si cela pose problème.
- **Pas de synchronisation entre appareils** : la console garde les participants et les tirages sur l'appareil de l'animateur ; chaque participant garde ses notes sur son appareil. En navigation privée ou après effacement des données du site, tout repart à zéro.
- **Un même observateur pour plusieurs tables** : ses notes sont enregistrées par situation et par appareil, pas par table.
- **Chronomètres** locaux, facultatifs, sans son ; ils repartent à zéro si la page est actualisée.
- **Situation 06** (signalement de propos répétés) : touche à un risque humain réel. Posez le cadre du jeu de rôle, laissez chacun libre de sortir du rôle, évitez de rejouer un vécu personnel ; l'alerte réelle suit les procédures de votre organisation. L'outil le rappelle au tirage.
- **Animation de la roulette** : elle est désactivée (résultat immédiat) pour les personnes ayant demandé de réduire les animations dans leur système. Aucun son n'est produit.
- Les fiches des collaborateurs sont des **textes rédigés pour l'outil** à partir des contextes du support : relisez-les et adaptez-les à votre public.

---

## Checklist de test

**Console**
- [ ] Saisie : nombre hors limites, prénom vide et doublon sont refusés avec un message clair.
- [ ] Avec 2, 3 et 4 participants, seules les situations compatibles sont tirées (2 : 02 et 06 ; 4 : 01, 03, 04, 05).
- [ ] Avec 5 participants ou plus, des tables sont formées ; chaque table tire sa situation.
- [ ] La roulette s'anime, les rouleaux s'arrêtent sur la situation puis sur le rôle de chacun.
- [ ] Les cinq contrôles de cohérence sont « Vérifié » ; un seul rôle par personne.
- [ ] Un QR code par rôle sous le tableau des rôles ; l'observateur est le formateur quand il n'y a pas de participant disponible.
- [ ] Scanner un QR code ouvre la bonne situation et le bon rôle (comparer avec le tirage).
- [ ] Projeter la console : seul le contexte commun apparaît.
- [ ] Animation : cinq étapes avec les durées du support ; repères pour agir révélés à la demande.
- [ ] Situations et fiches : 22 liens ; Paramètres : adresse du site ; Aide.

**Fiches**
- [ ] Manager : décisions, cadre de jeu, chronomètre 7 min ; aucune fiche de collaborateur.
- [ ] Collaborateur : sa fiche seulement, bandeau de confidentialité.
- [ ] Observateur : repères, grille de 13 critères, notes conservées après actualisation.
- [ ] Lien incohérent (par exemple `?s=2&r=c2`) : message clair.

**Général**
- [ ] Smartphone : roulette lisible sur une ligne, boutons faciles à toucher.
- [ ] Chrome, Edge, Safari mobile, console ouverte : aucune erreur.
- [ ] Parcours au clavier seul : le focus reste visible.
