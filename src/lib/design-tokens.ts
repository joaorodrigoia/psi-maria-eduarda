/**
 * Apple Liquid Glass Design System — Tokens Centralizados
 * Respeitando as diretrizes do Apple Human Interface Guidelines (HIG)
 */

export const APPLE_LIQUID_GLASS_TOKENS = {
  light: {
    background: "#FFF1EA",
    surface: "#FFFFFF",
    primary: "#E8476A",
    primaryHover: "#C92F55",
    text: "#3B1425",
    secondary: "#8C5A68",
    glassSurface: "rgba(255, 255, 255, 0.68)",
    glassBorder: "rgba(255, 255, 255, 0.78)",
    specularHighlight: "inset 0 1px 0 0 rgba(255, 255, 255, 0.85)",
  },
  dark: {
    background: "#1F0E1B",
    surface: "#33192A",
    primary: "#FF8A5B",
    primaryHover: "#E8476A",
    text: "#FFF4F0",
    secondary: "#F0BCC8",
    glassSurface: "rgba(32, 40, 52, 0.68)",
    glassBorder: "rgba(255, 255, 255, 0.14)",
    specularHighlight: "inset 0 1px 0 0 rgba(255, 255, 255, 0.18)",
  },
  blur: {
    navigation: "blur(24px) saturate(185%)",
    toolbar: "blur(22px) saturate(180%)",
    modal: "blur(28px) saturate(190%)",
  },
  springTransition: {
    type: "spring" as const,
    stiffness: 380,
    damping: 30,
  },
};
