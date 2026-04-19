import express   from "express";
import { getAuth } from "@clerk/express";
import {
  searchBiens, getBienById, createDemande,
  toggleFavori, getMesDemandes, syncUser, getFavoris,
} from "../controllers/public.controller.js";

const router = express.Router();

// ── Middleware auth ───────────────────────────────────────
// On n'utilise PAS requireAuth() de @clerk/express car en v1.x il ne pose
// pas req.auth de façon fiable sur le request object dans tous les cas.
// On appelle getAuth(req) directement et on pose req.auth explicitement.
const requireAuthJson = (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ message: "Non autorisé — connexion requise" });
    }
    req.auth = auth; // ← posé explicitement pour les controllers
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// ── Routes publiques ──────────────────────────────────────
router.get("/biens",     searchBiens);
router.get("/biens/:id", getBienById);
router.post("/demandes", createDemande); // clerkId optionnel, pas d'auth requise

// ── Routes authentifiées ──────────────────────────────────
router.post("/users/sync",     requireAuthJson, syncUser);
router.get ("/users/demandes", requireAuthJson, getMesDemandes);
router.get ("/users/favoris",  requireAuthJson, getFavoris);
router.post("/users/favoris",  requireAuthJson, toggleFavori);

export default router;