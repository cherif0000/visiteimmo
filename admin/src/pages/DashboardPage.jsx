import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../lib/api";
import {
  BuildingIcon, ClipboardListIcon, HandshakeIcon,
  UsersIcon, CoinsIcon, TrendingUpIcon,
  ArrowUpIcon, ArrowDownIcon, CheckCircleIcon,
  ClockIcon, AlertCircleIcon,
} from "lucide-react";

// ── Carte stat principale ──────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend, trendUp }) {
  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-5">
        <div className="flex items-start justify-between">
          <div className={`size-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="size-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp ? "bg-success/15 text-success" : "bg-error/15 text-error"
            }`}>
              {trendUp ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
              {trend}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold tracking-tight">{value ?? "—"}</p>
          <p className="text-base-content/60 text-sm font-medium mt-0.5">{label}</p>
          {sub && <p className="text-base-content/40 text-xs mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Ligne activité récente ─────────────────────────────────
function ActivityRow({ icon: Icon, iconColor, title, sub, badge, badgeColor, time }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-base-content/8 last:border-0">
      <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="size-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-base-content/50 truncate">{sub}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {badge && (
          <span className={`badge badge-xs ${badgeColor}`}>{badge}</span>
        )}
        <span className="text-xs text-base-content/40">{time}</span>
      </div>
    </div>
  );
}

// ── Barre de progression mini ──────────────────────────────
function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-base-content/70 font-medium">{label}</span>
        <span className="font-bold">{value} <span className="text-base-content/40">/ {max}</span></span>
      </div>
      <div className="w-full bg-base-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: statsApi.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/40 text-sm">Chargement du tableau de bord…</p>
      </div>
    );
  }

  // Données réelles ou placeholders visuels
  const d = data ?? {};

  const stats = [
    {
      icon: BuildingIcon,
      label: "Biens publiés",
      value: d.totalBiens ?? 0,
      sub: `dont ${d.biensVerifies ?? 0} vérifiés`,
      color: "bg-primary",
      trend: d.trendBiens,
      trendUp: true,
    },
    {
      icon: ClipboardListIcon,
      label: "Demandes en cours",
      value: d.demandesEnCours ?? 0,
      sub: `${d.demandesTotal ?? 0} demandes au total`,
      color: "bg-warning",
      trend: d.trendDemandes,
      trendUp: true,
    },
    {
      icon: HandshakeIcon,
      label: "Courtiers actifs",
      value: d.totalCourtiers ?? 0,
      sub: `${d.biensCourtiers ?? 0} biens via courtiers`,
      color: "bg-success",
    },
    {
      icon: UsersIcon,
      label: "Clients",
      value: d.totalClients ?? 0,
      sub: "clients enregistrés",
      color: "bg-info",
      trend: d.trendClients,
      trendUp: true,
    },
    {
      icon: CoinsIcon,
      label: "Commissions",
      value: d.totalCommissions
        ? `${Number(d.totalCommissions).toLocaleString()} F`
        : "0 F",
      sub: "commissions perçues",
      color: "bg-secondary",
    },
    {
      icon: TrendingUpIcon,
      label: "Taux de vérification",
      value: d.totalBiens
        ? `${Math.round(((d.biensVerifies ?? 0) / d.totalBiens) * 100)}%`
        : "0%",
      sub: "des biens sont vérifiés",
      color: "bg-accent",
    },
  ];

  // Activités récentes (depuis l'API ou placeholders)
  const activites = d.activitesRecentes ?? [
    {
      icon: BuildingIcon,
      iconColor: "bg-primary",
      title: "Aucune activité récente",
      sub: "Les activités apparaîtront ici",
      time: "",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Tableau de bord</h2>
          <p className="text-base-content/50 text-sm mt-0.5">
            Bienvenue — voici un aperçu de l'activité VisiteImmo
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-base-content/40 bg-base-100 border border-base-content/10 px-3 py-2 rounded-xl">
          <ClockIcon className="size-3.5" />
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* ── Grille stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Ligne du bas : activité + répartition ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Activité récente */}
        <div className="lg:col-span-3 card bg-base-100 border border-base-content/10 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base">Activité récente</h3>
              <span className="badge badge-ghost badge-sm">Live</span>
            </div>
            <p className="text-xs text-base-content/40 mb-3">Dernières actions sur la plateforme</p>
            <div>
              {activites.length === 0 ? (
                <div className="text-center py-8 text-base-content/30 text-sm">
                  Aucune activité récente
                </div>
              ) : (
                activites.slice(0, 6).map((a, i) => (
                  <ActivityRow key={i} {...a} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Répartition biens */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Statuts des biens */}
          <div className="card bg-base-100 border border-base-content/10 shadow-sm flex-1">
            <div className="card-body p-5">
              <h3 className="font-bold text-base mb-1">Répartition des biens</h3>
              <p className="text-xs text-base-content/40 mb-4">Par statut et source</p>
              <div className="space-y-3">
                <ProgressBar
                  label="Disponibles"
                  value={d.biensDisponibles ?? 0}
                  max={d.totalBiens ?? 1}
                  color="bg-success"
                />
                <ProgressBar
                  label="Loués"
                  value={d.biensLoues ?? 0}
                  max={d.totalBiens ?? 1}
                  color="bg-error"
                />
                <ProgressBar
                  label="Réservés"
                  value={d.biensReserves ?? 0}
                  max={d.totalBiens ?? 1}
                  color="bg-warning"
                />
                <div className="divider my-1 text-xs text-base-content/30">Source</div>
                <ProgressBar
                  label="Nos biens"
                  value={d.biensPropres ?? 0}
                  max={d.totalBiens ?? 1}
                  color="bg-primary"
                />
                <ProgressBar
                  label="Via courtiers"
                  value={d.biensCourtiers ?? 0}
                  max={d.totalBiens ?? 1}
                  color="bg-secondary"
                />
              </div>
            </div>
          </div>

          {/* Statut demandes */}
          <div className="card bg-base-100 border border-base-content/10 shadow-sm">
            <div className="card-body p-5">
              <h3 className="font-bold text-base mb-3">Demandes</h3>
              <div className="flex gap-3">
                <div className="flex-1 bg-warning/10 rounded-xl p-3 text-center">
                  <ClockIcon className="size-5 text-warning mx-auto mb-1" />
                  <p className="text-lg font-bold">{d.demandesEnCours ?? 0}</p>
                  <p className="text-xs text-base-content/50">En attente</p>
                </div>
                <div className="flex-1 bg-success/10 rounded-xl p-3 text-center">
                  <CheckCircleIcon className="size-5 text-success mx-auto mb-1" />
                  <p className="text-lg font-bold">{d.demandesAcceptees ?? 0}</p>
                  <p className="text-xs text-base-content/50">Acceptées</p>
                </div>
                <div className="flex-1 bg-error/10 rounded-xl p-3 text-center">
                  <AlertCircleIcon className="size-5 text-error mx-auto mb-1" />
                  <p className="text-lg font-bold">{d.demandesRefusees ?? 0}</p>
                  <p className="text-xs text-base-content/50">Refusées</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
