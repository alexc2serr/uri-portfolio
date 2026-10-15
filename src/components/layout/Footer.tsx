"use client";

import React from "react";
import { ArrowUp, Camera } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer id="bio" className="border-t border-white/10 bg-black/60 pt-20 pb-12 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16 border-b border-white/5">
          {/* Column 1: Bio */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#e2c08d] mb-2 block">
              Bio • Uri Bagüés
            </span>
            <h3 className="text-2xl sm:text-3xl font-light text-white mb-3">
              Enamorau dende el Pirineu dica o Maestrazgo.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg mb-4">
              Fotógrafo afincado en Zaragoza. Explorando paisajes de montaña, luces mediterráneas y geometrías urbanas a través de una mirada sensible y cercana a la tierra.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              <Camera className="w-3.5 h-3.5 text-[#e2c08d]" />
              <span>Cuerpo principal: <strong>Sony a6400</strong></span>
            </div>
          </div>

          {/* Column 2: Instagram & Vero Contacts */}
          <div className="md:pl-12 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#e2c08d] mb-2 block">
                Redes & Contacto
              </span>
              <p className="text-xs sm:text-sm text-zinc-400 mb-5">
                Para consultas, colaboraciones o impresiones de autor:
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://instagram.com/urb_vapor"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-panel text-white hover:text-[#e2c08d] hover:border-[#e2c08d]/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#e2c08d] group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">Instagram</div>
                    <div className="text-sm font-mono text-zinc-200 group-hover:text-[#e2c08d] transition-colors">@urb_vapor</div>
                  </div>
                </a>

                <a
                  href="https://vero.co/vapor_pht"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-panel text-white hover:text-[#e2c08d] hover:border-[#e2c08d]/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#e2c08d] group-hover:scale-110 transition-transform font-bold text-xs">
                    V
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">Vero</div>
                    <div className="text-sm font-mono text-zinc-200 group-hover:text-[#e2c08d] transition-colors">vapor_pht</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and Back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="font-mono text-[11px]">
            © {new Date().getFullYear()} Uri Bagüés. Creado en Zaragoza. Desarrollado con Three.js & Next.js.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-[#e2c08d] transition-colors text-[11px] font-mono uppercase tracking-wider cursor-pointer"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
