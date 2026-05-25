import { Platform, ToastAndroid } from "react-native";

export const showToast = (
  message: string,
  duration: "short" | "long" = "short",
) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(
      message,
      duration === "short" ? ToastAndroid.SHORT : ToastAndroid.LONG,
    );
  } else {
    // For iOS, you would typically use a third-party library like sonner-native or react-native-toast-message
    console.log("Toast:", message);
  }
};

export const showErrorToast = (message: string) => {
  showToast(`Error: ${message}`, "long");
};

export const showSuccessToast = (message: string) => {
  showToast(`✓ ${message}`, "short");
};

export const showInfoToast = (message: string) => {
  showToast(`ℹ️ ${message}`, "short");
};
