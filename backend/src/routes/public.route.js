import express from "express";
import {
  searchBiens, getBienById, createDemande,
  toggleFavori, getMesDemandes, syncUser,
} from "../controllers/public.controller.js";

const router = express.Router();

// Routes publiques
router.get("/biens", searchBiens);
router.get("/biens/:id", getBienById);
router.post("/demandes", createDemande);

// Routes authentifiées
router.post("/users/sync", syncUser);
router.get("/users/demandes", getMesDemandes);
router.post("/users/favoris", toggleFavori);

export default router;