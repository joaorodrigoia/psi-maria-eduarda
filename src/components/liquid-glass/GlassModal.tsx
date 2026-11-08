"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerGradient?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

/**
 * GlassModal — Janela arredondada no padrão Apple Liquid Glass com separação visual clara,
 * animações de mola suaves e fundo atenuado.
 */
export function GlassModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  headerGradient,
  children,
  maxWidthClass = "max-w-2xl",
}: GlassModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F0E1B]/60 backdrop-blur-md print:hidden"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className={`relative w-full ${maxWidthClass} overflow-hidden rounded-3xl border border-white/45 dark:border-white/15 bg-[#FFFFFF]/95 dark:bg-[#33192A]/95 backdrop-blur-2xl shadow-2xl text-[#3B1425] dark:text-[#FFF4F0]`}
          >
            {/* Cabeçalho translúcido com separação visual clara */}
            <div
              className={`relative px-6 py-4 border-b border-[#3B1425]/10 dark:border-white/10 ${
                headerGradient ||
                "bg-gradient-to-r from-[#E8476A]/15 via-rose-500/10 to-orange-400/15"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl liquid-glass-pill text-[#E8476A] dark:text-[#FF8A5B]">
                      {icon}
                    </div>
                  )}
                  <div>
                    {subtitle && (
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8]">
                        {subtitle}
                      </p>
                    )}
                    <h2 className="text-lg font-bold tracking-tight text-[#3B1425] dark:text-[#FFF4F0]">
                      {title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full p-2 liquid-glass-pill text-[#8C5A68] dark:text-[#F0BCC8] hover:text-[#3B1425] dark:hover:text-white transition"
                  aria-label="Fechar janela"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Conteúdo sobre superfície de leitura estável */}
            <div className="p-6 sm:p-7 max-h-[80vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
