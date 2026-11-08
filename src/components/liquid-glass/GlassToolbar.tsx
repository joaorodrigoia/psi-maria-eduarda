"use client";

import React from "react";
import { motion } from "framer-motion";

export interface GlassToolbarProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

/**
 * GlassToolbar — Barra de ferramentas translúcida flutuante com efeito Apple Liquid Glass.
 * Usada para controles de busca, filtros de período, ações de prontuário e editor de relatórios A4.
 */
export function GlassToolbar({
  children,
  className = "",
  sticky = false,
}: GlassToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`liquid-glass rounded-2xl px-4 py-3 print:hidden ${
        sticky ? "sticky top-20 z-20" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
