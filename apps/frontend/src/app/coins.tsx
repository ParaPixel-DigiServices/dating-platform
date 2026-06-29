import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "@/theme/theme";
import { useWalletStore } from "@/hooks/useWalletStore";
import { CustomCoinIcon } from "@/components/home/CoinBalanceBadge";

// Dummy data updated for ₹ and strikethrough logic
const PACKAGES = [
  { 
    id: "basic", 
    title: "50", 
    subtitle: "Perfect to get started", 
    coins: 50, 
    price: "₹49.00", 
    originalPrice: null, 
    saveTag: null, 
    offTag: null,
    popular: false 
  },
  { 
    id: "pro", 
    title: "100", 
    subtitle: "Most popular choice", 
    coins: 100, 
    price: "₹89.00", 
    originalPrice: "₹98.00", 
    saveTag: "Save 10%", 
    offTag: "10% OFF",
    popular: false 
  },
  { 
    id: "ultra", 
    title: "200", 
    subtitle: "Best value for more matches", 
    coins: 200, 
    price: "₹149.00", 
    originalPrice: "₹196.00", 
    saveTag: "Save 20%", 
    offTag: "20% OFF",
    popular: false 
  },
];

// Reusable 2D Coin Cluster
const CoinCluster = ({ size, cTheme }: { size: number; cTheme: any }) => {
  return (
    <View style={{ width: size * 1.6, height: size * 1.3, position: "relative" }}>
      {/* Bottom left small coin */}
      <View style={{ position: "absolute", bottom: 0, left: 0 }}>
        <CustomCoinIcon size={size * 0.75} cTheme={cTheme} />
      </View>
      {/* Middle right small coin */}
      <View style={{ position: "absolute", top: size * 0.2, left: size * 0.35 }}>
        <CustomCoinIcon size={size * 0.75} cTheme={cTheme} />
      </View>
      {/* Top overlapping big coin */}
      <View style={{ position: "absolute", top: 0, right: 0 }}>
        <CustomCoinIcon size={size} cTheme={cTheme} />
      </View>
    </View>
  );
};

export default function CoinShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const t = (theme as any).onboarding;
  const cTheme = (theme as any).coins; // Only used for icons now
  
  const balance = useWalletStore((state) => state.balance);
  const addCoins = useWalletStore((state) => state.addCoins);

  const handlePurchase = (coins: number) => {
    addCoins(coins);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color={t.primaryLight} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.primaryLight }]}>My Coins</Text>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="help-circle" size={24} color={t.primaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO BALANCE CARD */}
        <View style={[styles.balanceCard, { backgroundColor: t.secondary }]}>
          <View style={styles.balanceTopRow}>
            <View style={styles.balanceLeft}>
              <Text style={[styles.balanceLabel, { color: t.textSecondary }]}>Your Balance</Text>
              <Text style={[styles.balanceAmount, { color: t.primaryLight }]}>{balance}</Text>
              <View style={styles.balanceIconRow}>
                <CustomCoinIcon size={16} cTheme={cTheme} />
                <Text style={[styles.balanceIconText, { color: t.textPrimary }]}>Coins</Text>
              </View>
            </View>
            <View style={styles.balanceRight}>
              {/* Massive coin cluster simulation */}
              <CoinCluster size={64} cTheme={cTheme} />
            </View>
          </View>
          
          <View style={[styles.balanceDivider, { backgroundColor: t.border }]} />
          
          <TouchableOpacity style={styles.balanceFooter} activeOpacity={0.7}>
            <Text style={[styles.balanceFooterText, { color: t.textSecondary }]}>Coins help you connect better</Text>
            <Text style={[styles.balanceFooterLink, { color: t.primary }]}>See how to use <Feather name="chevron-right" size={12} /></Text>
          </TouchableOpacity>
        </View>

        {/* WATCH AD CARD */}
        <View style={[styles.adCard, { backgroundColor: t.secondary }]}>
          <View style={[styles.adIconWrap, { borderColor: t.primaryLight }]}>
            <Feather name="youtube" size={24} color={t.primaryLight} />
          </View>
          <View style={styles.adInfo}>
            <Text style={[styles.adTitle, { color: t.textPrimary }]}>Watch an Ad</Text>
            <Text style={[styles.adSubtitle, { color: t.textSecondary }]}>Watch a short ad and earn</Text>
            <Text style={[styles.adHighlight, { color: t.primaryLight }]}>20 Coins</Text>
          </View>
          <TouchableOpacity 
            style={[styles.adButton, { backgroundColor: t.primaryLight }]} 
            activeOpacity={0.8}
            onPress={() => handlePurchase(20)}
          >
            <Text style={styles.adButtonText}>Watch Ad <Ionicons name="play" size={12} /></Text>
          </TouchableOpacity>
        </View>

        {/* BUY COINS SECTION */}
        <View style={styles.buyHeaderRow}>
          <View>
            <Text style={[styles.buyTitle, { color: t.textPrimary }]}>Buy Coins</Text>
            <Text style={[styles.buySubtitle, { color: t.textSecondary }]}>Choose a pack and get more coins</Text>
          </View>
          <View style={[styles.bestValueBadge, { backgroundColor: "rgba(229, 179, 153, 0.15)", borderColor: t.primary, borderWidth: 0.5 }]}>
            <Ionicons name="star" size={10} color={t.primaryLight} />
            <Text style={[styles.bestValueText, { color: t.primaryLight }]}>Best Value</Text>
          </View>
        </View>

        {/* PACKAGES LIST */}
        <View style={styles.packagesList}>
          {PACKAGES.map((pkg) => (
            <TouchableOpacity 
              key={pkg.id} 
              style={[styles.packageCard, { backgroundColor: t.secondary, borderColor: t.border }]} 
              activeOpacity={0.8}
              onPress={() => handlePurchase(pkg.coins)}
            >
              {pkg.offTag && (
                <View style={[styles.offBadge, { backgroundColor: "rgba(259, 217, 168, 0.15)" }]}>
                  <Text style={[styles.offText, { color: t.textPrimary }]}>{pkg.offTag}</Text>
                </View>
              )}

              <View style={styles.pkgLeft}>
                <View style={styles.pkgIconContainer}>
                  <CoinCluster size={28} cTheme={cTheme} />
                </View>
                <View style={styles.pkgInfo}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                    <Text style={[styles.pkgCoinsTitle, { color: t.primaryLight }]}>{pkg.title}</Text>
                    <Text style={[styles.pkgCoinsSuffix, { color: t.textPrimary }]}>Coins</Text>
                  </View>
                  <Text style={[styles.pkgSubtitle, { color: t.textSecondary }]}>{pkg.subtitle}</Text>
                  {pkg.saveTag && (
                    <View style={[styles.saveTag, { backgroundColor: "rgba(229, 179, 153, 0.1)" }]}>
                      <Text style={[styles.saveText, { color: t.primaryLight }]}>{pkg.saveTag}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.pkgRight}>
                <View style={[styles.priceButton, { backgroundColor: t.primaryLight }]}>
                  {pkg.originalPrice && (
                    <Text style={[styles.strikethroughPrice, { color: "rgba(0,0,0,0.6)" }]}>{pkg.originalPrice}</Text>
                  )}
                  <Text style={styles.currentPrice}>{pkg.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.secureRow}>
            <Feather name="shield" size={14} color={t.textSecondary} />
            <Text style={[styles.secureText, { color: t.textSecondary }]}>Secure payments powered by trusted partners</Text>
          </View>
          
          <TouchableOpacity style={[styles.historyRow, { backgroundColor: t.secondary, borderColor: t.border }]} activeOpacity={0.7}>
            <View style={styles.historyLeft}>
              <Feather name="clock" size={20} color={t.primaryLight} />
              <Text style={[styles.historyText, { color: t.primaryLight }]}>Transaction History</Text>
            </View>
            <Feather name="chevron-right" size={20} color={t.textSecondary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },

  /* Hero Balance Card */
  balanceCard: {
    borderRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  balanceLeft: {
    flex: 1,
  },
  balanceRight: {
    marginLeft: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 64,
    fontFamily: "PlayfairDisplay_700Bold",
    lineHeight: 74,
  },
  balanceIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  balanceIconText: {
    fontSize: 15,
  },
  balanceDivider: {
    height: 1,
    width: "100%",
    opacity: 0.5,
    marginBottom: 16,
  },
  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceFooterText: {
    fontSize: 13,
  },
  balanceFooterLink: {
    fontSize: 13,
    fontWeight: "500",
  },

  /* Watch Ad Card */
  adCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
  },
  adIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  adInfo: {
    flex: 1,
    marginLeft: 16,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  adSubtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  adHighlight: {
    fontSize: 13,
    fontWeight: "600",
  },
  adButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  adButtonText: {
    color: "#2D211C",
    fontWeight: "700",
    fontSize: 13,
  },

  /* Buy Coins Section */
  buyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  buyTitle: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 4,
  },
  buySubtitle: {
    fontSize: 13,
  },
  bestValueBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* Packages List */
  packagesList: {
    gap: 16,
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    position: "relative",
  },
  offBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  offText: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.8,
  },
  pkgLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pkgIconContainer: {
    width: 60,
    alignItems: "center",
    marginRight: 12,
  },
  pkgInfo: {
    flex: 1,
  },
  pkgCoinsTitle: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  pkgCoinsSuffix: {
    fontSize: 14,
  },
  pkgSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  saveTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  saveText: {
    fontSize: 11,
    fontWeight: "600",
  },
  pkgRight: {
    alignItems: "flex-end",
  },
  priceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 80,
  },
  strikethroughPrice: {
    fontSize: 10,
    textDecorationLine: "line-through",
    marginBottom: 2,
    fontWeight: "500",
  },
  currentPrice: {
    color: "#2D211C",
    fontWeight: "700",
    fontSize: 15,
  },

  /* Footer */
  footer: {
    marginTop: 32,
    gap: 24,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secureText: {
    fontSize: 12,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
