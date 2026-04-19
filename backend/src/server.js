import express from "express";
import path from "path";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import adminRoutes from "./routes/admin.route.js";
import publicRoutes from "./routes/public.route.js";
import fs from "fs";

const app = express();

// ── 1. Dossier uploads (multer) ──────────────────────────
const uploadsDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── 2. CORS EN PREMIER — avant tout autre middleware ─────
app.use(cors({
  origin: (origin, callback) => {
    if (ENV.NODE_ENV !== "production") return callback(null, true);
    const allowed = [ENV.CLIENT_URL];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

// ── 3. Body parser ────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── 4. Clerk (après CORS) ─────────────────────────────────
app.use(clerkMiddleware());

// ── 5. Routes ─────────────────────────────────────────────
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);

app.get("/api/health", (_, res) =>
  res.json({ status: "ok", env: ENV.NODE_ENV })
);

// ── 6. Production : servir le dashboard ──────────────────
if (ENV.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../admin/dist")));
  app.get("/{*any}", (_, res) =>
    res.sendFile(path.join(__dirname, "../admin/dist/index.html"))
  );
}

// ── 7. Démarrage ──────────────────────────────────────────
const start = async () => {
  await connectDB();

  // On stocke l'instance du serveur pour pouvoir le fermer proprement.
  // Sans ça, nodemon ne peut pas libérer le port 5000 entre deux redémarrages
  // (le processus Node.js se termine brutalement sans fermer la socket HTTP,
  // ce qui laisse le port bloqué et produit l'erreur EADDRINUSE à chaque save).
  const server = app.listen(ENV.PORT, () =>
    console.log(`✅ VisiteImmobilier API → http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`)
  );

  // Gérer les erreurs de démarrage (ex: port déjà occupé au premier lancement)
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${ENV.PORT} déjà utilisé. Libère-le puis relance.`);
    } else {
      console.error("❌ Erreur serveur :", err);
    }
    process.exit(1);
  });

  // ── Graceful shutdown ─────────────────────────────────
  // Nodemon envoie SIGTERM avant de redémarrer le processus.
  // Sur Windows, Node.js n'y répond pas nativement → on l'intercepte
  // pour fermer le serveur HTTP proprement et libérer le port.
  const shutdown = (signal) => {
    console.log(`\n[nodemon] ${signal} reçu — fermeture du serveur...`);
    server.close(() => {
      console.log("[nodemon] Serveur fermé ✓");
      process.exit(0);
    });

    // Forcer la fermeture après 3s si des connexions traînent
    setTimeout(() => process.exit(0), 3000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
};

start();