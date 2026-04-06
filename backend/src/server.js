import express from "express";
import path from "path";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import adminRoutes from "./routes/admin.route.js";
import publicRoutes from "./routes/public.route.js";

const app = express();
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(clerkMiddleware());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok", project: "VisiteImmobilier" }));

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));
  app.get("/{*any}", (_, res) =>
    res.sendFile(path.join(__dirname, "../admin/dist/index.html"))
  );
}

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () =>
    console.log(`✅ VisiteImmobilier API running on port ${ENV.PORT}`)
  );
};

start();
