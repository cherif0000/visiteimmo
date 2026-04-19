import { Bien } from "../models/bien.model.js";
import { Demande } from "../models/demande.model.js";
import { Bailleur } from "../models/bailleur.model.js";
import { Commission } from "../models/commission.model.js";
import { User } from "../models/user.model.js";
import { uploadPhoto } from "../config/cloudinary.js";

// ── Helpers ──────────────────────────────────────────────

// Crée un bailleur s'il n'existe pas encore (matching par nom exact, insensible à la casse)
async function findOrCreateBailleur({ nomBailleur, telephoneBailleur, emailBailleur, tauxCommission }) {
  if (!nomBailleur?.trim()) return null;

  const existing = await Bailleur.findOne({
    nom: { $regex: new RegExp(`^${nomBailleur.trim()}$`, "i") },
  });
  if (existing) return existing;

  const nouveau = new Bailleur({
    nom: nomBailleur.trim(),
    telephone: telephoneBailleur || "",
    email: emailBailleur || "",
    tauxCommission: tauxCommission ? Number(tauxCommission) : 10,
  });
  await nouveau.save();
  return nouveau;
}

// ── STATS DASHBOARD ──────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBiens, biensDisponibles, biensLoues, biensSurDemande,
      biensVerifies, biensPropres, biensViaBailleurs,
      totalDemandes, demandesNouvelles, demandesEnCours,
      demandesConfirmees, demandesConclues, demandesAnnulees,
      totalClients, totalBailleurs,
      commissionsData, commissionsMoisData,
      recentesDemandes,
    ] = await Promise.all([
      Bien.countDocuments(),
      Bien.countDocuments({ statut: "disponible" }),
      Bien.countDocuments({ statut: "loue" }),
      Bien.countDocuments({ statut: "sur_demande" }),
      Bien.countDocuments({ verifie: true }),
      Bien.countDocuments({ bailleur: null }),
      Bien.countDocuments({ bailleur: { $ne: null } }),
      Demande.countDocuments(),
      Demande.countDocuments({ statut: "nouveau" }),
      Demande.countDocuments({ statut: "en_cours" }),
      Demande.countDocuments({ statut: "confirme" }),
      Demande.countDocuments({ statut: "conclu" }),
      Demande.countDocuments({ statut: "annule" }),
      User.countDocuments(),
      Bailleur.countDocuments({ actif: true }),
      Commission.aggregate([
        { $group: { _id: null, total: { $sum: "$montant" }, count: { $sum: 1 } } },
      ]),
      Commission.aggregate([
        { $match: { createdAt: { $gte: debutMois } } },
        { $group: { _id: null, total: { $sum: "$montant" }, count: { $sum: 1 } } },
      ]),
      Demande.find({ statut: { $in: ["nouveau", "en_cours"] } })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("bien", "titre quartier prix"),
    ]);

    const tauxConversion = totalDemandes > 0
      ? Math.round((demandesConclues / totalDemandes) * 100) : 0;

    res.json({
      totalBiens, biensDisponibles, biensLoues, biensSurDemande,
      biensVerifies, biensPropres, biensViaBailleurs,
      totalDemandes, demandesNouvelles, demandesEnCours,
      demandesConfirmees, demandesConclues, demandesAnnulees,
      totalClients, totalBailleurs,
      totalCommissions:  commissionsData[0]?.total ?? 0,
      commissionsTotal:  commissionsData[0]?.count ?? 0,
      commissionsMois:   commissionsMoisData[0]?.total ?? 0,
      locationsMois:     commissionsMoisData[0]?.count ?? 0,
      tauxConversion,
      recentesDemandes,
    });
  } catch (err) {
    console.error("getDashboardStats:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── BIENS ────────────────────────────────────────────────
export const getAllBiens = async (req, res) => {
  try {
    const { statut, type, quartier, verifie, bailleur } = req.query;
    const filtre = {};
    if (statut)  filtre.statut  = statut;
    if (type)    filtre.type    = type;
    if (quartier) filtre.quartier = new RegExp(quartier, "i");
    if (verifie !== undefined) filtre.verifie = verifie === "true";
    if (bailleur) filtre.bailleur = bailleur;

    const biens = await Bien.find(filtre)
      .populate("bailleur", "nom telephone email tauxCommission type")
      .sort({ enVedette: -1, createdAt: -1 });
    res.json(biens);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createBien = async (req, res) => {
  try {
    const {
      titre, description, type, statut,
      prix, caution, chargesIncluses, meuble, chambres, surface,
      quartier, adresse, ville, etage, numeroBien,
      enVedette,
      // Bailleur : soit ID existant, soit infos pour création auto
      bailleurId,
      nomBailleur, telephoneBailleur, emailBailleur,
      tauxCommission,
    } = req.body;

    // ── Upload photos (Cloudinary optionnel) ────────────
    let photos = [];
    if (req.files?.length > 0) {
      const results = await Promise.all(req.files.map((f) => uploadPhoto(f.path)));
      photos = results.filter(Boolean).map((u) => u.secure_url);
    }

    // ── Résolution bailleur (auto-création si besoin) ────
    let bailleurDoc = null;
    if (bailleurId) {
      bailleurDoc = await Bailleur.findById(bailleurId);
    } else if (nomBailleur?.trim()) {
      bailleurDoc = await findOrCreateBailleur({
        nomBailleur, telephoneBailleur, emailBailleur, tauxCommission,
      });
    }

    // ── Création du bien ─────────────────────────────────
    const bien = new Bien({
      titre, description, type,
      statut: statut || "disponible",
      prix:    Number(prix),
      caution: Number(caution) || 0,
      chargesIncluses: chargesIncluses === "true",
      meuble:          meuble === "true",
      chambres: Number(chambres) || 1,
      surface:  surface ? Number(surface) : null,
      quartier, adresse,
      ville:       ville || "Dakar",
      etage:       etage !== undefined && etage !== "" ? Number(etage) : null,
      numeroBien:  numeroBien || "",
      photos,
      enVedette:      enVedette === "true",
      bailleur:       bailleurDoc?._id ?? null,
      tauxCommission: bailleurDoc
        ? (tauxCommission ? Number(tauxCommission) : bailleurDoc.tauxCommission)
        : null,
    });

    await bien.save();

    // ── Incrémenter compteur bailleur ────────────────────
    if (bailleurDoc) {
      await Bailleur.findByIdAndUpdate(bailleurDoc._id, { $inc: { totalBiens: 1 } });
    }

    const populated = await bien.populate("bailleur", "nom telephone");
    res.status(201).json(populated);
  } catch (err) {
    console.error("createBien:", err);
    res.status(500).json({ message: "Erreur création : " + err.message });
  }
};

export const updateBien = async (req, res) => {
  try {
    // Si modification du bailleur par nom
    if (req.body.nomBailleur?.trim() && !req.body.bailleurId) {
      const bailleurDoc = await findOrCreateBailleur({
        nomBailleur:      req.body.nomBailleur,
        telephoneBailleur: req.body.telephoneBailleur,
        emailBailleur:    req.body.emailBailleur,
        tauxCommission:   req.body.tauxCommission,
      });
      req.body.bailleur = bailleurDoc?._id ?? null;
    } else if (req.body.bailleurId) {
      req.body.bailleur = req.body.bailleurId;
    }

    // Convertir les champs numériques
    if (req.body.etage !== undefined)
      req.body.etage = req.body.etage !== "" ? Number(req.body.etage) : null;
    if (req.body.prix)    req.body.prix    = Number(req.body.prix);
    if (req.body.caution) req.body.caution = Number(req.body.caution);
    if (req.body.chambres) req.body.chambres = Number(req.body.chambres);
    if (req.body.surface) req.body.surface = Number(req.body.surface);
    if (req.body.chargesIncluses !== undefined) req.body.chargesIncluses = req.body.chargesIncluses === "true";
    if (req.body.meuble !== undefined) req.body.meuble = req.body.meuble === "true";
    if (req.body.enVedette !== undefined) req.body.enVedette = req.body.enVedette === "true";

    const bien = await Bien.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("bailleur", "nom telephone");
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });
    res.json(bien);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteBien = async (req, res) => {
  try {
    const bien = await Bien.findByIdAndDelete(req.params.id);
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });
    if (bien.bailleur) {
      await Bailleur.findByIdAndUpdate(bien.bailleur, { $inc: { totalBiens: -1 } });
    }
    res.json({ message: "Bien supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const toggleVerifie = async (req, res) => {
  try {
    const bien = await Bien.findById(req.params.id);
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });
    bien.verifie = !bien.verifie;
    await bien.save();
    res.json(bien);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── DEMANDES ─────────────────────────────────────────────
export const getAllDemandes = async (req, res) => {
  try {
    const { statut, bien, search } = req.query;
    const filtre = {};
    if (statut) filtre.statut = statut;
    if (bien)   filtre.bien   = bien;
    if (search) {
      filtre.$or = [
        { "client.nom":       new RegExp(search, "i") },
        { "client.telephone": new RegExp(search, "i") },
      ];
    }
    const demandes = await Demande.find(filtre)
      .populate("bien", "titre quartier prix photos type etage numeroBien adresse")
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateStatutDemande = async (req, res) => {
  try {
    const { statut, heureConfirmee, noteInterne, motifAnnulation } = req.body;
    const demande = await Demande.findById(req.params.id).populate("bien");
    if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

    demande.statut = statut;
    if (heureConfirmee) demande.heureConfirmee = new Date(heureConfirmee);
    if (noteInterne !== undefined) demande.noteInterne = noteInterne;
    if (motifAnnulation) demande.motifAnnulation = motifAnnulation;

    // Si conclu → créer commission automatiquement
    if (statut === "conclu" && !demande.commission) {
      const bien = demande.bien;
      const taux   = bien.tauxCommission ?? 100;
      const loyer  = bien.prix;
      const montant = Math.round((loyer * taux) / 100);
      const mois = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

      const commission = new Commission({
        demande: demande._id,
        bien:    bien._id,
        bailleur: bien.bailleur || null,
        loyer, taux, montant,
        type: bien.type === "hotel" ? "reservation_hotel" : "location",
        mois,
      });
      await commission.save();
      demande.commission = commission._id;

      await Bien.findByIdAndUpdate(bien._id, { statut: "loue" });
      if (bien.bailleur) {
        await Bailleur.findByIdAndUpdate(bien.bailleur, {
          $inc: { totalLocations: 1, totalCommissions: montant },
        });
      }
    }

    await demande.save();
    res.json(demande);
  } catch (err) {
    console.error("updateStatutDemande:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteDemande = async (req, res) => {
  try {
    await Demande.findByIdAndDelete(req.params.id);
    res.json({ message: "Demande supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── BAILLEURS ────────────────────────────────────────────
export const getAllBailleurs = async (req, res) => {
  try {
    const bailleurs = await Bailleur.find().sort({ nom: 1 });
    res.json(bailleurs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createBailleur = async (req, res) => {
  try {
    const bailleur = new Bailleur(req.body);
    await bailleur.save();
    res.status(201).json(bailleur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBailleur = async (req, res) => {
  try {
    const bailleur = await Bailleur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bailleur) return res.status(404).json({ message: "Bailleur non trouvé" });
    res.json(bailleur);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteBailleur = async (req, res) => {
  try {
    await Bailleur.findByIdAndDelete(req.params.id);
    res.json({ message: "Bailleur supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── COMMISSIONS ──────────────────────────────────────────
export const getAllCommissions = async (req, res) => {
  try {
    const { mois, bailleur } = req.query;
    const filtre = {};
    if (mois)    filtre.mois    = mois;
    if (bailleur) filtre.bailleur = bailleur;

    const commissions = await Commission.find(filtre)
      .populate("bien",    "titre quartier type prix")
      .populate("bailleur","nom telephone")
      .sort({ createdAt: -1 });

    const total        = commissions.reduce((s, c) => s + c.montant, 0);
    const totalLoyers  = commissions.reduce((s, c) => s + c.loyer,   0);
    const resteAVerser = totalLoyers - total;

    res.json({ commissions, total, totalLoyers, resteAVerser });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── CLIENTS ──────────────────────────────────────────────
export const getAllClients = async (req, res) => {
  try {
    const clients = await User.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
