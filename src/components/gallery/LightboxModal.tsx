"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/types/photo";
import { X, ChevronLeft, ChevronRight, Camera, MapPin, Calendar, Info, Share2, Check } from "lucide-react";

interface LightboxModalProps {
  photo: Photo | null;
  photos: Photo[];
  onClose: () => void;
  onSelectPhoto: (photo: Photo) => void;
}

export default function LightboxModal({
  photo,
  photos,
  onClose,
  onSelectPhoto,
}: LightboxModalProps) {
  const [showInfo, setShowInfo] = useState(true);
  const [copied, setCopied] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, photos]);

  if (!photo) return null;

  const currentIndex = photos.findIndex((p) => p.id === photo.id);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIndex]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none"
        onClick={onClose}
      >
        {/* Top Control Bar */}
        <div
          className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <span className="text-[#e2c08d]">
              {String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
            <span>•</span>
            <span className="text-white font-medium">{photo.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2.5 rounded-full transition-colors ${
                showInfo ? "bg-[#e2c08d] text-black" : "glass-panel text-white hover:text-[#e2c08d]"
              }`}
              title="Información EXIF"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-full glass-panel text-white hover:text-[#e2c08d] transition-colors"
              title="Copiar enlace"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full glass-panel text-white hover:text-[#e2c08d] transition-colors"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Previous / Next buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-panel text-white hover:text-[#e2c08d] transition-all duration-200 hover:scale-110 z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-panel text-white hover:text-[#e2c08d] transition-all duration-200 hover:scale-110 z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Main Image Stage */}
        <div
          className="relative w-full h-full max-w-6xl max-h-[85vh] p-4 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full h-full max-h-[80vh] flex items-center justify-center"
          >
            <Image
              src={photo.url}
              alt={photo.title}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </motion.div>
        </div>

        {/* Side EXIF Drawer */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-6 bottom-6 sm:bottom-12 w-80 max-w-[calc(100vw-3rem)] glass-panel rounded-2xl p-6 z-20 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e2c08d]">
                  Ficha Técnica EXIF
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white">
                  {photo.category}
                </span>
              </div>

              <h4 className="text-lg font-light text-white mb-2">{photo.title}</h4>
              {photo.description && (
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{photo.description}</p>
              )}

              <div className="space-y-2.5 text-xs">
                {photo.camera && (
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#e2c08d]" /> Cuerpo
                    </span>
                    <span className="font-mono">{photo.camera}</span>
                  </div>
                )}

                {photo.lens && (
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500">Lente</span>
                    <span className="font-mono text-[11px] truncate max-w-[170px]" title={photo.lens}>
                      {photo.lens}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-[11px]">
                  {photo.focal_length && (
                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                      <div className="text-[9px] uppercase text-zinc-500">Distancia</div>
                      <div className="text-white mt-0.5">{photo.focal_length}</div>
                    </div>
                  )}
                  {photo.aperture && (
                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                      <div className="text-[9px] uppercase text-zinc-500">Apertura</div>
                      <div className="text-white mt-0.5">{photo.aperture}</div>
                    </div>
                  )}
                  {photo.shutter_speed && (
                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                      <div className="text-[9px] uppercase text-zinc-500">Exposición</div>
                      <div className="text-white mt-0.5">{photo.shutter_speed}</div>
                    </div>
                  )}
                  {photo.iso && (
                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                      <div className="text-[9px] uppercase text-zinc-500">Sensibilidad</div>
                      <div className="text-white mt-0.5">ISO {photo.iso}</div>
                    </div>
                  )}
                </div>

                {photo.location && (
                  <div className="flex items-center justify-between pt-2 text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <MapPin className="w-3.5 h-3.5 text-[#e2c08d]" /> Ubicación
                    </span>
                    <span>{photo.location}</span>
                  </div>
                )}

                {photo.captured_at && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" /> Fecha
                    </span>
                    <span>{photo.captured_at}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

