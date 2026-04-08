import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import SafeScreen from "@/components/SafeScreen";
import LoginWall from "@/components/LoginWall";
import { demandeApi } from "@/lib/api";

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  nouveau:  { label: "En attente",  color: "#2563EB", bg: "#EFF6FF", icon: "time-outline" },
  en_cours: { label: "En cours",    color: "#D97706", bg: "#FFFBEB", icon: "sync-outline" },
  confirme: { label: "Confirmé",    color: "#7C3AED", bg: "#F5F3FF", icon: "checkmark-circle-outline" },
  conclu:   { label: "Conclu ✓",   color: "#16A34A", bg: "#F0FDF4", icon: "checkmark-done-circle" },
  annule:   { label: "Annulé",      color: "#DC2626", bg: "#FEF2F2", icon: "close-circle-outline" },
};

function formatDate(d: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}
function formatPrix(p: number) {
  return new Intl.NumberFormat("fr-FR").format(p) + " FCFA";
}

export default function DemandesScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ["mesDemandes"],
    queryFn:  demandeApi.mesDemandes,
    enabled:  !!isSignedIn,
  });

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <SafeScreen>
        <View className="px-5 pt-6 pb-2">
          <Text className="text-text-primary text-2xl font-extrabold">Mes demandes</Text>
        </View>
        <LoginWall
          icon="document-text-outline"
          title="Suivez vos demandes de visite"
          message="Connectez-vous pour retrouver toutes vos demandes et leur statut en temps réel."
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-text-primary text-2xl font-extrabold">Mes demandes</Text>
          <Text className="text-text-secondary text-sm mt-0.5">
            {(demandes as any[]).length} demande{(demandes as any[]).length > 1 ? "s" : ""}
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#1A1A2E" />
          </View>
        ) : (demandes as any[]).length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: "#F0F0EC" }}>
              <Ionicons name="document-text-outline" size={30} color="#9AA0AA" />
            </View>
            <Text className="text-text-primary font-bold text-lg">Aucune demande</Text>
            <Text className="text-text-secondary text-sm mt-2 text-center leading-5">
              Vos demandes de visite apparaîtront ici.
            </Text>
          </View>
        ) : (
          <View className="px-5 space-y-3">
            {(demandes as any[]).map((d) => {
              const cfg = STATUT_CONFIG[d.statut] ?? STATUT_CONFIG.nouveau;
              return (
                <View key={d._id}
                  className="bg-surface rounded-2xl overflow-hidden"
                  style={{ borderWidth: 1, borderColor: "#E5E5E0",
                    shadowColor: "#1A1A2E", shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05, elevation: 2 }}>

                  {/* Bandeau statut */}
                  <View className="flex-row items-center justify-between px-4 py-2.5"
                    style={{ backgroundColor: cfg.bg }}>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={cfg.icon as any} size={15} color={cfg.color} />
                      <Text className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</Text>
                    </View>
                    <Text className="text-xs text-text-muted">{formatDate(d.createdAt)}</Text>
                  </View>

                  {/* Bien */}
                  <View className="px-4 py-3">
                    <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
                      {d.bien?.titre ?? "Bien supprimé"}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="location-outline" size={12} color="#9AA0AA" />
                      <Text className="text-text-secondary text-sm ml-1">{d.bien?.quartier}</Text>
                    </View>
                    <Text className="text-text-primary font-extrabold mt-1">
                      {formatPrix(d.bien?.prix ?? 0)}
                      <Text className="text-text-secondary text-xs font-normal"> /mois</Text>
                    </Text>
                  </View>

                  {/* Détails */}
                  <View className="px-4 pb-4 pt-2 border-t border-border">
                    <View className="flex-row justify-between">
                      <View>
                        <Text className="text-xs text-text-muted">Type</Text>
                        <Text className="text-text-primary text-sm font-semibold capitalize mt-0.5">
                          {d.typeDemande}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-xs text-text-muted">Date souhaitée</Text>
                        <Text className="text-text-primary text-sm font-semibold mt-0.5">
                          {d.datePreferee ? formatDate(d.datePreferee) : "Flexible"}
                        </Text>
                      </View>
                      {d.heureConfirmee && (
                        <View>
                          <Text className="text-xs text-text-muted">Confirmée</Text>
                          <Text className="text-sm font-bold mt-0.5" style={{ color: "#16A34A" }}>
                            {formatDate(d.heureConfirmee)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {d.statut === "conclu" && (
                      <View className="mt-3 rounded-xl p-3 flex-row items-center gap-2"
                        style={{ backgroundColor: "#F0FDF4" }}>
                        <Ionicons name="checkmark-done-circle" size={18} color="#16A34A" />
                        <Text className="text-sm font-semibold" style={{ color: "#16A34A" }}>
                          Location finalisée avec succès !
                        </Text>
                      </View>
                    )}
                    {d.statut === "confirme" && (
                      <View className="mt-3 rounded-xl p-3 flex-row items-center gap-2"
                        style={{ backgroundColor: "#F5F3FF" }}>
                        <Ionicons name="notifications" size={15} color="#7C3AED" />
                        <Text className="text-sm" style={{ color: "#7C3AED" }}>
                          Visite confirmée — notre équipe vous contactera.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
