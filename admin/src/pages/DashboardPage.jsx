import { useQuery } from "@tanstack/react-query";
import { statsApi, demandeApi } from "../lib/api";
import { Link } from "react-router";
import {
  BuildingIcon, ClipboardListIcon, UsersIcon, CoinsIcon,
  TrendingUpIcon, CheckCircleIcon, ClockIcon, XCircleIcon,
  ArrowRightIcon, PhoneIcon, HomeIcon, MapPinIcon, BanknoteIcon,
  UserIcon, StarIcon, RefreshCcwIcon,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color, badge, badgeColor }) {
  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="card-body p-5">
        <div className="flex items-start justify-between">
          <div className={`size-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon className="size-6 text-white" />
          </div>
          {badge && <span className={`badge badge-sm ${badgeColor}`}>{badge}</span>}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-extrabold tracking-tight">{value ?? "0"}</p>
          <p className="text-base-content/60 text-sm font-medium mt-0.5">{label}</p>
          {sub && <p className="text-base-content/40 text-xs mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className={`rounded-xl p-3 text-center ${color}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

function ProgressBar({ label, value, max, color, showPct = true }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-base-content/70 font-medium">{label}</span>
        <span className="font-bold">{value} {showPct && <span className="text-base-content/40">({pct}%)</span>}</span>
      </div>
      <div className="w-full bg-base-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STATUT_CFG = {
  nouveau:  { label: "Nouveau",  color: "text-info",    bg: "bg-info/10",    icon: ClockIcon },
  en_cours: { label: "En cours", color: "text-warning",  bg: "bg-warning/10", icon: RefreshCcwIcon },
  confirme: { label: "Confirmé", color: "text-purple-500", bg: "bg-purple-50", icon: CheckCircleIcon },
  conclu:   { label: "Conclu",   color: "text-success", bg: "bg-success/10", icon: CheckCircleIcon },
  annule:   { label: "Annulé",   color: "text-error",   bg: "bg-error/10",   icon: XCircleIcon },
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: statsApi.getDashboard,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/40 text-sm">Chargement…</p>
      </div>
    );
  }

  const d = data ?? {};
  const recentesDemandes = d.recentesDemandes ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── En-tête ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold">Tableau de bord</h2>
          <p className="text-base-content/50 text-sm">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {d.demandesNouvelles > 0 && (
          <Link to="/demandes" className="btn btn-error btn-sm gap-2 animate-pulse">
            <ClipboardListIcon className="size-4" />
            {d.demandesNouvelles} nouvelle{d.demandesNouvelles > 1 ? "s" : ""} demande{d.demandesNouvelles > 1 ? "s" : ""} !
          </Link>
        )}
      </div>

      {/* ── KPIs principaux ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BuildingIcon}     label="Biens publiés"     value={d.totalBiens}      sub={`${d.biensDisponibles ?? 0} disponibles`}   color="bg-primary"   badge={d.biensVerifies ? `${d.biensVerifies} vérifiés` : null} badgeColor="badge-success" />
        <StatCard icon={ClipboardListIcon} label="Demandes totales"  value={d.totalDemandes}   sub={`${d.demandesNouvelles ?? 0} en attente`}    color="bg-warning"   badge={d.demandesNouvelles > 0 ? "Nouveau" : null} badgeColor="badge-error" />
        <StatCard icon={UsersIcon}         label="Clients app"       value={d.totalClients}    sub={`${d.totalBailleurs ?? 0} bailleurs`}        color="bg-info" />
        <StatCard icon={BanknoteIcon}      label="Commissions totales" value={`${(d.totalCommissions ?? 0).toLocaleString("fr-FR")} F`} sub={`${(d.commissionsMois ?? 0).toLocaleString("fr-FR")} F ce mois`} color="bg-success" />
      </div>

      {/* ── Ligne 2 : Biens + Demandes ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Répartition biens */}
        <div className="card bg-base-100 border border-base-content/10 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Biens</h3>
              <Link to="/biens" className="btn btn-ghost btn-xs gap-1">Gérer <ArrowRightIcon className="size-3" /></Link>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Disponibles"  value={d.biensDisponibles ?? 0}  max={d.totalBiens || 1} color="bg-success" />
              <ProgressBar label="Loués"        value={d.biensLoues ?? 0}        max={d.totalBiens || 1} color="bg-error" />
              <ProgressBar label="Sur demande"  value={d.biensSurDemande ?? 0}   max={d.totalBiens || 1} color="bg-warning" />
            </div>
            <div className="divider text-xs my-2">Source</div>
            <div className="space-y-3">
              <ProgressBar label="Nos biens"       value={d.biensPropres ?? 0}      max={d.totalBiens || 1} color="bg-primary" />
              <ProgressBar label="Via bailleurs"   value={d.biensViaBailleurs ?? 0} max={d.totalBiens || 1} color="bg-secondary" />
            </div>
          </div>
        </div>

        {/* Entonnoir demandes */}
        <div className="card bg-base-100 border border-base-content/10 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Suivi demandes</h3>
              <Link to="/demandes" className="btn btn-ghost btn-xs gap-1">Voir <ArrowRightIcon className="size-3" /></Link>
            </div>
            <div className="space-y-2">
              {[
                { key: "demandesNouvelles",  label: "Nouvelles",  color: "bg-info/10 text-info" },
                { key: "demandesEnCours",    label: "En cours",   color: "bg-warning/10 text-warning" },
                { key: "demandesConfirmees", label: "Confirmées", color: "bg-purple-100 text-purple-600" },
                { key: "demandesConclues",   label: "Conclues ✓", color: "bg-success/10 text-success" },
                { key: "demandesAnnulees",   label: "Annulées",   color: "bg-error/10 text-error" },
              ].map(({ key, label, color }) => (
                <div key={key} className={`flex items-center justify-between rounded-lg px-3 py-2 ${color}`}>
                  <span className="text-sm font-medium">{label}</span>
                  <span className="font-bold text-lg">{d[key] ?? 0}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-base-content/10 text-center">
              <p className="text-xs text-base-content/50">Taux de conversion</p>
              <p className="text-2xl font-extrabold text-success">{d.tauxConversion ?? 0}%</p>
            </div>
          </div>
        </div>

        {/* Finances du mois */}
        <div className="card bg-base-100 border border-base-content/10 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Finances</h3>
              <Link to="/commissions" className="btn btn-ghost btn-xs gap-1">Détail <ArrowRightIcon className="size-3" /></Link>
            </div>
            <div className="space-y-3">
              <div className="bg-success/10 rounded-xl p-4 text-center">
                <p className="text-xs text-success/80 font-medium">Commissions perçues (total)</p>
                <p className="text-2xl font-extrabold text-success mt-1">
                  {(d.totalCommissions ?? 0).toLocaleString("fr-FR")} F
                </p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <p className="text-xs text-primary/80 font-medium">Ce mois</p>
                <p className="text-xl font-extrabold text-primary mt-1">
                  {(d.commissionsMois ?? 0).toLocaleString("fr-FR")} F
                </p>
                <p className="text-xs text-base-content/40 mt-0.5">{d.locationsMois ?? 0} location(s)</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-base-200 rounded-lg p-2 text-center">
                  <p className="font-bold">{d.totalBailleurs ?? 0}</p>
                  <p className="text-xs text-base-content/50">Bailleurs</p>
                </div>
                <div className="bg-base-200 rounded-lg p-2 text-center">
                  <p className="font-bold">{d.totalClients ?? 0}</p>
                  <p className="text-xs text-base-content/50">Clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Demandes récentes ────────────────────────────── */}
      <div className="card bg-base-100 border border-base-content/10 shadow-sm">
        <div className="card-body p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">Demandes en attente de traitement</h3>
              <p className="text-xs text-base-content/40 mt-0.5">À traiter en priorité</p>
            </div>
            <Link to="/demandes" className="btn btn-primary btn-sm gap-1">
              Tout voir <ArrowRightIcon className="size-3" />
            </Link>
          </div>

          {recentesDemandes.length === 0 ? (
            <div className="text-center py-8 text-base-content/30">
              <CheckCircleIcon className="size-10 mx-auto mb-2 text-success" />
              <p className="font-medium">Toutes les demandes sont traitées 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentesDemandes.map((d) => {
                const cfg = STATUT_CFG[d.statut] ?? STATUT_CFG.nouveau;
                const Icon = cfg.icon;
                return (
                  <Link
                    key={d._id}
                    to="/demandes"
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-base-200 transition-colors"
                  >
                    <div className={`size-9 rounded-full flex items-center justify-center font-bold text-primary bg-primary/10 shrink-0`}>
                      {(d.client?.nom ?? "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{d.client?.nom ?? "—"}</p>
                      <p className="text-xs text-base-content/50 truncate">
                        🏠 {d.bien?.titre ?? "Bien supprimé"} — {d.bien?.quartier}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`badge badge-xs ${cfg.bg} ${cfg.color} border-0`}>{cfg.label}</span>
                      <span className="text-xs text-base-content/40">
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
