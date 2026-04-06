import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { bienApi, demandeApi, userApi } from "@/lib/api";
import { useUser } from "@clerk/clerk-expo";
import SafeScreen from "@/components/SafeScreen";

const GOLD = "#D4A843";
const { width: SCREEN_W } = Dimensions.get("window");

const TYPE_LABELS: Record<string, string> = {
  appartement: "Appartement", maison: "Maison",
  hotel: "Hôtel", location_temporaire: "Location temporaire",
};

function formatPrix(p: number) {
  return new Intl.NumberFormat("fr-FR").format(p) + " FCFA";
}

export default function BienDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nom: user ? `${user.firstName} ${user.lastName}` : "",
    telephone: "",
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    typeDemande: "visite" as "visite" | "reservation",
    message: "",
  });

  const { data: bien, isLoading } = useQuery({
    queryKey: ["bien", id],
    queryFn: () => bienApi.getById(id!),
    enabled: !!id,
  });

  const demandeMut = useMutation({
    mutationFn: demandeApi.create,
    onSuccess: (data) => {
      Alert.alert(
        "Demande envoyée ✅",
        data.message,
        [{ text: "OK", onPress: () => { setShowForm(false); router.push("/(tabs)/demandes"); } }]
      );
    },
    onError: (err: any) => {
      Alert.alert("Erreur", err?.response?.data?.message ?? "Une erreur est survenue.");
    },
  });

  const handleSubmit = () => {
    if (!form.nom.trim() || !form.telephone.trim()) {
      Alert.alert("Champs requis", "Merci de renseigner ton nom et ton numéro de téléphone.");
      return;
    }
    demandeMut.mutate({ bienId: id, ...form });
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={GOLD} />
        </View>
      </SafeScreen>
    );
  }

  if (!bien) return null;

  const STATUT_COLORS: Record<string, string> = {
    disponible: "#2D7D4F", loue: "#C0593D", sur_demande: "#B8892A",
  };
  const STATUT_LABELS: Record<string, string> = {
    disponible: "Disponible", loue: "Loué", sur_demande: "Sur demande",
  };

  return (
    <SafeScreen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Photos carousel */}
        <View className="relative">
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
          >
            {(bien.photos?.length > 0 ? bien.photos : [""])?.map((uri: string, i: number) => (
              <View key={i} style={{ width: SCREEN_W, height: 280 }}>
                {uri ? (
                  <Image source={{ uri }} style={{ width: SCREEN_W, height: 280 }} contentFit="cover" />
                ) : (
                  <View className="flex-1 bg-surface items-center justify-center">
                    <Ionicons name="image-outline" size={60} color="#4A6580" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Back button */}
          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Photo dots */}
          {bien.photos?.length > 1 && (
            <View className="absolute bottom-3 w-full flex-row justify-center gap-1">
              {bien.photos.map((_: any, i: number) => (
                <View key={i} className="rounded-full" style={{ width: i === photoIndex ? 18 : 6, height: 6, backgroundColor: i === photoIndex ? GOLD : "rgba(255,255,255,0.5)" }} />
              ))}
            </View>
          )}

          {/* Statut badge */}
          <View className="absolute top-4 right-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: STATUT_COLORS[bien.statut] + "EE" }}>
            <Text className="text-white text-xs font-bold">{STATUT_LABELS[bien.statut]}</Text>
          </View>
        </View>

        <View className="px-5 pt-5">
          {/* Titre + badges */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-text-primary text-xl font-bold flex-1 mr-3">{bien.titre}</Text>
            <View className="flex-row gap-2">
              {bien.verifie && (
                <View className="flex-row items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
                  <Ionicons name="shield-checkmark" size={12} color={GOLD} />
                  <Text className="text-amber-400 text-xs font-bold">Vérifié</Text>
                </View>
              )}
            </View>
          </View>

          {/* Localisation */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={15} color="#8DA3B5" />
            <Text className="text-text-secondary text-sm ml-1">{bien.quartier}, {bien.ville}</Text>
          </View>

          {/* Prix */}
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-amber-400 text-3xl font-bold">{formatPrix(bien.prix)}<Text className="text-text-secondary text-base font-normal"> /mois</Text></Text>
            {bien.caution > 0 && <Text className="text-text-secondary text-sm mt-1">Caution : {formatPrix(bien.caution)}</Text>}
            {bien.chargesIncluses && <Text className="text-green-400 text-sm mt-0.5">✓ Charges incluses</Text>}
          </View>

          {/* Caractéristiques */}
          <View className="flex-row flex-wrap gap-3 mb-5">
            {[
              { icon: "home", label: TYPE_LABELS[bien.type] ?? bien.type },
              { icon: "bed", label: `${bien.chambres} chambre(s)` },
              { icon: bien.meuble ? "checkmark-circle" : "close-circle", label: bien.meuble ? "Meublé" : "Non meublé", color: bien.meuble ? "#10B981" : "#6B7280" },
              bien.surface && { icon: "resize", label: `${bien.surface} m²` },
            ].filter(Boolean).map((c: any, i) => (
              <View key={i} className="flex-row items-center gap-1.5 bg-surface px-3 py-2 rounded-xl">
                <Ionicons name={c.icon} size={15} color={c.color ?? GOLD} />
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
          {showForm ? (
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <Text className="text-text-primary font-bold text-base mb-4">Demande de visite</Text>

              {/* Type */}
              <View className="flex-row gap-3 mb-4">
                {(["visite", "reservation"] as const).map((t) => (
                  <TouchableOpacity
                    key={t} onPress={() => setForm((f) => ({ ...f, typeDemande: t }))}
                    className={`flex-1 py-2.5 rounded-xl items-center border`}
                    style={{ backgroundColor: form.typeDemande === t ? GOLD : "transparent", borderColor: form.typeDemande === t ? GOLD : "#1A3C5E" }}
                  >
                    <Text className="font-semibold capitalize" style={{ color: form.typeDemande === t ? "#0F2236" : "#8DA3B5" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {[
                { field: "nom", placeholder: "Votre nom complet *", icon: "person-outline" },
                { field: "telephone", placeholder: "Numéro WhatsApp *", icon: "call-outline", keyboard: "phone-pad" },
                { field: "email", placeholder: "Email (optionnel)", icon: "mail-outline", keyboard: "email-address" },
              ].map(({ field, placeholder, icon, keyboard }) => (
                <View key={field} className="flex-row items-center bg-background rounded-xl px-4 py-3 mb-3">
                  <Ionicons name={icon as any} size={18} color="#4A6580" />
                  <TextInput
                    className="flex-1 ml-3 text-text-primary text-sm"
                    placeholder={placeholder}
                    placeholderTextColor="#4A6580"
                    keyboardType={keyboard as any}
                    value={(form as any)[field]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                  />
                </View>
              ))}

              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-text-primary text-sm mb-4"
                placeholder="Message (optionnel)"
                placeholderTextColor="#4A6580"
                multiline numberOfLines={3}
                value={form.message}
                onChangeText={(v) => setForm((f) => ({ ...f, message: v }))}
                style={{ textAlignVertical: "top" }}
              />

              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 py-3 rounded-xl border border-surface/50 items-center" onPress={() => setShowForm(false)}>
                  <Text className="text-text-secondary font-semibold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: GOLD }}
                  onPress={handleSubmit}
                  disabled={demandeMut.isPending}
                >
                  {demandeMut.isPending
                    ? <ActivityIndicator size="small" color="#0F2236" />
                    : <Text className="font-bold" style={{ color: "#0F2236" }}>Envoyer</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* CTA flottant */}
      {!showForm && bien.statut !== "loue" && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3"
          style={{ backgroundColor: "rgba(15,34,54,0.95)" }}>
          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: GOLD }}
            onPress={() => setShowForm(true)}
          >
            <Text className="font-bold text-base" style={{ color: "#0F2236" }}>
              📅  Demander une visite
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!showForm && bien.statut === "loue" && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3"
          style={{ backgroundColor: "rgba(15,34,54,0.95)" }}>
          <View className="w-full py-4 rounded-2xl items-center bg-surface/50">
            <Text className="text-text-secondary font-bold">Ce bien n'est plus disponible</Text>
          </View>
        </View>
      )}
    </SafeScreen>
  );
}
