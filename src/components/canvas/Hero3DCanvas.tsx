"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as DreiImage, Sparkles, Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { Photo } from "@/types/photo";

interface CarouselCardProps {
  photo: Photo;
  index: number;
  total: number;
  radius: number;
  rotationRef: React.MutableRefObject<number>;
  onSelect: (photo: Photo) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}

function CarouselCard({
  photo,
  index,
  total,
  radius,
  rotationRef,
  onSelect,
  hoveredId,
  setHoveredId,
}: CarouselCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const isHovered = hoveredId === photo.id;

  // Initial angle on the cylinder
  const angle = (index / total) * Math.PI * 2;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const currentRot = rotationRef.current;
    const cardAngle = angle + currentRot;

    // Calculate position on the circle/cylinder
    const x = Math.sin(cardAngle) * radius;
    const z = Math.cos(cardAngle) * radius - radius * 0.4;
    const y = Math.sin(cardAngle * 2 + index) * 0.2; // Subtle organic floating wave

    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, x, 12, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, y, 12, delta);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, z, 12, delta);

    // Face inward/slightly tangent to center
    meshRef.current.rotation.y = cardAngle + Math.PI;

    // Hover scale & tilt
    const targetScale = isHovered ? 1.15 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(photo);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredId(photo.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHoveredId(null);
        document.body.style.cursor = "auto";
      }}
    >
      {/* 3D Image Card with Drei Image component (handles texture loading, aspect ratio, mipmaps automatically) */}
      <DreiImage
        url={photo.url}
        transparent
        radius={0.06}
        scale={[2.4, 3.2]}
        toneMapped={false}
      />

      {/* Frame border highlight on hover */}
      {isHovered && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.46, 3.26]} />
          <meshBasicMaterial color="#e2c08d" wireframe={false} opacity={0.6} transparent />
        </mesh>
      )}

      {/* 3D Text Title below card */}
      <Text
        position={[0, -1.85, 0.05]}
        fontSize={0.12}
        color={isHovered ? "#e2c08d" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
      >
        {photo.title.toUpperCase()}
      </Text>
      <Text
        position={[0, -2.05, 0.05]}
        fontSize={0.09}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        {photo.category} • {photo.location || "35mm"}
      </Text>
    </group>
  );
}

function Scene({
  photos,
  onSelectPhoto,
}: {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}) {
  const rotationRef = useRef<number>(0);
  const velocityRef = useRef<number>(0.001); // Subtle continuous auto-rotation
  const isDraggingRef = useRef<boolean>(false);
  const previousPointerXRef = useRef<number>(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { pointer } = useThree();

  const featuredPhotos = useMemo(() => {
    const featured = photos.filter((p) => p.featured);
    return featured.length >= 3 ? featured : photos.slice(0, 6);
  }, [photos]);

  const radius = Math.max(3.8, featuredPhotos.length * 0.65);

  useFrame((_, delta) => {
    if (!isDraggingRef.current) {
      // Natural inertia damping
      if (hoveredId) {
        // Slow down gently when hovering a photo
        velocityRef.current = THREE.MathUtils.damp(velocityRef.current, 0.0003, 3, delta);
      } else {
        velocityRef.current = THREE.MathUtils.damp(velocityRef.current, 0.0012, 1.5, delta);
      }
      rotationRef.current += velocityRef.current;
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff8f0" />
      <pointLight position={[-5, -2, -2]} intensity={0.8} color="#e2c08d" />

      {/* Floating dust particles for atmospheric depth */}
      <Sparkles
        count={70}
        scale={16}
        size={2.5}
        speed={0.4}
        opacity={0.35}
        color="#e2c08d"
      />

      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.2}>
        <group position={[0, 0, -1]}>
          {featuredPhotos.map((photo, i) => (
            <CarouselCard
              key={photo.id}
              photo={photo}
              index={i}
              total={featuredPhotos.length}
              radius={radius}
              rotationRef={rotationRef}
              onSelect={onSelectPhoto}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
            />
          ))}
        </group>
      </Float>

      {/* Interactive Raycast plane for smooth drag rotation */}
      <mesh
        visible={false}
        onPointerDown={(e) => {
          isDraggingRef.current = true;
          previousPointerXRef.current = e.clientX;
        }}
        onPointerUp={() => {
          isDraggingRef.current = false;
        }}
        onPointerLeave={() => {
          isDraggingRef.current = false;
        }}
        onPointerMove={(e) => {
          if (isDraggingRef.current) {
            const deltaX = e.clientX - previousPointerXRef.current;
            previousPointerXRef.current = e.clientX;
            const sensitivity = 0.0045;
            rotationRef.current += deltaX * sensitivity;
            velocityRef.current = deltaX * sensitivity * 0.3;
          }
        }}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

interface Hero3DCanvasProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

export default function Hero3DCanvas({ photos, onSelectPhoto }: Hero3DCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#08080a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#e2c08d]/40 border-t-[#e2c08d] animate-spin" />
          <span className="text-xs uppercase tracking-widest text-zinc-500">Cargando Espacio 3D...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[85vh] sm:h-[90vh] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0.2, 5.8], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        <Scene photos={photos} onSelectPhoto={onSelectPhoto} />
      </Canvas>

      {/* Atmospheric Vignette & Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-[#08080a]/90" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#08080a] to-transparent" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#08080a] to-transparent" />

      {/* Interactive Controls & Hints */}
      <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel text-xs tracking-widest uppercase text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-[#e2c08d] animate-pulse" />
          <span>Arrastra para rotar • Clic para explorar</span>
        </div>
      </div>
    </div>
  );
}

