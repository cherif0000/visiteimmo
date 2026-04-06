# VisiteImmobilier — Full Stack

> Plateforme de location immobilière centralisée — Dakar, Sénégal  
> Stack : **Expo (React Native)** + **React Admin (Vite)** + **Node.js + MongoDB**

---

## Structure du projet

```
visiteimmo/
├── backend/          → API Node.js + Express + MongoDB
├── admin/            → Dashboard React (Vite + DaisyUI)
└── mobile/           → Application Expo (React Native + NativeWind)
```

---

## Démarrage rapide

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # Remplir les variables
npm run dev             # Démarre sur http://localhost:5000
```

**Variables requises dans `.env` :**
| Variable | Description |
|---|---|
| `MONGODB_URI` | Connexion MongoDB Atlas |
| `CLERK_SECRET_KEY` | Clé secrète Clerk (backend) |
| `CLOUDINARY_NAME` | Nom du cloud Cloudinary |
| `CLOUDINARY_KEY` | API Key Cloudinary |
| `CLOUDINARY_SECRET` | API Secret Cloudinary |

---

### 2. Admin Dashboard

```bash
cd admin
npm install
cp .env.example .env    # Remplir les variables
npm run dev             # Démarre sur http://localhost:5173
```

**Variables requises dans `.env` :**
| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `VITE_API_URL` | URL du backend (http://localhost:5000/api) |

---

### 3. Mobile (Expo)

```bash
cd mobile
npm install
cp .env.example .env    # Remplir les variables
npx expo start          # Scan le QR code avec Expo Go
```

**Variables requises dans `.env` :**
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `EXPO_PUBLIC_API_URL` | URL du backend |

> ⚠️ Sur Android simulateur, remplace `localhost` par `10.0.2.2` dans `EXPO_PUBLIC_API_URL`

---

## Architecture

```
Application Mobile (Expo)
        │  HTTPS
        ▼
API Backend (Node.js / Express)     ◄─── Admin Dashboard (React)
        │                                       │
        ▼                                       ▼
    MongoDB                             Clerk Auth (JWT)
    (Atlas)
        │
        ▼
    Cloudinary (Photos)
```

---

## Modèles MongoDB

| Collection | Rôle |
|---|---|
| `biens` | Annonces immobilières (appartements, hôtels…) |
| `demandes` | Demandes de visite avec workflow complet |
| `bailleurs` | Partenaires propriétaires |
| `commissions` | Commissions calculées automatiquement |
| `users` | Clients inscrits via Clerk |

---

## Workflow des demandes

```
Nouveau ──► En cours ──► Confirmé ──► Conclu ──► Commission auto créée
                                  └──► Annulé
```

Quand une demande passe en **Conclu** :
- La commission est calculée automatiquement selon le taux du bailleur
- Le statut du bien passe à **Loué**
- Les stats du bailleur sont mises à jour

---

## Commissions

| Type de bien | Taux |
|---|---|
| Bien propre (admin) | 100% |
| Bailleur partenaire | 25–50% (configurable) |
| Hôtel | 5–15% (configurable) |

---

## Écrans Mobile

| Écran | Route |
|---|---|
| Connexion | `/(auth)` |
| Recherche biens | `/(tabs)/` |
| Favoris | `/(tabs)/favoris` |
| Mes demandes | `/(tabs)/demandes` |
| Profil | `/(tabs)/profile` |
| Détail bien + formulaire visite | `/bien/[id]` |

---

## Pages Admin

| Page | Route |
|---|---|
| Dashboard | `/dashboard` |
| Biens | `/biens` |
| Demandes | `/demandes` |
| Bailleurs | `/bailleurs` |
| Commissions | `/commissions` |
| Clients | `/clients` |

---

## Services externes

| Service | Usage | Lien |
|---|---|---|
| **Clerk** | Authentification | https://clerk.com |
| **MongoDB Atlas** | Base de données | https://cloud.mongodb.com |
| **Cloudinary** | Stockage photos | https://cloudinary.com |
| **Expo** | Build mobile | https://expo.dev |

---

## Prochaines étapes suggérées

- [ ] Notifications push (Expo Notifications + FCM)
- [ ] Paiement en ligne Wave / Orange Money (CinetPay)
- [ ] Carte Google Maps dans le détail du bien
- [ ] Endpoint GET `/api/users/favoris` dédié
- [ ] Système de recherche sauvegardée
- [ ] Export PDF des commissions mensuelles
- [ ] Tests unitaires controllers

---

*VisiteImmobilier — Confiance • Fiabilité • Qualité*
