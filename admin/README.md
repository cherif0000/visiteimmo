# Admin — Dashboard VisiteImmobilier

Interface web de gestion construite avec **React**, **Vite**, **TailwindCSS** et **DaisyUI**.

## Structure des fichiers

```
admin/
├── index.html                        → Point d'entrée HTML
├── vite.config.js                    → Configuration Vite (bundler)
├── tailwind.config.js                → Thème Tailwind + DaisyUI (mode clair)
├── .env.example                      → Template des variables d'environnement
│
└── src/
    ├── main.jsx                      → Point d'entrée React : Clerk + QueryClient + Router
    ├── App.jsx                       → Routing principal + détection du rôle (admin / bailleur)
    ├── index.css                     → Import Tailwind
    │
    ├── lib/
    │   ├── axios.js                  → Instance Axios configurée + fonction setAdminToken()
    │   └── api.js                    → Toutes les fonctions d'appel API (bienApi, demandeApi,
    │                                   bailleurApi, commissionApi, clientApi, statsApi)
    │
    ├── components/
    │   ├── Navbar.jsx                → Barre du haut : titre de page + bouton UserButton Clerk
    │   │                               Exporte aussi NAVIGATION (liste des liens du menu)
    │   ├── Sidebar.jsx               → Menu latéral avec liens de navigation
    │   └── PageLoader.jsx            → Spinner de chargement affiché au démarrage
    │
    ├── layouts/
    │   └── DashboardLayout.jsx       → Layout principal : Sidebar + Navbar + <Outlet />
    │
    └── pages/
        ├── LoginPage.jsx             → Page de connexion (bouton Clerk)
        ├── DashboardPage.jsx         → Tableau de bord : KPIs, graphiques, demandes récentes
        ├── BiensPage.jsx             → Gestion des biens : liste, ajout, modification, suppression
        │                               Inclut la création automatique de bailleur inline
        ├── DemandesPage.jsx          → Demandes de visite : liste, modal détail, changement statut
        ├── BailleursPage.jsx         → Gestion des bailleurs : liste en cartes, CRUD, Clerk ID
        ├── CommissionsPage.jsx       → Suivi financier : commissions, loyers, reste à verser
        ├── ClientsPage.jsx           → Liste des clients inscrits sur l'application mobile
        │
        └── bailleur/                 → Portail bailleur (interface séparée)
            ├── BailleurPortalLayout.jsx  → Layout dédié avec sidebar bailleur
            ├── BailleurDashboard.jsx     → Vue d'ensemble : biens, revenus, commissions
            ├── BailleurBiens.jsx         → Ses biens en lecture seule (statuts, infos)
            ├── BailleurDemandes.jsx      → Demandes sur ses biens en lecture seule
            └── BailleurCommissions.jsx   → Historique de ses revenus et commissions
```

## Gestion des rôles

L'application détecte automatiquement le rôle de l'utilisateur connecté :

- **Admin** : email correspondant à `VITE_ADMIN_EMAIL` → accès dashboard complet
- **Bailleur** : email lié à un profil bailleur (via `clerkId`) → accès portail bailleur uniquement
- Les deux se connectent sur la même URL, la redirection est automatique

## Ajouter un bien

Le formulaire d'ajout est en 4 étapes :
1. Bailleur (nom saisi librement — créé automatiquement s'il n'existe pas)
2. Informations (type, quartier, adresse, étage, numéro)
3. Prix et caractéristiques
4. Description et photos (Cloudinary — optionnel)

## Commissions

Générées automatiquement quand une demande passe au statut **Conclu** :
`montant = loyer × taux_commission / 100`
Le reste (`loyer - montant`) est ce qui est reversé au bailleur.
