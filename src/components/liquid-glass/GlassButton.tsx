"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export type GlassButtonVariant =
  | "primary"
  | "glass"
  | "secondary"
  | "sunset"
  | "danger"
  | "ghost";

export interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: GlassButtonVariant;
  size?: "sm" | "md" | "lg" | "icon";
  floating?: boolean;
}

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  floating = false,
  className = "",
  ...props
}: GlassButtonProps) {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs rounded-full gap-1.5",
    md: "px-4 py-2.5 text-xs sm:text-sm rounded-full gap-2",
    lg: "px-6 py-3 text-sm rounded-full gap-2.5",
    icon: "p-2.5 rounded-full",
  }[size];

  const variantClasses = {
    primary:
      "sunset-gradient hover:brightness-105 text-white border border-white/40 shadow-[0_10px_24px_-4px_rgba(255,107,107,0.55),inset_0_1px_0_0_rgba(255,255,255,0.5)]",
    glass:
      "liquid-glass-pill text-[#3B1425] dark:text-[#FFF4F0] hover:bg-white/85 dark:hover:bg-[#2A3444]/85",
    secondary:
      "bg-[#FFFFFF] dark:bg-[#33192A] text-[#3B1425] dark:text-[#FFF4F0] border border-[#3B1425]/10 dark:border-white/10 hover:bg-[#FFF1EA] dark:hover:bg-[#2A3444] shadow-sm",
    sunset:
      "bg-gradient-to-r from-[#E8476A] via-rose-500/90 to-orange-400/90 text-white border border-white/30 shadow-[0_8px_24px_-4px_rgba(244,63,94,0.35),inset_0_1px_0_0_rgba(255,255,255,0.4)]",
    danger:
      "bg-red-500/90 hover:bg-red-600 text-white border border-white/25 shadow-sm",
    ghost:
      "bg-transparent hover:bg-[#3B1425]/5 dark:hover:bg-white/10 text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-[#FFF4F0]",
  }[variant];

  const floatClass = floating
    ? "shadow-lg hover:shadow-xl transition-shadow"
    : "";

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-45 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${floatClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
