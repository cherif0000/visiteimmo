import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { bienApi, demandeApi, userApi } from "@/lib/api";
import SafeScreen from "@/components/SafeScreen";

const { width: W } = Dimensions.get("window");

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement", maison: "Maison",
  hotel: "Hôtel", location_temporaire: "Court séjour",
};
const STATUT_COLORS: Record<string, string> = {
  disponible: "#16A34A", loue: "#DC2626", sur_demande: "#D97706",
};
const STATUT_LABELS: Record<string, string> = {
  disponible: "Disponible", loue: "Loué", sur_demande: "Sur demande",
};

function formatPrix(p: number) {
  return new Intl.NumberFormat("fr-FR").format(p) + " FCFA";
}

export default function BienDetailScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const { isSignedIn } = useAuth();
  const { user }  = useUser();
  const qc        = useQueryClient();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm] = useState({
    nom:          user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
    telephone:    "",
    email:        user?.emailAddresses?.[0]?.emailAddress ?? "",
    typeDemande:  "visite" as "visite" | "reservation",
    message:      "",
  });

  const { data: bien, isLoading } = useQuery({
    queryKey: ["bien", id],
    queryFn:  () => bienApi.getById(id!),
    enabled:  !!id,
  });

  // Favoris
  const { data: favorisData } = useQuery({
    queryKey: ["favoris"],
    queryFn:  userApi.getFavoris,
    enabled:  !!isSignedIn,
  });
  const favorisIds: string[] = (favorisData?.favoris ?? []).map((b: any) =>
    typeof b === "string" ? b : b._id
  );
  const isFavori = id ? favorisIds.includes(id) : false;

  const toggleFavMut = useMutation({
    mutationFn: () => userApi.toggleFavori(id!),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["favoris"] }),
  });

  const demandeMut = useMutation({
    mutationFn: demandeApi.create,
    onSuccess:  (data) => {
      Alert.alert("Demande envoyée ✅", data.message, [
        { text: "OK", onPress: () => { setShowForm(false); router.push("/(tabs)/demandes"); } },
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Erreur", err?.response?.data?.message ?? "Une erreur est survenue.");
    },
  });

  const handleSubmit = () => {
    if (!form.nom.trim() || !form.telephone.trim()) {
      Alert.alert("Champs requis", "Merci de renseigner votre nom et numéro de téléphone.");
      return;
    }
    demandeMut.mutate({ bienId: id, ...form });
  };

  const handleDemandePress = () => {
    if (!isSignedIn) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour faire une demande de visite.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/(auth)") },
        ]
      );
      return;
    }
    setShowForm(true);
  };

  const handleFavoriPress = () => {
    if (!isSignedIn) {
      Alert.alert(
        "Connexion requise",
        "Connectez-vous pour sauvegarder ce bien.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/(auth)") },
        ]
      );
      return;
    }
    toggleFavMut.mutate();
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1A1A2E" />
        </View>
      </SafeScreen>
    );
  }
  if (!bien) return null;

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Carousel photos ─────────────────────── */}
        <View className="relative">
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / W))
            }
          >
            {(bien.photos?.length > 0 ? bien.photos : [""])?.map((uri: string, i: number) => (
              <View key={i} style={{ width: W, height: 300 }}>
                {uri ? (
                  <Image source={{ uri }} style={{ width: W, height: 300 }} contentFit="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#F0F0EC" }}>
                    <Ionicons name="image-outline" size={60} color="#9AA0AA" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Bouton retour */}
          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1A2E" />
          </TouchableOpacity>

          {/* Bouton favori */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
            onPress={handleFavoriPress}
            disabled={toggleFavMut.isPending}
          >
            <Ionicons
              name={isFavori ? "heart" : "heart-outline"}
              size={20}
              color={isFavori ? "#DC2626" : "#5C6472"}
            />
          </TouchableOpacity>

          {/* Pagination dots */}
          {bien.photos?.length > 1 && (
            <View className="absolute bottom-4 w-full flex-row justify-center gap-1.5">
              {bien.photos.map((_: any, i: number) => (
                <View key={i} className="rounded-full"
                  style={{
                    width: i === photoIndex ? 16 : 6, height: 6,
                    backgroundColor: i === photoIndex ? "#fff" : "rgba(255,255,255,0.5)",
                  }} />
              ))}
            </View>
          )}

          {/* Statut */}
          <View className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: STATUT_COLORS[bien.statut] + "EE" }}>
            <Text className="text-white text-xs font-bold">{STATUT_LABELS[bien.statut]}</Text>
          </View>
        </View>

        {/* ── Contenu ──────────────────────────────── */}
        <View className="px-5 pt-5">

          {/* Titre + badge vérifié */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-text-primary text-xl font-extrabold flex-1 mr-3">{bien.titre}</Text>
            {bien.verifie && (
              <View className="flex-row items-center gap-1 px-2 py-1 rounded-full"
                style={{ backgroundColor: "#F0FDF4" }}>
                <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                <Text className="text-xs font-bold" style={{ color: "#16A34A" }}>Vérifié</Text>
              </View>
            )}
          </View>

          {/* Localisation */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={14} color="#9AA0AA" />
            <Text className="text-text-secondary text-sm ml-1">{bien.quartier}, {bien.ville}</Text>
          </View>

          {/* Étage / numéro */}
          {(bien.etage !== null && bien.etage !== undefined || bien.numeroBien) && (
            <View className="flex-row items-center gap-2 mb-3 px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "#F0F0EC" }}>
              <Ionicons name="layers-outline" size={15} color="#5C6472" />
              <Text className="text-text-secondary text-sm">
                {bien.etage !== null && bien.etage !== undefined
                  ? (bien.etage === 0 ? "Rez-de-chaussée" : `${bien.etage}ème étage`)
                  : ""}
                {bien.etage !== null && bien.etage !== undefined && bien.numeroBien ? " • " : ""}
                {bien.numeroBien || ""}
              </Text>
            </View>
          )}

          {/* Prix */}
          <View className="rounded-2xl p-4 mb-5"
            style={{ backgroundColor: "#F7F7F5", borderWidth: 1, borderColor: "#E5E5E0" }}>
            <Text className="text-text-primary text-3xl font-extrabold">
              {formatPrix(bien.prix)}
              <Text className="text-text-secondary text-base font-normal"> /mois</Text>
            </Text>
            {bien.caution > 0 && (
              <Text className="text-text-secondary text-sm mt-1">Caution : {formatPrix(bien.caution)}</Text>
            )}
            {bien.chargesIncluses && (
              <View className="flex-row items-center gap-1 mt-1">
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text className="text-sm font-medium" style={{ color: "#16A34A" }}>Charges incluses</Text>
              </View>
            )}
          </View>

          {/* Caractéristiques */}
          <View className="flex-row flex-wrap gap-2 mb-5">
            {[
              { icon: "home-outline",       label: TYPE_LABELS[bien.type] ?? bien.type },
              { icon: "bed-outline",        label: `${bien.chambres} chambre${bien.chambres > 1 ? "s" : ""}` },
              { icon: bien.meuble ? "checkmark-circle-outline" : "close-circle-outline",
                label: bien.meuble ? "Meublé" : "Non meublé",
                color: bien.meuble ? "#16A34A" : "#9AA0AA" },
              bien.surface ? { icon: "resize-outline", label: `${bien.surface} m²` } : null,
            ].filter(Boolean).map((c: any, i) => (
              <View key={i} className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ backgroundColor: "#F0F0EC" }}>
                <Ionicons name={c.icon} size={14} color={c.color ?? "#1A1A2E"} />
                <Text className="text-text-primary text-sm font-medium">{c.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-text-primary font-bold text-base mb-2">Description</Text>
            <Text className="text-text-secondary text-sm leading-6">{bien.description}</Text>
          </View>

          {/* Formulaire de demande */}
          {showForm && (
            <View className="rounded-2xl p-5 mb-4"
              style={{ backgroundColor: "#F7F7F5", borderWidth: 1, borderColor: "#E5E5E0" }}>
              <Text className="text-text-primary font-bold text-base mb-4">Demande de visite</Text>

              {/* Type */}
              <View className="flex-row gap-3 mb-4">
                {(["visite", "reservation"] as const).map((t) => (
                  <TouchableOpacity
                    key={t} onPress={() => setForm((f) => ({ ...f, typeDemande: t }))}
                    className="flex-1 py-2.5 rounded-xl items-center"
                    style={{
                      backgroundColor: form.typeDemande === t ? "#1A1A2E" : "#fff",
                      borderWidth: 1.5,
                      borderColor:  form.typeDemande === t ? "#1A1A2E" : "#E5E5E0",
                    }}
                  >
                    <Text className="font-semibold capitalize text-sm"
                      style={{ color: form.typeDemande === t ? "#fff" : "#5C6472" }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {[
                { field: "nom",       placeholder: "Votre nom complet *",  icon: "person-outline" },
                { field: "telephone", placeholder: "Numéro WhatsApp *",     icon: "call-outline",  keyboard: "phone-pad" },
                { field: "email",     placeholder: "Email (optionnel)",     icon: "mail-outline",  keyboard: "email-address" },
              ].map(({ field, placeholder, icon, keyboard }) => (
                <View key={field} className="flex-row items-center bg-surface rounded-xl px-4 py-3 mb-3"
                  style={{ borderWidth: 1, borderColor: "#E5E5E0" }}>
                  <Ionicons name={icon as any} size={17} color="#9AA0AA" />
                  <TextInput
                    className="flex-1 ml-3 text-text-primary text-sm"
                    placeholder={placeholder}
                    placeholderTextColor="#9AA0AA"
                    keyboardType={keyboard as any}
                    value={(form as any)[field]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                  />
                </View>
              ))}

              <TextInput
                className="bg-surface rounded-xl px-4 py-3 text-text-primary text-sm mb-4"
                style={{ borderWidth: 1, borderColor: "#E5E5E0", textAlignVertical: "top" }}
                placeholder="Message (optionnel)"
                placeholderTextColor="#9AA0AA"
                multiline numberOfLines={3}
                value={form.message}
                onChangeText={(v) => setForm((f) => ({ ...f, message: v }))}
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ borderWidth: 1, borderColor: "#E5E5E0" }}
                  onPress={() => setShowForm(false)}
                >
                  <Text className="text-text-secondary font-semibold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: "#1A1A2E" }}
                  onPress={handleSubmit}
                  disabled={demandeMut.isPending}
                >
                  {demandeMut.isPending
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text className="font-bold text-white">Envoyer</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── CTA flottant ─────────────────────────── */}
      {!showForm && bien.statut !== "loue" && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-white"
          style={{ borderTopWidth: 1, borderTopColor: "#E5E5E0" }}>
          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: "#1A1A2E" }}
            onPress={handleDemandePress}
          >
            <Text className="font-bold text-base text-white">
              Demander une visite
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!showForm && bien.statut === "loue" && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-white"
          style={{ borderTopWidth: 1, borderTopColor: "#E5E5E0" }}>
          <View className="w-full py-4 rounded-2xl items-center" style={{ backgroundColor: "#F0F0EC" }}>
            <Text className="text-text-secondary font-bold">Ce bien n'est plus disponible</Text>
          </View>
        </View>
      )}
    </SafeScreen>
  );
}
