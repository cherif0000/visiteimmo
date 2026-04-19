# Backend — VisiteImmobilier API

API REST construite avec **Node.js**, **Express** et **MongoDB**.

## Structure des fichiers

```
backend/
├── src/
│   ├── server.js                    → Point d'entrée : démarre le serveur Express
│   │
│   ├── config/
│   │   ├── db.js                    → Connexion MongoDB via Mongoose
│   │   ├── env.js                   → Chargement et validation des variables d'environnement
│   │   └── cloudinary.js            → Configuration Cloudinary (upload photos) — optionnel
│   │
│   ├── models/
│   │   ├── bien.model.js            → Modèle d'un bien immobilier (titre, prix, photos, étage...)
│   │   ├── bailleur.model.js        → Modèle d'un bailleur/propriétaire (nom, commission, clerkId...)
│   │   ├── demande.model.js         → Modèle d'une demande de visite (client, bien, statut...)
│   │   ├── commission.model.js      → Modèle d'une commission générée lors d'une location conclue
│   │   └── user.model.js            → Modèle d'un utilisateur client (synchronisé depuis Clerk)
│   │
│   ├── controllers/
│   │   ├── admin.controller.js      → Toute la logique métier admin : CRUD biens, demandes,
│   │   │                              bailleurs, commissions, stats tableau de bord
│   │   ├── bailleur.controller.js   → Logique du portail bailleur : stats personnelles,
│   │   │                              ses biens, ses commissions, ses demandes
│   │   └── public.controller.js     → Routes publiques : recherche biens, fiche détail,
│   │                                  créer demande, favoris, sync utilisateur
│   │
│   ├── routes/
│   │   ├── admin.route.js           → Routes /api/admin/* (protégées, token Clerk requis)
│   │   └── public.route.js          → Routes /api/* (publiques + quelques routes auth)
│   │
│   └── middleware/
│       └── auth.middleware.js       → Middleware de vérification du token Clerk
│
├── nodemon.json                     → Config nodemon : surveille src/, ignore uploads/
├── .env.example                     → Template des variables d'environnement
└── package.json                     → Dépendances et scripts npm
```

## Routes API

### Publiques (`/api`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/biens` | Recherche/liste des biens (filtres: type, quartier, prix, search) |
| GET | `/biens/:id` | Fiche détail d'un bien |
| POST | `/demandes` | Créer une demande de visite |
| POST | `/users/sync` | Synchroniser un utilisateur Clerk vers MongoDB |
| GET | `/users/demandes` | Demandes de l'utilisateur connecté |
| GET | `/users/favoris` | Favoris de l'utilisateur connecté |
| POST | `/users/favoris` | Ajouter/retirer un favori |

### Admin (`/api/admin`) — Token Clerk requis
| Méthode | Route | Description |
|---|---|---|
| GET | `/stats` | Statistiques du tableau de bord |
| GET/POST | `/biens` | Liste et création de biens |
| PUT/DELETE | `/biens/:id` | Modification et suppression |
| PATCH | `/biens/:id/verifie` | Toggle vérification |
| GET | `/demandes` | Toutes les demandes |
| PATCH | `/demandes/:id/statut` | Changer le statut (déclenche commission si "conclu") |
| GET/POST/PUT/DELETE | `/bailleurs` | CRUD bailleurs |
| GET | `/commissions` | Liste des commissions |
| GET | `/clients` | Liste des clients |

### Portail Bailleur (`/api/admin/bailleur-portal`) — Token Clerk requis
| Méthode | Route | Description |
|---|---|---|
| GET | `/stats` | Stats personnelles du bailleur connecté |
| GET | `/biens` | Ses biens uniquement |
| GET | `/demandes` | Demandes sur ses biens |
| GET | `/commissions` | Ses commissions |

## Logique métier importante

**Auto-création de bailleur** : lors de l'ajout d'un bien, si un nom de bailleur est saisi
et qu'il n'existe pas encore, il est créé automatiquement et lié au bien.

**Commission automatique** : quand une demande passe au statut `conclu`, une commission
est calculée et enregistrée automatiquement (loyer × taux).
