import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useWalletStore } from "@/hooks/useWalletStore";
import theme from "@/theme/theme";

export const CustomCoinIcon = ({ size = 16, cTheme }: { size?: number, cTheme: any }) => {
  return (
    <View style={{
      width: size, 
      height: size,
      borderRadius: size / 2,
      backgroundColor: cTheme.coin.outer,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: cTheme.coin.shadow,
      // subtle glow/shadow
      shadowColor: cTheme.glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{
        width: size * 0.55, 
        height: size * 0.55,
        borderRadius: size * 0.3,
        backgroundColor: cTheme.coin.inner,
        borderWidth: 1,
        borderColor: cTheme.coin.highlight,
        borderStyle: 'solid',
      }} />
    </View>
  );
};

export function CoinBalanceBadge() {
  const router = useRouter();
  const balance = useWalletStore((state) => state.balance);
  const cTheme = (theme as any).coins;

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: cTheme.background, 
          borderColor: cTheme.border 
        }
      ]} 
      onPress={() => router.push("/coins")} 
      activeOpacity={0.7}
    >
      <CustomCoinIcon size={16} cTheme={cTheme} />
      <Text style={[styles.balanceText, { color: cTheme.text }]}>
        {balance}
      </Text>
      <Text style={[styles.plusSign, { color: cTheme.plus }]}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginLeft: 12,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  plusSign: {
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 2,
  }
});
