import { Bien } from "../models/bien.model.js";
import { Demande } from "../models/demande.model.js";
import { User } from "../models/user.model.js";

// ── Recherche publique de biens ──────────────────────────
export const searchBiens = async (req, res) => {
  try {
    const {
      type, quartier, prixMin, prixMax, meuble,
      chambres, statut, search, page = 1, limit = 20,
    } = req.query;

    const filtre = { statut: statut || "disponible" };
    if (type) filtre.type = type;
    if (quartier) filtre.quartier = new RegExp(quartier, "i");
    if (meuble !== undefined) filtre.meuble = meuble === "true";
    if (chambres) filtre.chambres = { $gte: Number(chambres) };
    if (prixMin || prixMax) {
      filtre.prix = {};
      if (prixMin) filtre.prix.$gte = Number(prixMin);
      if (prixMax) filtre.prix.$lte = Number(prixMax);
    }
    if (search) {
      filtre.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [biens, total] = await Promise.all([
      Bien.find(filtre)
        .select("-bailleur -tauxCommission -noteInterne")
        .sort({ enVedette: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Bien.countDocuments(filtre),
    ]);

    res.json({ biens, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getBienById = async (req, res) => {
  try {
    const bien = await Bien.findById(req.params.id).select("-bailleur -tauxCommission");
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });

    // Incrémenter les vues
    await Bien.findByIdAndUpdate(req.params.id, { $inc: { vues: 1 } });

    res.json(bien);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Créer une demande de visite ──────────────────────────
export const createDemande = async (req, res) => {
  try {
    const { bienId, nom, telephone, email, typeDemande, datePreferee, message } = req.body;

    const bien = await Bien.findById(bienId);
    if (!bien) return res.status(404).json({ message: "Bien non trouvé" });
    if (bien.statut === "loue") {
      return res.status(400).json({ message: "Ce bien n'est plus disponible" });
    }

    // Vérifier doublon : même client + même bien + statut actif
    const existing = await Demande.findOne({
      bien: bienId,
      "client.telephone": telephone,
      statut: { $in: ["nouveau", "en_cours", "confirme"] },
    });
    if (existing) {
      return res.status(400).json({ message: "Vous avez déjà une demande en cours pour ce bien" });
    }

    const demande = new Demande({
      bien: bienId,
     client: { nom, telephone, email: email || "" },

      typeDemande: typeDemande || "visite",
      datePreferee: datePreferee ? new Date(datePreferee) : null,
      message: message || "",
    });
    await demande.save();

    res.status(201).json({
      message: "Votre demande a été reçue ✅. Nous vous contacterons sous peu pour confirmer.",
      demande,
    });
  } catch (error) {
    console.error("createDemande error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Favoris utilisateur ──────────────────────────────────
export const toggleFavori = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { bienId } = req.body;

    let user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isFavori = user.favoris.includes(bienId);
    if (isFavori) {
      user.favoris = user.favoris.filter((id) => id.toString() !== bienId);
    } else {
      user.favoris.push(bienId);
    }
    await user.save();

    res.json({ favoris: user.favoris, isFavori: !isFavori });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Demandes du client connecté ──────────────────────────
export const getMesDemandes = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const demandes = await Demande.find({ "client.clerkId": clerkId })
      .populate("bien", "titre quartier prix photos type")
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── Sync user Clerk → MongoDB ────────────────────────────
export const syncUser = async (req, res) => {
  try {
    const { userId, firstName, lastName, emailAddresses, imageUrl } = req.body;
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = new User({
        clerkId: userId,
        nom: `${firstName} ${lastName}`,
        email: emailAddresses?.[0]?.emailAddress || "",
        imageUrl: imageUrl || "",
      });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
