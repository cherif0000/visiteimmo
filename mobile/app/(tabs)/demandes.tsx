import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { demandeApi } from "@/lib/api";

const GOLD = "#D4A843";

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  nouveau:  { label: "En attente",  color: "#3B82F6", bg: "#3B82F620", icon: "time-outline" },
  en_cours: { label: "En cours",    color: "#F59E0B", bg: "#F59E0B20", icon: "sync-outline" },
  confirme: { label: "Confirmé",    color: "#8B5CF6", bg: "#8B5CF620", icon: "checkmark-circle-outline" },
  conclu:   { label: "Conclu ✓",   color: "#10B981", bg: "#10B98120", icon: "checkmark-done-circle" },
  annule:   { label: "Annulé",      color: "#EF4444", bg: "#EF444420", icon: "close-circle-outline" },
};

function formatDate(d: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}

function formatPrix(p: number) {
  return new Intl.NumberFormat("fr-FR").format(p) + " FCFA";
}

export default function DemandesScreen() {
  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ["mesDemandes"],
    queryFn: demandeApi.mesDemandes,
  });

  return (
    <SafeScreen>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6 pb-4">
          <Text className="text-text-primary text-2xl font-bold">Mes demandes</Text>
          <Text className="text-text-secondary text-sm mt-1">{demandes.length} demande(s)</Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={GOLD} />
          </View>
        ) : demandes.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <Ionicons name="document-text-outline" size={56} color="#4A6580" />
            <Text className="text-text-primary font-bold text-lg mt-4">Aucune demande</Text>
            <Text className="text-text-secondary text-sm mt-2 text-center">
              Tes demandes de visite et réservations apparaîtront ici.
            </Text>
          </View>
        ) : (
          <View className="px-5 space-y-4">
            {(demandes as any[]).map((d) => {
              const cfg = STATUT_CONFIG[d.statut] ?? STATUT_CONFIG.nouveau;
              return (
                <View key={d._id} className="bg-surface rounded-2xl overflow-hidden"
                  style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 }}>

                  {/* Header statut */}
                  <View className="flex-row items-center justify-between px-4 py-3"
                    style={{ backgroundColor: cfg.bg }}>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
                      <Text className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</Text>
                    </View>
                    <Text className="text-xs opacity-50 text-text-secondary">{formatDate(d.createdAt)}</Text>
                  </View>

                  {/* Bien */}
                  <View className="px-4 py-3">
                    <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
                      {d.bien?.titre ?? "Bien supprimé"}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="location-outline" size={13} color="#8DA3B5" />
                      <Text className="text-text-secondary text-sm ml-1">{d.bien?.quartier}</Text>
                    </View>
                    <Text className="text-amber-400 font-bold mt-1">{formatPrix(d.bien?.prix ?? 0)}<Text className="text-text-secondary text-xs font-normal"> /mois</Text></Text>
                  </View>

                  {/* Détails demande */}
                  <View className="px-4 pb-4 border-t border-base-200 pt-3">
                    <View className="flex-row justify-between">
                      <View>
                        <Text className="text-xs text-text-secondary opacity-60">Type</Text>
                        <Text className="text-text-primary text-sm capitalize font-medium">{d.typeDemande}</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-text-secondary opacity-60">Date préférée</Text>
                        <Text className="text-text-primary text-sm font-medium">
                          {d.datePreferee ? formatDate(d.datePreferee) : "Flexible"}
                        </Text>
                      </View>
                      {d.heureConfirmee && (
                        <View>
                          <Text className="text-xs text-text-secondary opacity-60">Confirmé le</Text>
                          <Text className="text-green-400 text-sm font-bold">{formatDate(d.heureConfirmee)}</Text>
                        </View>
                      )}
                    </View>
                    {d.statut === "conclu" && (
                      <View className="mt-3 bg-green-500/10 rounded-xl p-3 flex-row items-center gap-2">
                        <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
                        <Text className="text-green-400 text-sm font-semibold">Location finalisée avec succès !</Text>
                      </View>
                    )}
                    {d.statut === "confirme" && (
                      <View className="mt-3 bg-purple-500/10 rounded-xl p-3 flex-row items-center gap-2">
                        <Ionicons name="notifications" size={16} color="#8B5CF6" />
                        <Text className="text-purple-400 text-sm">Visite confirmée — l'équipe vous contactera.</Text>
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
