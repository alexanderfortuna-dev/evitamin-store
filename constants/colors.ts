const Colors = {
  light: {
    background: "#F7FAFF",
    card: "#FFFFFF",
    primary: "#0B3D91",
    cta: "#FF6A00",
    success: "#16A34A",
    text: "#1F2937",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    tint: "#0B3D91",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#0B3D91",
    inputBg: "#F9FAFB",
    overlay: "rgba(0,0,0,0.4)",
    badge: "#EF4444",
    star: "#F59E0B",
  },
  dark: {
    background: "#0F172A",
    card: "#1E293B",
    primary: "#60A5FA",
    cta: "#FF8533",
    success: "#22C55E",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textTertiary: "#64748B",
    border: "#334155",
    borderLight: "#1E293B",
    tint: "#60A5FA",
    tabIconDefault: "#64748B",
    tabIconSelected: "#60A5FA",
    inputBg: "#1E293B",
    overlay: "rgba(0,0,0,0.6)",
    badge: "#EF4444",
    star: "#F59E0B",
  },
};

export default Colors;

export type ThemeColors = typeof Colors.light;

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? Colors.dark : Colors.light;
}
