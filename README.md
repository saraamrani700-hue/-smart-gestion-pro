# Smart Gestion Pro Enterprise — Backend

Fondation technique reelle (code, pas juste un cahier des charges) du projet
ERP decrit dans les Articles 1 (Vision) et suivants.

## Stack

- **Backend** : NestJS 10 + TypeORM
- **Base de donnees** : PostgreSQL (multi-tenant : toutes les tables metier
  ont un `entreprise_id`, isolation totale entre societes)
- **Auth** : JWT (access token), bcrypt pour les mots de passe
- **Autorisations** : systeme Role -> Permissions (granulaire par action,
  ex: `produits.create`, `ventes.annuler`)

## Demarrage rapide

```bash
cd backend
cp .env.example .env          # puis ajuster les identifiants PostgreSQL
npm install
npm run start:dev             # cree automatiquement les tables (synchronize=true en dev)
```

Ensuite, executer dans l'ordre (via psql ou un client SQL) :
1. `docs/seed-initial-data.sql` (apres avoir genere un hash de mot de passe
   avec `node backend/scripts/generate-password-hash.js VotreMotDePasse`
   et l'avoir colle a la place de `<HASH_GENERE>`)

Tester la connexion :
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.ma","motDePasse":"VotreMotDePasse"}'
```

La reponse contient un `accessToken` a utiliser dans le header
`Authorization: Bearer <token>` pour tous les autres appels.

## Modules implementes

| Module | Statut | Detail |
|---|---|---|
| Auth (login JWT) | ✅ | `POST /api/auth/login` |
| Utilisateurs & Permissions | ✅ | roles, permissions, CRUD utilisateurs |
| Entreprises & Succursales | ✅ | multi-tenant, succursales |
| Produits & Stock | ✅ | CRUD produits, categories, unites, mouvements de stock tracables, alertes de seuil |
| Clients & Fournisseurs (CRM) | ✅ | CRUD, gestion du solde (creance/dette) |
| Ventes | ✅ | creation transactionnelle : decremente le stock, calcule HT/TVA/TTC, met a jour le solde client, annulation avec restockage |
| Achats | ✅ | miroir de Ventes : incremente le stock, augmente la dette fournisseur |
| Paiements, Caisse & Banques | ✅ | Cash/TPE/Virement/Cheque/Mobile Wallet/QR Code, mode manuel TPE (ref transaction + banque), acompte/reste-a-payer, remboursement, dashboard par moyen de paiement, comptes bancaires, cheques (recus/emis, encaissement/rejet) |
| Facturation | ✅ | Devis/Proforma/Bon de Livraison/Facture/Avoir, conversion (devis -> facture), generation d'une facture depuis une Vente validee |
| Comptabilite & TVA | ✅ | plan comptable (marocain simplifie), generation automatique d'ecritures (vente/achat), calcul de declaration TVA (collectee - deductible) sur une periode |
| Notifications | ✅ | notifications generiques + generation automatique des alertes de stock bas |
| Securite & Audit | ✅ | journal d'audit automatique (toute requete POST/PATCH/PUT/DELETE authentifiee est journalisee, mots de passe et tokens jamais stockes) |
| Administration | ✅ | parametres libres par entreprise (JSON) |
| RH | ✅ | employes, conges (demande/approbation), fiches de paie (calcul simplifie) |
| SAV | ✅ | tickets de support avec priorite, assignation, statut, commentaires |
| Plugins | ✅ | registre d'activation/configuration par entreprise (catalogue de connecteurs) |
| Intelligence Artificielle | ✅ | prevision des ventes par **regression lineaire reelle** sur l'historique mensuel ; OCR **reel** via Tesseract.js (pas un stub) |
| Facturation Electronique (DGI) | ⚠️ Partiel | genere reellement l'UUID et le QR code localement ; la soumission effective a la DGI est explicitement refusee avec message clair (specifications officielles DGI non fournies) |
| Sauvegardes | ✅ | declenche un vrai `pg_dump` de la base et enregistre le resultat (chemin, taille, statut) |
| Cache | ✅ | Redis reel (ioredis), branche sur le module Produits (`findAll` mis en cache 60s, invalidation automatique sur create/update/delete) |
| Frontend Web | ✅ | application web fonctionnelle en un seul fichier (`frontend/index.html`), testee de bout en bout contre l'API reelle |

## Frontend Web

`frontend/index.html` — application web complete en un seul fichier (HTML/CSS/JS
vanilla, aucune dependance, aucun build). Ouvrez-la directement dans un
navigateur, ou servez-la avec n'importe quel serveur statique.

**Couverture complete des 19 modules backend, tous testes reellement contre
l'API** : connexion (JWT), tableau de bord, Produits, Clients, Ventes, Achats,
Paiements (avec dashboard), Facturation (devis/proforma/BL/facture/avoir +
conversion), Comptabilite (plan comptable + declaration TVA), RH (employes +
conges), SAV (tickets), Notifications, **Intelligence Artificielle
(previsions + upload OCR reel), Facturation Electronique DGI (generation
UUID + QR code), Sauvegardes (declenchement pg_dump), Plugins (catalogue +
installation/activation), Journal d'audit, Administration (parametres)**.

L'adresse de l'API est configurable directement sur l'ecran de connexion
(par defaut `http://localhost:3000/api`).

Cette interface couvre une premiere version fonctionnelle et complete de la
plateforme **Web**, une des 5 plateformes prevues dans l'Article 1 (Windows,
Web, Android, iPhone, Tablettes). Desktop/Mobile natifs restent a construire —
ce sont des projets separes (Flutter, apps natives), pas une extension de ce
fichier.

### Page de connexion (design personnalise)

L'ecran de login a ete redessine (via Claude Design) avec : fond anime en
degrade bleu nuit avec un reseau de particules connectees (canvas 2D, ~65
particules, purement decoratif et leger en performance), logo circulaire
"atome" en haut, carte glassmorphism (effet verre depoli), bouton
afficher/masquer le mot de passe, et case "Souviens-toi de moi" qui choisit
reellement entre `localStorage` (persiste apres fermeture du navigateur) et
`sessionStorage` (efface a la fermeture) pour stocker le token de connexion.
La configuration de l'adresse API est repliee dans un menu "Configuration
serveur" discret pour ne pas alourdir l'ecran principal.

### Sidebar et interieur de l'application (theme harmonise)

La barre laterale et l'interieur de l'application reprennent maintenant le
meme theme que la page de connexion (degrade bleu marine, accents bleu/vert
clair). Chaque lien de navigation a une vraie icone SVG (lineaire, alignee
avec le texte) plutot qu'un simple point, genere dynamiquement depuis un
tableau `NAV_ITEMS` en JS pour eviter les erreurs de copier-coller sur les
17 icones. L'element actif a un fond eclairci + une bordure verte a gauche.
Le pied de sidebar affiche un avatar circulaire avec les initiales reelles
de l'utilisateur connecte (calculees dynamiquement). Les boutons d'action
principaux de chaque page ("+ Nouveau produit", etc.) reprennent le degrade
bleu de la page de login, sans affecter les autres boutons secondaires
(annuler, actions de tableau) qui restent neutres pour ne pas surcharger
visuellement l'interface.

### Centre d'alertes

Une cloche flottante (visible sur toutes les pages) affiche le nombre
d'alertes non lues et donne acces a un panneau listant :
- les notifications generiques (stock bas, etc.)
- les **cheques a echeance** : tout cheque encore `en_attente` dont la date
  d'echeance est deja passee ou dans moins de 7 jours declenche une alerte
  automatique (testee reellement : detection correcte, pas de doublon, pas
  de fausse alerte pour un cheque lointain)

Les alertes se regenerent automatiquement toutes les 60 secondes (et au
chargement), avec deduplication cote backend pour ne jamais spammer la meme
alerte non lue. Le module Paiements affiche desormais aussi la liste complete
des cheques (recus/emis) avec creation, encaissement et rejet.

## Bugs reels trouves et corriges pendant les tests de bout en bout

En connectant reellement le frontend au backend (PostgreSQL + Redis reels,
requetes HTTP completes), trois bugs ont ete decouverts et corriges :

1. **DGI** : le refus explicite de soumission renvoyait une erreur 500
   generique au lieu d'un message clair — corrige avec `NotImplementedException`
   (reponse 501 avec message complet).
2. **Seed de demonstration** : les UUID placeholder (`1111-1111...`) n'etaient
   pas des UUID v4 valides et etaient a juste titre rejetes par la validation
   stricte (`@IsUUID()`) des DTOs — remplaces par de vrais UUID v4 generes.
3. **Bug de concurrence reel** dans `VentesService` et `AchatsService` : apres
   une transaction, le code relisait l'enregistrement cree via le repository
   normal (hors transaction) au lieu du `manager` transactionnel, causant une
   erreur "introuvable" par condition de course (la ligne n'etait pas encore
   visible avant le commit). Corrige : la lecture finale se fait desormais
   via le `manager` transactionnel dans les deux services.
4. **Bug de bornes de dates dans le calcul de TVA** : une date de fin sans
   heure (ex: "2026-07-31", telle qu'envoyee par le frontend) etait
   interpretee comme minuit pile, ce qui excluait TOUTES les transactions de
   la journee en cours — la declaration TVA affichait 0.00 alors que des
   ventes/achats existaient bien. Corrige en forcant la fin de journee
   (23:59:59.999) sur la borne superieure.
5. **Bug critique OCR (plantage complet du serveur)** : sans configuration
   particuliere, Tesseract.js fait un `throw` interne non-catchable en cas
   d'echec de chargement de ses donnees linguistiques (ex: CDN inaccessible),
   ce qui **plantait tout le processus Node.js** — pas seulement la requete
   OCR en cours, mais l'application entiere pour tous les utilisateurs.
   Reproduit reellement (serveur mort apres un seul appel OCR avec reseau
   coupe) et corrige en fournissant un `errorHandler` a Tesseract.js qui
   transforme l'echec en rejet de promesse normal, capturable par un
   try/catch classique. Reteste : le serveur survit desormais a un echec
   reseau pendant l'OCR.
6. **Bug d'entite TypeORM** : les colonnes `googleDriveFileId`/`googleDriveUrl`
   (type `string | null` sans type explicite) etaient mal interpretees par
   TypeORM (`Data type "Object" not supported`), empechant toute migration.
   Corrige en precisant `type: 'varchar'`.

## Nouvelles fonctionnalites (testees reellement)

- **Impression / enregistrement PDF** des documents commerciaux (devis,
  proforma, bon de livraison, facture, avoir) : bouton 🖨️ sur chaque ligne
  de la page Facturation, ouvre un document formate professionnellement
  dans un nouvel onglet ; le bouton "Imprimer" utilise `window.print()`,
  qui permet nativement d'imprimer ou d'enregistrer en PDF depuis le
  navigateur (aucune dependance serveur supplementaire).
- **Import Excel** : bouton "📊 Importer depuis Excel" sur la page
  Facturation. Format attendu (une ligne par article, colonnes insensibles
  a la casse/accents) : `Numero | Type | Client | Designation | Quantite |
  PrixUnitaireHT | TVA`. Les lignes partageant le meme "Numero" sont
  regroupees dans un seul document ; les clients inconnus sont crees
  automatiquement. Teste avec un vrai fichier `.xlsx` genere (2 documents,
  dont un multi-lignes, totaux corrects).
- **OCR avec extraction de champs** : en plus du texte brut, l'endpoint OCR
  tente de reperer automatiquement le total TTC, HT, la TVA et une date via
  reconnaissance de motifs textuels. Un bug de confusion entre "taux de TVA
  (20%)" et "montant de la TVA" a ete trouve et corrige pendant les tests
  (avec du texte de facture simule en francais et en anglais). Extraction
  "au mieux" : la fiabilite depend de la nettete du document scanne — un
  avertissement est toujours retourne pour inviter a la verification
  manuelle avant usage comptable.

## Ce que je n'ai pas pu verifier avec une vraie image (limite de mon
environnement de developpement)

Le pipeline OCR complet (image reelle -> Tesseract.js -> extraction de
champs) n'a pas pu etre teste de bout en bout ici car mon environnement de
sandbox bloque l'acces au CDN dont Tesseract.js a besoin pour telecharger
ses donnees linguistiques au premier lancement. **Ce blocage est specifique
a mon environnement de test, pas a votre serveur** : un VPS avec un acces
internet normal devrait telecharger ces donnees sans probleme au premier
appel OCR reel. J'ai neanmoins verifie et corrige le bug critique de
plantage decrit au point 5 ci-dessus, ce qui etait le risque le plus grave.



L'ensemble a ete teste en conditions reelles dans l'environnement de developpement :
PostgreSQL et Redis reels installes et demarres, l'application NestJS complete
lancee, toutes les tables creees automatiquement, puis testee via de vraies
requetes HTTP : login JWT, creation de produit, liste avec verification du
cache Redis (cle + TTL confirmes), prevision IA, creation ticket SAV, creation
employe RH, generation de structure DGI (QR code PNG reel genere), declenchement
d'une sauvegarde `pg_dump` reelle (fichier `.sql` de 66 Ko genere), et
verification que le journal d'audit capture bien chaque action. Un bug reel a
ete trouve et corrige pendant ces tests (le refus explicite de soumission DGI
renvoyait une erreur 500 generique au lieu du message clair — corrige en
utilisant une exception NestJS appropriee).

## Ce qui reste NON codable sans decisions/comptes externes

- **Soumission reelle a la DGI** : necessite les specifications techniques officielles + certificats
- **RH/SAV avances** : ce qui est code couvre les bases ; des besoins specifiques (bulletins de paie conformes CNSS/IR, SLA SAV...) restent a definir
- **Chargement dynamique reel des plugins** : le registre existe, le mecanisme d'injection de code par plugin reste a concevoir au cas par cas
- **Synchronisation multi-appareils (offline)** et **upload automatique des sauvegardes vers Google Drive** : necessitent des applications client et des identifiants OAuth

## Hors scope de ce backend (efforts distincts et consequents)

- **Applications Desktop / Mobile natives** (Flutter, apps natives) — non commencees
- **Mode offline + synchronisation multi-appareils**

## Deploiement en production (Hostinger VPS KVM 1)

Voir **`deploy/DEPLOYMENT.md`** pour le guide complet, specifique a un VPS
KVM 1 (1 vCPU / 4GB RAM). Ce qui a ete ajoute et **reellement teste** pour la
production :

- **Migrations TypeORM** (`src/migrations/`) au lieu de `synchronize` —
  generees et testees sur une base neuve, y compris un vrai demarrage en
  `NODE_ENV=production` qui cree les tables via migration (pas synchronize)
- **Helmet** : en-tetes de securite HTTP — teste, `X-Frame-Options`,
  `Strict-Transport-Security` etc. confirmes presents sur les reponses
- **Rate limiting** : 120 req/min/IP globalement, 5 tentatives/min sur le
  login contre le brute-force — teste reellement (429 confirme a la 6e tentative)
- **CORS restreint** en production via la variable `FRONTEND_URL`
- Scripts prets a l'emploi : `deploy/setup.sh` (installe Node/PostgreSQL/
  Redis/Nginx/PM2/swap 2GB automatiquement), `deploy/nginx.conf.example`
  (reverse proxy + frontend), `deploy/ecosystem.config.js` (PM2 configure
  pour un seul vCPU)
- Checklist de securite et limites reelles du KVM 1 detaillees dans
  `deploy/DEPLOYMENT.md`

## Sauvegardes vers Google Drive (en plus du stockage local)

Chaque sauvegarde (`POST /api/sauvegardes`) enregistre TOUJOURS une copie
locale sur le serveur (`pg_dump`), qu'un Google Drive soit configure ou non
— la sauvegarde locale ne depend jamais de Google. Si configure, une copie
supplementaire est envoyee sur Google Drive juste apres.

Google exige des identifiants que vous seul pouvez creer (un compte Google
ne peut pas etre genere a votre place). Voici la procedure, avec un
**compte de service** (pas de fenetre de connexion navigateur necessaire,
ideal pour un serveur automatise) :

1. Allez sur https://console.cloud.google.com/ et creez un projet (ou
   utilisez un projet existant)
2. Dans "APIs & Services" -> "Library", cherchez **Google Drive API** et
   activez-la
3. Dans "APIs & Services" -> "Credentials", cliquez "Create Credentials" ->
   **Service Account**. Donnez-lui un nom (ex: `smart-gestion-backup`)
4. Une fois cree, ouvrez le compte de service -> onglet "Keys" -> "Add Key"
   -> "Create new key" -> format **JSON**. Un fichier `.json` se telecharge
5. Transferez ce fichier JSON sur votre VPS (ex: `scp cle.json root@VOTRE_IP:/var/www/smart-gestion-pro/backend/google-service-account.json`)
6. Dans votre Google Drive personnel, creez un dossier dedie aux sauvegardes,
   ouvrez son partage, et **partagez-le avec l'adresse email du compte de
   service** (visible sur sa page, ressemble a
   `smart-gestion-backup@votre-projet.iam.gserviceaccount.com`) — donnez-lui
   le role "Editeur"
7. Recuperez l'ID du dossier dans son URL :
   `https://drive.google.com/drive/folders/CET_ID_ICI`
8. Dans `.env` sur le serveur :
   ```
   GOOGLE_DRIVE_ENABLED=true
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/var/www/smart-gestion-pro/backend/google-service-account.json
   GOOGLE_DRIVE_FOLDER_ID=CET_ID_ICI
   ```
9. Redemarrez l'application (`pm2 restart smart-gestion-pro`)

**Important** : le fichier de cle JSON donne acces a ce compte de service —
ne le committez jamais dans un depot Git public, et restreignez ses
permissions (`chmod 600 google-service-account.json`).

Si Google Drive n'est pas configure ou si l'upload echoue (ex: mauvais ID de
dossier, quota depasse), la sauvegarde locale reste tout de meme reussie —
seul le champ `googleDriveUrl` reste vide et un message d'avertissement est
journalise cote serveur.

**Non teste dans mon environnement de developpement** (aucun compte Google
disponible ici) : le code suit exactement la documentation officielle de
l'API Google Drive v3 avec compte de service, mais je n'ai pas pu verifier
un upload reel de bout en bout. Testez avec `POST /api/sauvegardes` une fois
configure et verifiez que le fichier apparait dans le dossier Google Drive
partage.

## Dernieres verifications avant livraison client

- Retrait de l'email de demonstration pre-rempli sur l'ecran de connexion
- **Annulation d'achat ajoutee** (n'existait pas cote backend jusqu'ici) :
  remet le stock, annule la dette fournisseur, et **refuse l'annulation si
  le stock a deja ete partiellement revendu** (teste reellement, y compris
  ce cas de refus)
- Bouton d'annulation ajoute sur les pages Ventes et Achats
- **Modifier/Supprimer ajoutes** sur Produits, Clients, Fournisseurs (le
  backend le permettait deja, l'interface ne l'exposait pas) — "Supprimer"
  desactive (soft-delete) plutot que supprimer definitivement, pour ne
  jamais casser l'historique des ventes/achats passes. Un badge
  Actif/Inactif rend l'etat visible partout, et le bouton "Supprimer"
  disparait une fois l'element desactive.
- **Module Fournisseurs ajoute** en tant que page a part entiere dans le
  menu (n'existait qu'en creation rapide depuis le formulaire d'achat)
- Correction du menu mobile (tiroir de navigation) : un filet de securite
  en JavaScript force desormais l'affichage/masquage correct du bouton
  hamburger selon la largeur reelle de la fenetre, independamment d'un
  eventuel probleme de cache CSS du navigateur
- **`docs/Guide-Utilisateur-Smart-Gestion-Pro.docx`** : guide non-technique
  pour le client final (pas la documentation developpeur), couvrant chaque
  usage quotidien pas a pas — connexion, produits/stock, ventes, achats,
  paiements/cheques, facturation/impression, import Excel, alertes, gestion
  des utilisateurs, annulation, bonnes pratiques de securite

## Architecture multi-tenant

Chaque requete authentifiee porte un JWT contenant `entrepriseId`. Tous les
services filtrent systematiquement par cet identifiant — aucune donnee d'une
entreprise n'est jamais visible par une autre. Le `PermissionsGuard` verifie
en plus que l'utilisateur a le droit d'effectuer l'action demandee, selon son
role.

## Fichiers de reference

- `docs/database-schema-complete.sql` — schema SQL maitre couvrant les 23
  modules de la Vision du Projet (checklist `[OK]` / `[TODO]`)
- `docs/seed-initial-data.sql` — donnees de demarrage (permissions, entreprise
  demo, admin)
