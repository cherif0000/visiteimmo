import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import {
  BuildingIcon, CoinsIcon, ClockIcon, CheckCircleIcon,
  TrendingUpIcon, BanknoteIcon, ArrowRightIcon,
} from "lucide-react";
import { Link } from "react-router";

const fetchPortal = () => axiosInstance.get("/admin/bailleur-portal/stats").then(r => r.data);

function KPI({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-sm">
      <div className="card-body p-5">
        <div className={`size-11 rounded-2xl flex items-center justify-center ${color} mb-3`}>
          <Icon className="size-5 text-white" />
        </div>
        <p className="text-2xl font-extrabold">{value ?? 0}</p>
        <p className="text-base-content/60 text-sm">{label}</p>
        {sub && <p className="text-base-content/40 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function BailleurDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["bailleur-portal"], queryFn: fetchPortal });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  if (!data?.bailleur) return (
    <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
      <BuildingIcon className="size-16 text-base-content/20" />
      <p className="font-bold text-lg">Compte non associé</p>
      <p className="text-base-content/50 text-sm max-w-sm">
        Votre compte Clerk n'est pas encore lié à un profil bailleur.
        Contactez l'administrateur pour associer votre compte.
      </p>
    </div>
  );

  const { bailleur, stats } = data;
  const f = (n) => (n ?? 0).toLocaleString("fr-FR");

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Bonjour, {bailleur.nom} 👋</h1>
        <p className="text-base-content/50 text-sm mt-0.5">
          Voici l'état de vos biens gérés par VisiteImmobilier
        </p>
      </div>

      {/* Alerte nouvelles demandes */}
      {stats.demandesNouvelles > 0 && (
        <div className="alert alert-info">
          <ClockIcon className="size-5 shrink-0" />
          <span>
            <strong>{stats.demandesNouvelles} nouvelle(s) demande(s)</strong> concernant vos biens sont en cours de traitement par notre équipe.
          </span>
          <Link to="/bailleur/demandes" className="btn btn-sm btn-ghost">Voir</Link>
        </div>
      )}

      {/* KPIs biens */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPI icon={BuildingIcon}  label="Total biens"     value={stats.totalBiens}       sub="sur la plateforme"    color="bg-primary" />
        <KPI icon={CheckCircleIcon} label="Disponibles"   value={stats.biensDisponibles} sub="en attente de locataire" color="bg-success" />
        <KPI icon={TrendingUpIcon}  label="Loués"         value={stats.biensLoues}       sub="location active"      color="bg-warning" />
        <KPI icon={ClockIcon}       label="Sur demande"   value={stats.biensSurDemande}  sub="visite en cours"      color="bg-info" />
      </div>

      {/* Finances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-success/10 border border-success/20 shadow-sm">
          <div className="card-body p-5">
            <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Commissions VisiteImmo</p>
            <p className="text-2xl font-extrabold text-success mt-1">{f(stats.commissionsTotales)} F</p>
            <p className="text-xs text-base-content/40 mt-1">Déduit de vos loyers</p>
          </div>
        </div>
        <div className="card bg-primary/10 border border-primary/20 shadow-sm">
          <div className="card-body p-5">
            <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Vous avez reçu</p>
            <p className="text-2xl font-extrabold text-primary mt-1">{f(stats.resteAPayer)} F</p>
            <p className="text-xs text-base-content/40 mt-1">Après déduction commission</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-content/10 shadow-sm">
          <div className="card-body p-5">
            <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Taux commission</p>
            <p className="text-2xl font-extrabold mt-1">{bailleur.tauxCommission}%</p>
            <p className="text-xs text-base-content/40 mt-1">Sur chaque loyer perçu</p>
          </div>
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/bailleur/biens" className="card bg-base-100 border border-base-content/10 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
          <div className="card-body p-4 flex-row items-center gap-4">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BuildingIcon className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Voir mes biens</p>
              <p className="text-xs text-base-content/50">Statuts et disponibilités</p>
            </div>
            <ArrowRightIcon className="size-4 text-base-content/30" />
          </div>
        </Link>
        <Link to="/bailleur/commissions" className="card bg-base-100 border border-base-content/10 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
          <div className="card-body p-4 flex-row items-center gap-4">
            <div className="size-10 bg-success/10 rounded-xl flex items-center justify-center">
              <CoinsIcon className="size-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Mes revenus</p>
              <p className="text-xs text-base-content/50">Historique des paiements</p>
            </div>
            <ArrowRightIcon className="size-4 text-base-content/30" />
          </div>
        </Link>
      </div>

    </div>
  );
}
