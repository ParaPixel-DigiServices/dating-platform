import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { OnboardingProgressBar } from "./OnboardingProgressBar";

/**
 * OnboardingTopBar
 *
 * The shared top navigation bar used on every onboarding screen.
 * Contains: back button | progress bar | right slot (help/settings/empty)
 *
 * Props:
 *   step          — current step 1-4, forwarded to OnboardingProgressBar
 *   primaryColor  — theme primary colour
 *   onBack        — callback for the back/chevron button
 *   rightSlot     — optional: 'help' | 'settings' | undefined (renders nothing)
 *   onRightPress  — callback for the right-side icon button
 *   title         — optional screen title shown instead of progress (OTP screen uses it)
 *   textColor     — theme text primary colour (for back icon & title)
 *   secondaryText — theme text secondary colour (for help icon)
 */

type RightSlot = "help" | "settings" | "none";

interface Props {
  step: 1 | 2 | 3 | 4;
  primaryColor: string;
  textColor: string;
  secondaryText: string;
  onBack: () => void;
  rightSlot?: RightSlot;
  onRightPress?: () => void;
}

export function OnboardingTopBar({
  step,
  primaryColor,
  textColor,
  secondaryText,
  onBack,
  rightSlot = "none",
  onRightPress,
}: Props) {
  const renderRight = () => {
    if (rightSlot === "help") {
      return (
        <TouchableOpacity
          style={styles.sideBtn}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Feather name="help-circle" size={20} color={secondaryText} />
        </TouchableOpacity>
      );
    }
    if (rightSlot === "settings") {
      return (
        <TouchableOpacity
          style={[styles.sideBtn, styles.settingsCircle]}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Feather name="settings" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      );
    }
    return <View style={styles.sideBtn} />;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.sideBtn} onPress={onBack} activeOpacity={0.7}>
        <Feather name="chevron-left" size={26} color={textColor} />
      </TouchableOpacity>

      <OnboardingProgressBar step={step} primaryColor={primaryColor} />

      {renderRight()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 16,
  },
  sideBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsCircle: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
