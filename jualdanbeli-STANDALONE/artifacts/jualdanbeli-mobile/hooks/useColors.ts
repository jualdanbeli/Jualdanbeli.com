import { useColorScheme } from "react-native";
import colors from "@/constants/colors";

export function useColors() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark" && "dark" in colors;
  const palette = isDark
    ? (colors as any).dark
    : colors.light;
  return { ...palette, radius: colors.radius } as typeof colors.light & { radius: number };
}
