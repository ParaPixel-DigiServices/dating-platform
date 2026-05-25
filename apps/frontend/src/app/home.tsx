// Redirect shim — the real home screen lives in (tabs)/home.tsx
// This keeps backward-compat for router.replace("/home") calls from category.tsx.
import { Redirect } from "expo-router";

export default function HomeRedirect() {
  return <Redirect href="/(tabs)/home" />;
}
