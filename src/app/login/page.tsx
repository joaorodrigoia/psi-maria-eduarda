"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { UserRole } from "@/lib/types";
import { GlassButton } from "@/components/liquid-glass";
import { Flower2, Heart, Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginAs, openLoveModal } = useApp();

  const [name, setName] = useState(
    currentUser?.name || "Meu Amor — Educadora Psi. Maria Eduarda"
  );
  const [email, setEmail] = useState(
    currentUser?.email || "amor@psimariaeduarda.com.br"
  );
  const [role, setRole] = useState<UserRole>(
    currentUser?.role || "coordenacao"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(name, email, role);
    router.push("/");
  };

  return (
    <div className="max-w-lg mx-auto py-8 animate-fadeIn">
      <div className="overflow-hidden rounded-3xl apple-stable-surface">
        <div className="liquid-glass p-6 text-center space-y-2 border-b border-[#3B1425]/10 dark:border-white/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8476A] text-white shadow-md">
            <Flower2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Acesso Profissional — Psi. Maria Eduarda
          </h1>
          <p className="text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            Controle de permissões por função (LGPD)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
              Nome da Profissional Responsável
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full apple-input px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
              E-mail Institucional
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full apple-input px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C5A68] dark:text-[#F0BCC8] mb-1.5">
              Função e Permissão de Acesso
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full apple-input px-4 py-2.5 text-sm"
            >
              <option value="coordenacao">
                Coordenação / Educadora Sênior (Aprovar Relatórios & Arquivar Prontuários)
              </option>
              <option value="educadora">
                Educadora (Registrar Sessões, Áudios, Fotos e Revisar Rascunhos)
              </option>
              <option value="admin">
                Administração Institucional (Gestão de Modelos, Auditoria e LGPD)
              </option>
              <option value="leitura">
                Consulta Autorizada (Somente Leitura)
              </option>
            </select>
          </div>

          <div className="rounded-2xl bg-[#FFF1EA] dark:bg-[#2A1424] p-4 flex items-start gap-3 text-xs text-[#8C5A68] dark:text-[#F0BCC8]">
            <ShieldCheck className="h-5 w-5 text-[#E8476A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#3B1425] dark:text-[#FFF4F0] block">
                Compromisso com o Melhor Interesse da Criança (LGPD)
              </strong>
              Todos os acessos, edições de prontuário e aprovações de relatórios são registrados na trilha de auditoria (`audit_logs`).
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              floating
              className="flex-1"
            >
              <Lock className="h-4 w-4" />
              <span>Entrar no Sistema</span>
            </GlassButton>

            <GlassButton
              type="button"
              variant="glass"
              size="lg"
              onClick={openLoveModal}
            >
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              <span>Palavra de Amor</span>
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
