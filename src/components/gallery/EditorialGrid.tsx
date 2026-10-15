"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/types/photo";
import { Eye, Camera, MapPin, Sparkles } from "lucide-react";

interface EditorialGridProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

export default function EditorialGrid({ photos, onSelectPhoto }: EditorialGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  // Derive unique categories from photos
  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["Todos", ...Array.from(set)];
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "Todos") return photos;
    return photos.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [photos, selectedCategory]);

  return (
    <section id="galeria" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-20">
      {/* Header section with refined typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/10 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#e2c08d] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colección Visual</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
            Galería Editorial <span className="font-serif italic text-[#e2c08d]">&</span> Series
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-md">
            Exploración de la luz, el grano y las geometrías efímeras capturadas alrededor del mundo.
          </p>
        </div>

        {/* Categories navigation filter */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-4 py-1.5 rounded-full text-xs tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? "text-[#08080a] font-medium"
                    : "text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-[#e2c08d] rounded-full -z-10 shadow-lg shadow-[#e2c08d]/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry / Asymmetrical Editorial Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        <AnimatePresence>
          {filteredPhotos.map((photo, index) => {
            // Apply varied aspect ratios for an editorial magazine rhythm
            const isTall = index % 3 === 0;

            return (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative cursor-pointer"
                onClick={() => onSelectPhoto(photo)}
              >
                {/* Photo container */}
                <div
                  className={`relative w-full overflow-hidden rounded-xl bg-zinc-950 border border-white/5 transition-all duration-500 group-hover:border-[#e2c08d]/40 group-hover:shadow-2xl group-hover:shadow-black/60 ${
                    isTall ? "h-[480px] sm:h-[540px]" : "h-[360px] sm:h-[400px]"
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-95 group-hover:brightness-105"
                    priority={index < 4}
                  />

                  {/* Subtle film grain & gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Top badges: Category & Featured */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase">
                    <span className="px-2.5 py-1 rounded-md glass-panel text-white/90">
                      {photo.category}
                    </span>
                    {photo.featured && (
                      <span className="px-2.5 py-1 rounded-md bg-[#e2c08d]/20 text-[#e2c08d] border border-[#e2c08d]/30 font-medium">
                        ★ Destacada 3D
                      </span>
                    )}
                  </div>

                  {/* Bottom details & EXIF meta */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 transform transition-transform duration-300 group-hover:-translate-y-1">
                    <h3 className="text-xl font-light text-white group-hover:text-[#e2c08d] transition-colors duration-200">
                      {photo.title}
                    </h3>

                    {photo.location && (
                      <p className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <MapPin className="w-3 h-3 text-[#e2c08d]" />
                        <span>{photo.location}</span>
                      </p>
                    )}

                    {/* EXIF parameters pill */}
                    {(photo.camera || photo.aperture || photo.shutter_speed) && (
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10 text-[10px] font-mono text-zinc-400">
                        {photo.camera && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Camera className="w-3 h-3" />
                            {photo.camera}
                          </span>
                        )}
                        {photo.focal_length && <span>{photo.focal_length}</span>}
                        {photo.aperture && <span>{photo.aperture}</span>}
                        {photo.shutter_speed && <span>{photo.shutter_speed}</span>}
                        {photo.iso && <span>ISO {photo.iso}</span>}
                      </div>
                    )}
                  </div>

                  {/* Hover icon indicator */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none">
                    <Eye className="w-5 h-5 text-[#e2c08d]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredPhotos.length === 0 && (
        <div className="w-full py-20 text-center text-zinc-500">
          <p className="text-sm uppercase tracking-widest">No hay fotografías en esta categoría aún.</p>
        </div>
      )}
    </section>
  );
}

