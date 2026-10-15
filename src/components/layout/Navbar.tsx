"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, Lock, Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    setMobileMenuOpen(false);

    if (typeof window !== "undefined") {
      if (window.location.pathname !== "/") {
        window.location.href = `/${targetId}`;
        return;
      }

      const lenis = (window as unknown as {
        __lenis?: { scrollTo: (target: string, options?: { offset?: number; duration?: number }) => void };
      }).__lenis;

      const targetElement = document.querySelector(targetId);

      if (lenis && targetElement) {
        lenis.scrollTo(targetId, { offset: -70, duration: 1.2 });
      } else if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "glass-nav py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#e2c08d] group-hover:border-[#e2c08d]/50 transition-colors">
            <Camera className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-widest uppercase text-white group-hover:text-[#e2c08d] transition-colors">
              URI BAGÜÉS
            </span>
            <span className="text-[9px] tracking-widest uppercase text-zinc-500 font-mono">
              VISUAL ARTIST & PHOTOGRAPHER
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-zinc-400">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#hero");
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Exploración 3D
          </a>
          <a
            href="#galeria"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#galeria");
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Galería
          </a>
          <a
            href="#bio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#bio");
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Bio
          </a>

          {/* Admin link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel text-[11px] text-[#e2c08d] hover:bg-[#e2c08d]/10 hover:border-[#e2c08d]/40 transition-all"
            title="Portal de subida de fotos (Privado)"
          >
            <Lock className="w-3 h-3" />
            <span>Portal Admin</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </Link>
        </nav>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/admin"
            className="p-2 rounded-lg glass-panel text-[#e2c08d]"
            title="Admin"
          >
            <Lock className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg glass-panel text-white cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-white/10 px-6 py-6 flex flex-col gap-4 text-xs tracking-widest uppercase text-zinc-300">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#hero");
            }}
            className="py-2 hover:text-white cursor-pointer"
          >
            Exploración 3D
          </a>
          <a
            href="#galeria"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#galeria");
            }}
            className="py-2 hover:text-white cursor-pointer"
          >
            Galería Editorial
          </a>
          <a
            href="#bio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#bio");
            }}
            className="py-2 hover:text-white cursor-pointer"
          >
            Bio
          </a>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 text-[#e2c08d] flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" /> Portal de Administración
          </Link>
        </div>
      )}
    </header>
  );
}
