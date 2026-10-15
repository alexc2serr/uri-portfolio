"use client";

import React, { useState, useEffect } from "react";
import Hero3DCanvas from "@/components/canvas/Hero3DCanvas";
import EditorialGrid from "@/components/gallery/EditorialGrid";
import LightboxModal from "@/components/gallery/LightboxModal";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import SparkleTrail from "@/components/layout/SparkleTrail";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { Photo } from "@/types/photo";
import { getPhotos } from "@/lib/photo-storage";
import { INITIAL_PHOTOS } from "@/data/initialPhotos";
import { Sparkles, ArrowDown } from "lucide-react";

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getPhotos();
      if (data && data.length > 0) {
        setPhotos(data);
      }
    }
    load();
  }, []);

  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-[#08080a] text-zinc-100 selection:bg-[#e2c08d]/30 selection:text-white">
        {/* Custom cursor with luxury lens viewfinder */}
        <CustomCursor />

        {/* Interactive golden sparkle & star trail following mouse movement */}
        <SparkleTrail />

        {/* Global Navigation */}
        <Navbar />

        {/* Hero Section with Three.js 3D Interactive Canvas */}
        <section id="hero" className="relative pt-24 pb-8 flex flex-col items-center">
          {/* Subtle Hero Header */}
          <div className="max-w-4xl mx-auto px-4 text-center mt-6 mb-2 z-10 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel text-[11px] font-mono uppercase tracking-widest text-[#e2c08d] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Espacio 3D Interactivo</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-extralight tracking-tight text-white uppercase">
              Atmósferas <span className="font-serif italic text-[#e2c08d]">&</span> Luz
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mt-3 font-light leading-relaxed">
              Exploración tridimensional de fotografía contemporánea. Arrastra para girar la galería espacial o haz clic sobre una obra para examinar sus detalles.
            </p>
          </div>

          {/* Three.js Interactive 3D Canvas */}
          <div className="w-full">
            <Hero3DCanvas photos={photos} onSelectPhoto={setSelectedPhoto} />
          </div>

          {/* Scroll Down Indicator */}
          <div className="mt-4 flex flex-col items-center gap-2 text-zinc-500 text-xs font-mono tracking-widest uppercase animate-bounce">
            <span className="text-[10px]">Desliza hacia abajo</span>
            <ArrowDown className="w-4 h-4 text-[#e2c08d]" />
          </div>
        </section>

        {/* Editorial Parallax Gallery Grid */}
        <EditorialGrid photos={photos} onSelectPhoto={setSelectedPhoto} />

        {/* Footer with Bio & Camera Gear */}
        <Footer />

        {/* Fullscreen Cinematic Lightbox with EXIF info */}
        <LightboxModal
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setSelectedPhoto(null)}
          onSelectPhoto={setSelectedPhoto}
        />
      </div>
    </SmoothScroll>
  );
}
