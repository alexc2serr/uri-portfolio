"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, KeyRound, AlertCircle, Camera } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [mode, setMode] = useState<"passcode" | "supabase">("passcode");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultMasterCode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "uri2025";

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (passcode.trim() === defaultMasterCode.trim()) {
      sessionStorage.setItem("uri_admin_authenticated", "true");
      router.push("/admin");
    } else {
      setError("Contraseña incorrecta. Recuerda que la clave por defecto es 'uri2025' o la que hayas definido en .env.local");
      setLoading(false);
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        sessionStorage.setItem("uri_admin_authenticated", "true");
        router.push("/admin");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado al iniciar sesión";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08080a] flex items-center justify-center p-4">
      {/* Background ambient glow */}
      <div className="absolute w-96 h-96 bg-[#e2c08d]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Portfolio</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e2c08d]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-light text-white">Portal de Fotógrafo</h1>
            <p className="text-xs text-zinc-500 font-mono">ACCESO PRIVADO • GESTIÓN DE OBRAS</p>
          </div>
        </div>

        {/* Tab switch between Passcode and Supabase Auth */}
        <div className="flex rounded-lg bg-black/40 p-1 mb-6 border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setMode("passcode")}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mode === "passcode" ? "bg-white/15 text-white font-medium" : "text-zinc-400 hover:text-white"
            }`}
          >
            Clave Maestra
          </button>
          <button
            type="button"
            onClick={() => setMode("supabase")}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mode === "supabase" ? "bg-white/15 text-white font-medium" : "text-zinc-400 hover:text-white"
            }`}
          >
            Supabase Auth {isSupabaseConfigured ? "✓" : "(Opcional)"}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {mode === "passcode" ? (
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Introduce tu clave (def: uri2025)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#e2c08d] transition-colors pl-11"
                  required
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Clave por defecto: <span className="text-[#e2c08d] font-mono">uri2025</span> (puedes cambiarla en <code className="text-zinc-400">.env.local</code>)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#e2c08d] text-black font-medium text-xs uppercase tracking-widest hover:bg-[#ebd4b0] transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? "Verificando..." : "Entrar al Portal"}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSupabaseLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#e2c08d] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1.5">
                Contraseña Supabase
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#e2c08d] transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#e2c08d] text-black font-medium text-xs uppercase tracking-widest hover:bg-[#ebd4b0] transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? "Conectando..." : "Iniciar Sesión"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

