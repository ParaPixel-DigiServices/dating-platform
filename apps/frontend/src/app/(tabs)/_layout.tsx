import { Tabs } from "expo-router";
import { BottomNav } from "@/components/ui/BottomNav";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <BottomNav />}
      screenOptions={{ headerShown: false }}
    />
  );
}
