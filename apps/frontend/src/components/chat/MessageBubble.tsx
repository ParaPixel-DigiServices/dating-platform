import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  timestamp: string;
  theme: any;
}

export function MessageBubble({ text, isSender, timestamp, theme }: MessageBubbleProps) {
  // Use theme colors for bubbles to ensure consistency across categories
  const bubbleBackgroundColor = isSender ? theme.primary : theme.secondary;
  const textColor = isSender ? "#FFFFFF" : theme.textPrimary; // Assuming primary is colorful, text should be white
  const timeColor = isSender ? "rgba(255, 255, 255, 0.7)" : theme.textSecondary;

  return (
    <View style={[styles.container, isSender ? styles.senderContainer : styles.receiverContainer]}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: bubbleBackgroundColor },
          isSender ? styles.senderBubble : styles.receiverBubble,
        ]}
      >
        <Text style={[styles.messageText, { color: textColor }]}>{text}</Text>
        <Text style={[styles.timeText, { color: timeColor }]}>{timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 4,
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  senderContainer: {
    justifyContent: "flex-end",
  },
  receiverContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  senderBubble: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Lato_400Regular",
    lineHeight: 22,
  },
  timeText: {
    fontSize: 10,
    fontFamily: "Lato_400Regular",
    alignSelf: "flex-end",
    marginTop: 4,
  },
});
