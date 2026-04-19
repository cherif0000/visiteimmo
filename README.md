# VisiteImmobilier

Plateforme de location immobilière à Dakar, Sénégal.

## Architecture

```
visiteimmo/
├── backend/   → API Node.js/Express (serveur)
├── admin/     → Dashboard web React (gestion)
└── mobile/    → Application mobile React Native / Expo (clients)
```

---

## Prérequis

- Node.js 18+
- Compte MongoDB Atlas
- Compte Clerk (authentification)
- Compte Cloudinary (photos) — optionnel en développement

---

## Installation rapide

```bash
# 1. Backend
cd backend && cp .env.example .env   # remplir les variables
npm install && npm run dev

# 2. Dashboard admin
cd admin && cp .env.example .env
npm install && npm run dev

# 3. Application mobile
cd mobile && cp .env.example .env
npm install && npx expo start --clear
```

---

## Variables d'environnement

### backend/.env
| Variable | Description |
|---|---|
| `PORT` | Port du serveur (défaut : 5000) |
| `MONGODB_URI` | URL de connexion MongoDB Atlas |
| `CLERK_SECRET_KEY` | Clé secrète Clerk (dashboard.clerk.com) |
| `CLOUDINARY_NAME` | Nom du cloud Cloudinary (optionnel) |
| `CLOUDINARY_KEY` | Clé API Cloudinary (optionnel) |
| `CLOUDINARY_SECRET` | Secret Cloudinary (optionnel) |
| `CLIENT_URL` | URL du frontend admin (CORS) |

### admin/.env
| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `VITE_API_URL` | URL du backend (ex: http://localhost:5000/api) |
| `VITE_ADMIN_EMAIL` | Email de l'administrateur principal |

### mobile/.env
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `EXPO_PUBLIC_API_URL` | URL du backend (utiliser l'IP locale en dev) |

> En développement sur téléphone physique : utiliser l'IP WiFi de votre machine
> (ex: `http://192.168.1.4:5000/api`) et non `localhost`.
