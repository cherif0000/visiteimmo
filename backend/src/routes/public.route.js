import express from "express";
import { requireAuth, getAuth } from "@clerk/express";
import {
  searchBiens, getBienById, createDemande,
  toggleFavori, getMesDemandes, syncUser, getFavoris,
} from "../controllers/public.controller.js";

const router = express.Router();

// ── Routes publiques (pas d'auth requise) ────────────────
router.get("/biens", searchBiens);
router.get("/biens/:id", getBienById);

// Demande : optionnellement authentifié (pour sauvegarder clerkId)
router.post("/demandes", createDemande);

// ── Routes authentifiées (Clerk token requis) ────────────
router.post("/users/sync", requireAuth(), syncUser);
router.get("/users/demandes", requireAuth(), getMesDemandes);
router.get("/users/favoris", requireAuth(), getFavoris);
router.post("/users/favoris", requireAuth(), toggleFavori);

export default router;
