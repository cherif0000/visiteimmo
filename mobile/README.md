# Mobile — Application VisiteImmobilier

Application mobile construite avec **React Native**, **Expo**, **NativeWind** (Tailwind) et **Clerk**.

## Structure des fichiers

```
mobile/
├── app.json                          → Configuration Expo (nom, icônes, splash screen)
├── tailwind.config.js                → Palette de couleurs (noir/blanc, sobre et professionnel)
├── global.css                        → Import Tailwind pour NativeWind
├── .env.example                      → Template des variables d'environnement
│
├── app/                              → Routing basé sur les fichiers (Expo Router)
│   ├── _layout.tsx                   → Racine : Clerk + QueryClient + AuthSetup (inject token)
│   │                                   AuthSetup : injecte le token Clerk dans Axios dès la
│   │                                   connexion, et synchronise l'utilisateur vers MongoDB
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx               → Layout du groupe auth (pas de header)
│   │   └── index.tsx                 → Écran de connexion : Google OAuth + Apple OAuth
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx               → Barre de navigation du bas (4 onglets)
│   │   │                               Accessible sans connexion (pas de redirection forcée)
│   │   ├── index.tsx                 → Onglet "Rechercher" : liste des biens avec filtres,
│   │   │                               recherche par texte, chips de type, favoris inline
│   │   ├── favoris.tsx               → Onglet "Sauvegardés" : biens mis en favoris
│   │   │                               Affiche LoginWall si non connecté
│   │   ├── demandes.tsx              → Onglet "Demandes" : suivi des demandes de visite
│   │   │                               Affiche LoginWall si non connecté
│   │   └── profile.tsx               → Onglet "Profil" : deux états (connecté / non connecté)
│   │                                   Non connecté → boutons Se connecter / Créer un compte
│   │                                   Connecté → infos utilisateur, menu, déconnexion
│   │
│   └── bien/
│       └── [id].tsx                  → Fiche détail d'un bien : carousel photos, caractéristiques,
│                                       étage/numéro, formulaire de demande de visite
│                                       Protégé : connexion requise pour favori et demande
│
├── components/
│   ├── SafeScreen.tsx                → Wrapper qui applique SafeAreaView + fond de couleur
│   └── LoginWall.tsx                 → Écran "Connexion requise" réutilisable avec icône,
│                                       message et boutons Se connecter / Créer un compte
│
├── hooks/
│   ├── useBiens.ts                   → Hook React Query pour charger la liste des biens
│   │                                   avec filtres (type, quartier, prixMax, search)
│   └── useSocialAuth.ts              → Hook pour gérer OAuth Google et Apple via Clerk
│                                       Gère les cas "déjà connecté" sans crash
│
└── lib/
    └── api.ts                        → Instance Axios + setAuthToken() + toutes les fonctions API
                                        bienApi, demandeApi, userApi (sync, favoris, demandes)
```

## Logique d'accès

| Action | Non connecté | Connecté |
|---|---|---|
| Parcourir les biens | ✅ Libre | ✅ |
| Voir une fiche détail | ✅ Libre | ✅ |
| Ajouter aux favoris | → Redirige vers connexion | ✅ |
| Faire une demande | → Alerte + bouton connexion | ✅ |
| Voir ses demandes | → LoginWall | ✅ |
| Voir ses favoris | → LoginWall | ✅ |

## Palette de couleurs

| Token | Valeur | Usage |
|---|---|---|
| `text-text-primary` | `#1A1A2E` | Textes principaux |
| `text-text-secondary` | `#5C6472` | Textes secondaires |
| `text-text-muted` | `#9AA0AA` | Placeholders, labels |
| `bg-background` | `#F7F7F5` | Fond général |
| `bg-surface` | `#FFFFFF` | Cartes et surfaces |
| `border-border` | `#E5E5E0` | Bordures |
| Boutons principaux | `#1A1A2E` (noir) | CTA, actions |
| Accent | `#C8922A` (or) | Badges vedette uniquement |

## Développement sur téléphone physique

Assure-toi que ton téléphone et ton PC sont sur le même réseau WiFi, puis dans `.env` :

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:5000/api
```

Remplace `192.168.X.X` par l'IP de ta machine (commande `ipconfig` sur Windows).
