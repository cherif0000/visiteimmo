import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import SafeScreen from "@/components/SafeScreen";
import useBiens from "@/hooks/useBiens";
import { userApi } from "@/lib/api";

const TYPES = [
  { key: "",                     label: "Tous" },
  { key: "appartement",          label: "Appartements" },
  { key: "maison",               label: "Maisons" },
  { key: "hotel",                label: "Hôtels" },
  { key: "location_temporaire",  label: "Court séjour" },
];
const QUARTIERS = [
  "Almadies","Mermoz","Plateau","Point E","Fann",
  "Sacré-Cœur","Ngor","Ouakam","Liberté",
];
const STATUT_COLORS: Record<string, string> = {
  disponible:  "#16A34A",
  loue:        "#DC2626",
  sur_demande: "#D97706",
};
const STATUT_LABELS: Record<string, string> = {
  disponible:  "Disponible",
  loue:        "Loué",
  sur_demande: "Sur demande",
};

function formatPrix(prix: number) {
  return new Intl.NumberFormat("fr-FR").format(prix) + " FCFA";
}

function BienCard({ bien, isFavori, onToggleFavori }: {
  bien: any; isFavori: boolean; onToggleFavori: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-surface rounded-2xl mb-4 overflow-hidden"
      activeOpacity={0.88}
      onPress={() => router.push(`/bien/${bien._id}`)}
      style={{
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#E5E5E0",
      }}
    >
      {/* Photo */}
      <View className="relative">
        {bien.photos?.[0] ? (
          <Image source={{ uri: bien.photos[0] }} className="w-full h-52" resizeMode="cover" />
        ) : (
          <View className="w-full h-52 items-center justify-center" style={{ backgroundColor: "#F0F0EC" }}>
            <Ionicons name="image-outline" size={40} color="#9AA0AA" />
          </View>
        )}

        {/* Statut */}
        <View
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: STATUT_COLORS[bien.statut] + "EE" }}
        >
          <Text className="text-white text-xs font-bold">{STATUT_LABELS[bien.statut]}</Text>
        </View>

        {/* Cœur favori */}
        <TouchableOpacity
          className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
          onPress={(e) => { e.stopPropagation(); onToggleFavori(); }}
        >
          <Ionicons
            name={isFavori ? "heart" : "heart-outline"}
            size={18}
            color={isFavori ? "#DC2626" : "#5C6472"}
          />
        </TouchableOpacity>

        {/* Vérifié */}
        {bien.verifie && (
          <View className="absolute bottom-3 left-3 flex-row items-center gap-1 px-2 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.92)" }}>
            <Ionicons name="shield-checkmark" size={11} color="#16A34A" />
            <Text className="text-xs font-bold" style={{ color: "#16A34A" }}>Vérifié</Text>
          </View>
        )}
        {bien.enVedette && (
          <View className="absolute bottom-3 right-3 px-2 py-1 rounded-full"
            style={{ backgroundColor: "rgba(200,146,42,0.92)" }}>
            <Text className="text-xs font-bold text-white">⭐ Vedette</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View className="p-4">
        <Text className="text-text-primary text-base font-bold mb-1" numberOfLines={1}>
          {bien.titre}
        </Text>
        <View className="flex-row items-center mb-1">
          <Ionicons name="location-outline" size={13} color="#9AA0AA" />
          <Text className="text-text-secondary text-sm ml-1">{bien.quartier}, {bien.ville}</Text>
        </View>
        {(bien.etage !== null && bien.etage !== undefined || bien.numeroBien) && (
          <View className="flex-row items-center gap-3 mb-2">
            {bien.etage !== null && bien.etage !== undefined && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="layers-outline" size={11} color="#9AA0AA" />
                <Text className="text-text-muted text-xs">
                  {bien.etage === 0 ? "RDC" : `${bien.etage}ème étage`}
                </Text>
              </View>
            )}
            {!!bien.numeroBien && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="keypad-outline" size={11} color="#9AA0AA" />
                <Text className="text-text-muted text-xs">{bien.numeroBien}</Text>
              </View>
            )}
          </View>
        )}
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-text-primary text-lg font-extrabold">
            {formatPrix(bien.prix)}
            <Text className="text-text-secondary text-xs font-normal"> /mois</Text>
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={14} color="#9AA0AA" />
              <Text className="text-text-secondary text-sm">{bien.chambres} ch.</Text>
            </View>
            {bien.meuble && (
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0F0EC" }}>
                <Text className="text-text-secondary text-xs font-medium">Meublé</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch]               = useState("");
  const [selectedType, setSelectedType]   = useState("");
  const [selectedQuartier, setSelectedQuartier] = useState("");
  const [showFilters, setShowFilters]     = useState(false);
  const [prixMax, setPrixMax]             = useState("");

  const { data, isLoading, isError } = useBiens({
    type:     selectedType || undefined,
    quartier: selectedQuartier || undefined,
    prixMax:  prixMax ? Number(prixMax) : undefined,
    search:   search || undefined,
  });

  const { data: favorisData } = useQuery({
    queryKey: ["favoris"],
    queryFn:  userApi.getFavoris,
    enabled:  !!isSignedIn,
  });
  const favorisIds: string[] = (favorisData?.favoris ?? []).map((b: any) =>
    typeof b === "string" ? b : b._id
  );

  const toggleMut = useMutation({
    mutationFn: (bienId: string) => userApi.toggleFavori(bienId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["favoris"] }),
  });

  const handleToggleFavori = (bienId: string) => {
    if (!isSignedIn) {
      router.push("/(tabs)/profile");
      return;
    }
    toggleMut.mutate(bienId);
  };

  const biens = data?.biens ?? [];
  const total = data?.total ?? 0;

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header sticky */}
        <View className="bg-background px-5 pt-5 pb-3">
          {/* Titre */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-text-primary text-2xl font-extrabold tracking-tight">
                VisiteImmobilier
              </Text>
              <Text className="text-text-secondary text-sm mt-0.5">
                {total} bien{total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: showFilters ? "#1A1A2E" : "#F0F0EC",
                borderWidth: 1,
                borderColor: "#E5E5E0",
              }}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options-outline" size={20} color={showFilters ? "#fff" : "#1A1A2E"} />
            </TouchableOpacity>
          </View>

          {/* Recherche */}
          <View className="flex-row items-center bg-surface px-4 py-3 rounded-2xl mb-3"
            style={{ borderWidth: 1, borderColor: "#E5E5E0" }}>
            <Ionicons name="search" size={17} color="#9AA0AA" />
            <TextInput
              className="flex-1 ml-3 text-text-primary text-sm"
              placeholder="Quartier, type de bien…"
              placeholderTextColor="#9AA0AA"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={17} color="#9AA0AA" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtres avancés */}
          {showFilters && (
            <View className="bg-surface rounded-2xl p-4 mb-3"
              style={{ borderWidth: 1, borderColor: "#E5E5E0" }}>
              <Text className="text-text-primary font-semibold mb-3">Filtres</Text>
              <Text className="text-text-muted text-xs mb-2 uppercase tracking-wide">Quartier</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                {["", ...QUARTIERS].map((q) => (
                  <TouchableOpacity
                    key={q} onPress={() => setSelectedQuartier(q)}
                    className="mr-2 px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: selectedQuartier === q ? "#1A1A2E" : "#F0F0EC",
                      borderWidth: 1,
                      borderColor: selectedQuartier === q ? "#1A1A2E" : "#E5E5E0",
                    }}
                  >
                    <Text className="text-xs font-semibold"
                      style={{ color: selectedQuartier === q ? "#fff" : "#5C6472" }}>
                      {q || "Tous"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text className="text-text-muted text-xs mb-2 uppercase tracking-wide">Prix max (FCFA)</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-2.5 text-text-primary text-sm"
                style={{ borderWidth: 1, borderColor: "#E5E5E0" }}
                placeholder="Ex: 300 000"
                placeholderTextColor="#9AA0AA"
                keyboardType="numeric"
                value={prixMax}
                onChangeText={setPrixMax}
              />
            </View>
          )}

          {/* Chips type */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.key} onPress={() => setSelectedType(t.key)}
                className="mr-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: selectedType === t.key ? "#1A1A2E" : "#F0F0EC",
                  borderWidth: 1,
                  borderColor: selectedType === t.key ? "#1A1A2E" : "#E5E5E0",
                }}
              >
                <Text className="text-sm font-semibold"
                  style={{ color: selectedType === t.key ? "#fff" : "#5C6472" }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste */}
        <View className="px-5 pt-4">
          {isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#1A1A2E" />
              <Text className="text-text-secondary mt-3 text-sm">Chargement…</Text>
            </View>
          ) : isError ? (
            <View className="items-center justify-center py-20 px-6">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: "#FEF2F2" }}>
                <Ionicons name="wifi-outline" size={30} color="#DC2626" />
              </View>
              <Text className="text-text-primary font-bold text-lg text-center">Impossible de charger les biens</Text>
              <Text className="text-text-secondary text-sm mt-2 text-center leading-5">
                Le serveur est inaccessible. Vérifie que le backend tourne et que ton téléphone est sur le même réseau WiFi que ton PC.
              </Text>
              <View className="mt-4 px-4 py-3 rounded-xl w-full" style={{ backgroundColor: "#F0F0EC" }}>
                <Text className="text-text-muted text-xs text-center font-mono">
                  {process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api"}
                </Text>
              </View>
            </View>
          ) : biens.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="home-outline" size={52} color="#9AA0AA" />
              <Text className="text-text-primary font-bold text-lg mt-3">Aucun bien trouvé</Text>
              <Text className="text-text-secondary text-sm mt-1 text-center px-8">
                Essaie de modifier tes filtres.
              </Text>
            </View>
          ) : (
            biens.map((b: any) => (
              <BienCard
                key={b._id}
                bien={b}
                isFavori={favorisIds.includes(b._id)}
                onToggleFavori={() => handleToggleFavori(b._id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
