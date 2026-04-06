import { Bien } from "../models/bien.model.js";
import { Demande } from "../models/demande.model.js";
import { Bailleur } from "../models/bailleur.model.js";
import { Commission } from "../models/commission.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

// ── STATS DASHBOARD ──────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBiens, biensDisponibles, biensLoues, biensSurDemande,
      biensVerifies, biensPropres, biensViaBailleurs,
      totalDemandes, demandesNouvelles, demandesEnCours, demandesConfirmees, demandesConcluess, demandesAnnulees,
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
        .populate("bien", "titre quartier prix photos"),
    ]);

    const totalCommissions = commissionsData[0]?.total ?? 0;
    const commissionsTotal = commissionsData[0]?.count ?? 0;
    const commissionsMois = commissionsMoisData[0]?.total ?? 0;
    const locationsMois = commissionsMoisData[0]?.count ?? 0;
    const tauxConversion = totalDemandes > 0 ? Math.round((demandesConcluess / totalDemandes) * 100) : 0;

    res.json({
      // Biens
      totalBiens, biensDisponibles, biensLoues, biensSurDemande,
      biensVerifies, biensPropres, biensViaBailleurs,
      // Demandes
      totalDemandes, demandesNouvelles, demandesEnCours, demandesConfirmees,
      demandesConclues: demandesConcluess, demandesAnnulees,
      // Personnes
      totalClients, totalBailleurs,
      // Finances
      totalCommissions, commissionsTotal, commissionsMois, locationsMois,
      tauxConversion,
      // Recent
      recentesDemandes,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── BIENS ────────────────────────────────────────────────
export const getAllBiens = async (req, res) => {
  try {
    const { statut, type, quartier, verifie, bailleur } = req.query;
    const filtre = {};
    if (statut) filtre.statut = statut;
    if (type) filtre.type = type;
    if (quartier) filtre.quartier = new RegExp(quartier, "i");
    if (verifie !== undefined) filtre.verifie = verifie === "true";
    if (bailleur) filtre.bailleur = bailleur;

    const biens = await Bien.find(filtre)
      .populate("bailleur", "nom telephone tauxCommission type")
      .sort({ createdAt: -1 });
    res.json(biens);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createBien = async (req, res) => {
  try {
    const {
      titre, description, type, prix, caution, chargesIncluses, meuble,
      chambres, surface, quartier, adresse, ville,
      bailleur, tauxCommission, statut, enVedette,
    } = req.body;

    let photos = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((f) =>
          cloudinary.uploader.upload(f.path, {
            folder: "visiteimmo/biens",
            transformation: [{ width: 1200, height: 800, crop: "fill", quality: "auto" }],
          })
        )
      );
      photos = uploads.map((u) => u.secure_url);
    }

    const bien = new Bien({
      titre, description, type,
      prix: Number(prix),
      caution: Number(caution) || 0,
      chargesIncluses: chargesIncluses === "true",
      meuble: meuble === "true",
      chambres: Number(chambres) || 1,
      surface: surface ? Number(surface) : null,
      quartier, adresse,
      ville: ville || "Dakar",
      photos,
      enVedette: enVedette === "true",
      bailleur: bailleur || null,
      tauxCommission: tauxCommission ? Number(tauxCommission) : null,
      statut: statut || "disponible",
    });

    await bien.save();

    if (bailleur) {
      await Bailleur.findByIdAndUpdate(bailleur, { $inc: { totalBiens: 1 } });
    }

    res.status(201).json(bien);
  } catch (error) {
    console.error("createBien error:", error);
    res.status(500).json({ message: "Erreur lors de la création : " + error.message });
  }
};

export const updateBien = async (req, res) => {
  try {
    const bien = await Bien.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });
    res.json(bien);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteBien = async (req, res) => {
  try {
    const bien = await Bien.findByIdAndDelete(req.params.id);
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });
    res.json({ message: "Bien supprimé" });
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── DEMANDES ─────────────────────────────────────────────
export const getAllDemandes = async (req, res) => {
  try {
    const { statut, bien, search } = req.query;
    const filtre = {};
    if (statut) filtre.statut = statut;
    if (bien) filtre.bien = bien;
    if (search) {
      filtre.$or = [
        { "client.nom": new RegExp(search, "i") },
        { "client.telephone": new RegExp(search, "i") },
      ];
    }
    const demandes = await Demande.find(filtre)
      .populate("bien", "titre quartier prix photos type")
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch (error) {
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

    // Si conclu → créer la commission
    if (statut === "conclu" && !demande.commission) {
      const bien = demande.bien;
      const taux = bien.tauxCommission ?? 100;
      const loyer = bien.prix;
      const montant = Math.round((loyer * taux) / 100);
      const now = new Date();
      const mois = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const commission = new Commission({
        demande: demande._id,
        bien: bien._id,
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
  } catch (error) {
    console.error("updateStatutDemande error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteDemande = async (req, res) => {
  try {
    await Demande.findByIdAndDelete(req.params.id);
    res.json({ message: "Demande supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── BAILLEURS ────────────────────────────────────────────
export const getAllBailleurs = async (req, res) => {
  try {
    const bailleurs = await Bailleur.find().sort({ createdAt: -1 });
    res.json(bailleurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createBailleur = async (req, res) => {
  try {
    const bailleur = new Bailleur(req.body);
    await bailleur.save();
    res.status(201).json(bailleur);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur : " + error.message });
  }
};

export const updateBailleur = async (req, res) => {
  try {
    const bailleur = await Bailleur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bailleur) return res.status(404).json({ message: "Bailleur non trouvé" });
    res.json(bailleur);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteBailleur = async (req, res) => {
  try {
    await Bailleur.findByIdAndDelete(req.params.id);
    res.json({ message: "Bailleur supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── COMMISSIONS ──────────────────────────────────────────
export const getAllCommissions = async (req, res) => {
  try {
    const { mois, bailleur } = req.query;
    const filtre = {};
    if (mois) filtre.mois = mois;
    if (bailleur) filtre.bailleur = bailleur;

    const commissions = await Commission.find(filtre)
      .populate("bien", "titre quartier type prix")
      .populate("bailleur", "nom telephone")
      .populate({ path: "demande", populate: { path: "bien", select: "titre" } })
      .sort({ createdAt: -1 });

    const total = commissions.reduce((sum, c) => sum + c.montant, 0);
    const totalLoyers = commissions.reduce((sum, c) => sum + c.loyer, 0);
    const resteAVerser = totalLoyers - total;

    res.json({ commissions, total, totalLoyers, resteAVerser });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── CLIENTS ──────────────────────────────────────────────
export const getAllClients = async (req, res) => {
  try {
    const clients = await User.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
