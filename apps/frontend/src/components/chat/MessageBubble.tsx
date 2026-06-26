import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  timestamp: string;
  theme: any;
}

export function MessageBubble({ text, isSender, timestamp, theme }: MessageBubbleProps) {
  const bubbleBackgroundColor = isSender ? theme.primary : theme.secondary;
  const textColor = isSender ? "#1E1410" : theme.textPrimary;
  const timeColor = isSender ? "rgba(30, 20, 16, 0.6)" : theme.textSecondary;
  const bubbleBorderColor = isSender ? theme.primary : theme.border;

  return (
    <View style={[styles.container, isSender ? styles.senderContainer : styles.receiverContainer]}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: bubbleBackgroundColor, borderColor: bubbleBorderColor, borderWidth: 1 },
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
