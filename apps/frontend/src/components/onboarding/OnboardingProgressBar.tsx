import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * OnboardingProgressBar
 *
 * Renders the 4-step dot-line stepper used across all onboarding screens.
 *
 * Steps:  1=OTP Phone  2=OTP Verify  3=Details  4=Category
 *
 * Props:
 *   step        — which step is currently active (1-indexed, 1..4)
 *   primaryColor — the theme primary colour (dot & line fill)
 */

interface Props {
  step: 1 | 2 | 3 | 4;
  primaryColor: string;
}

const INACTIVE_LINE  = "rgba(255,255,255,0.15)";
const INACTIVE_BORDER = "rgba(255,255,255,0.3)";

export function OnboardingProgressBar({ step, primaryColor }: Props) {
  /** Returns true for steps already completed (filled solid dot + solid line before them) */
  const isDone    = (s: number) => s < step;
  const isActive  = (s: number) => s === step;
  const isInactive = (s: number) => s > step;

  const renderDot = (s: number) => {
    if (isDone(s)) {
      return (
        <View
          key={`dot-${s}`}
          style={[styles.dotSolid, { backgroundColor: primaryColor }]}
        />
      );
    }
    if (isActive(s)) {
      return (
        <View
          key={`dot-${s}`}
          style={[styles.dotOutline, { borderColor: primaryColor }]}
        >
          <View style={[styles.dotInner, { backgroundColor: primaryColor }]} />
        </View>
      );
    }
    // inactive
    return (
      <View
        key={`dot-${s}`}
        style={[styles.dotInactive, { borderColor: INACTIVE_BORDER }]}
      />
    );
  };

  const renderLine = (afterStep: number) => {
    const filled = afterStep < step; // line between step afterStep and afterStep+1 is filled when we're past it
    return (
      <View
        key={`line-${afterStep}`}
        style={[
          styles.line,
          { backgroundColor: filled ? primaryColor : INACTIVE_LINE },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderDot(1)}
      {renderLine(1)}
      {renderDot(2)}
      {renderLine(2)}
      {renderDot(3)}
      {renderLine(3)}
      {renderDot(4)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Solid filled dot — completed step */
  dotSolid: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  /* Outline + inner dot — active step */
  dotOutline: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  /* Empty ring — future step */
  dotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },

  line: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
    borderRadius: 1,
  },
});
