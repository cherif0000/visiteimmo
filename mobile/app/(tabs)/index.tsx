import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  FlatList, ActivityIndicator, Image,
} from "react-native";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import useBiens from "@/hooks/useBiens";

const GOLD = "#D4A843";
const NAVY = "#0F2236";

// ── Filtres disponibles ───────────────────────────────────
const TYPES = [
  { key: "", label: "Tous" },
  { key: "appartement", label: "Appartements" },
  { key: "maison", label: "Maisons" },
  { key: "hotel", label: "Hôtels" },
  { key: "location_temporaire", label: "Court séjour" },
];

const QUARTIERS = ["Almadies", "Mermoz", "Plateau", "Point E", "Fann", "Sacré-Cœur", "Ngor", "Ouakam", "Liberté"];

const STATUT_COLORS: Record<string, string> = {
  disponible: "#2D7D4F",
  loue: "#C0593D",
  sur_demande: "#B8892A",
};

const STATUT_LABELS: Record<string, string> = {
  disponible: "Disponible",
  loue: "Loué",
  sur_demande: "Sur demande",
};

function formatPrix(prix: number) {
  return new Intl.NumberFormat("fr-FR").format(prix) + " FCFA";
}

// ── Carte bien ────────────────────────────────────────────
function BienCard({ bien }: { bien: any }) {
  return (
    <TouchableOpacity
      className="bg-surface rounded-2xl mb-4 overflow-hidden"
      activeOpacity={0.85}
      onPress={() => router.push(`/bien/${bien._id}`)}
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, elevation: 3 }}
    >
      {/* Photo */}
      <View className="relative">
        {bien.photos?.[0] ? (
          <Image source={{ uri: bien.photos[0] }} className="w-full h-48" resizeMode="cover" />
        ) : (
          <View className="w-full h-48 bg-base-200 items-center justify-center">
            <Ionicons name="image-outline" size={40} color="#4A6580" />
          </View>
        )}
        {/* Statut badge */}
        <View
          className="absolute top-3 left-3 px-2 py-1 rounded-full"
          style={{ backgroundColor: STATUT_COLORS[bien.statut] + "EE" }}
        >
          <Text className="text-white text-xs font-bold">{STATUT_LABELS[bien.statut]}</Text>
        </View>
        {/* Vérifié badge */}
        {bien.verifie && (
          <View className="absolute top-3 right-3 bg-amber-500 px-2 py-1 rounded-full flex-row items-center gap-1">
            <Ionicons name="shield-checkmark" size={11} color="#fff" />
            <Text className="text-white text-xs font-bold">Vérifié</Text>
          </View>
        )}
        {/* En vedette */}
        {bien.enVedette && (
          <View className="absolute bottom-3 left-3 bg-yellow-500 px-2 py-1 rounded-full">
            <Text className="text-xs font-bold text-black">⭐ Vedette</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View className="p-4">
        <Text className="text-text-primary text-base font-bold mb-1" numberOfLines={1}>{bien.titre}</Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={13} color="#8DA3B5" />
          <Text className="text-text-secondary text-sm ml-1">{bien.quartier}, {bien.ville}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-amber-400 text-lg font-bold">{formatPrix(bien.prix)}<Text className="text-text-secondary text-xs font-normal"> /mois</Text></Text>
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={14} color="#8DA3B5" />
              <Text className="text-text-secondary text-sm">{bien.chambres}</Text>
            </View>
            {bien.meuble && (
              <View className="bg-amber-500/15 rounded-full px-2 py-0.5">
                <Text className="text-amber-400 text-xs font-semibold">Meublé</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Page principale ───────────────────────────────────────
export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedQuartier, setSelectedQuartier] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [prixMax, setPrixMax] = useState("");

  const { data, isLoading, isError } = useBiens({
    type: selectedType || undefined,
    quartier: selectedQuartier || undefined,
    prixMax: prixMax ? Number(prixMax) : undefined,
    search: search || undefined,
  });

  const biens = data?.biens ?? [];
  const total = data?.total ?? 0;

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header sticky */}
        <View className="bg-background px-5 pt-5 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-text-primary text-2xl font-bold">VisiteImmobilier</Text>
              <Text className="text-text-secondary text-sm">{total} bien(s) disponibles</Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: showFilters ? GOLD : "#1A3C5E" }}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Barre de recherche */}
          <View className="flex-row items-center bg-surface px-4 py-3 rounded-2xl mb-3">
            <Ionicons name="search" size={18} color="#8DA3B5" />
            <TextInput
              className="flex-1 ml-3 text-text-primary text-base"
              placeholder="Quartier, type de bien..."
              placeholderTextColor="#4A6580"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#4A6580" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtres avancés */}
          {showFilters && (
            <View className="bg-surface rounded-2xl p-4 mb-2">
              <Text className="text-text-primary font-semibold mb-3">Filtres</Text>

              {/* Quartier */}
              <Text className="text-text-secondary text-xs mb-2">Quartier</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                {["", ...QUARTIERS].map((q) => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => setSelectedQuartier(q)}
                    className={`mr-2 px-3 py-1.5 rounded-full ${selectedQuartier === q ? "bg-amber-500" : "bg-surface/50"}`}
                    style={{ borderWidth: 1, borderColor: selectedQuartier === q ? GOLD : "#1A3C5E" }}
                  >
                    <Text className={`text-xs font-semibold ${selectedQuartier === q ? "text-white" : "text-text-secondary"}`}>
                      {q === "" ? "Tous" : q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Prix max */}
              <Text className="text-text-secondary text-xs mb-2">Prix maximum (FCFA)</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-2 text-text-primary text-sm"
                placeholder="Ex: 300000"
                placeholderTextColor="#4A6580"
                keyboardType="numeric"
                value={prixMax}
                onChangeText={setPrixMax}
              />
            </View>
          )}

          {/* Filtres type (chips) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setSelectedType(t.key)}
                className={`mr-3 px-4 py-2 rounded-full ${selectedType === t.key ? "" : ""}`}
                style={{ backgroundColor: selectedType === t.key ? GOLD : "#1A3C5E40" }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selectedType === t.key ? "#0F2236" : "#8DA3B5" }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste des biens */}
        <View className="px-5 pt-4">
          {isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={GOLD} />
              <Text className="text-text-secondary mt-3">Chargement des biens...</Text>
            </View>
          ) : isError ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="wifi-outline" size={48} color="#4A6580" />
              <Text className="text-text-primary font-bold mt-3">Erreur de connexion</Text>
              <Text className="text-text-secondary text-sm mt-1 text-center">
                Vérifie ta connexion internet et réessaie.
              </Text>
            </View>
          ) : biens.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="home-outline" size={52} color="#4A6580" />
              <Text className="text-text-primary font-bold text-lg mt-3">Aucun bien trouvé</Text>
              <Text className="text-text-secondary text-sm mt-1 text-center px-8">
                Essaie de modifier tes filtres ou d'élargir ta recherche.
              </Text>
            </View>
          ) : (
            biens.map((b: any) => <BienCard key={b._id} bien={b} />)
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
