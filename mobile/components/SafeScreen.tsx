import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";

const SafeScreen = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {children}
    </View>
  );
};

export default SafeScreen;
