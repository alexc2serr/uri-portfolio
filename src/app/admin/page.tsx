"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Photo } from "@/types/photo";
import {
  getPhotos,
  savePhoto,
  deletePhoto,
  saveAllPhotos,
  uploadImageFile,
  extractExifData,
} from "@/lib/photo-storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_PHOTOS } from "@/data/initialPhotos";
import {
  Upload,
  Camera,
  Star,
  Trash2,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  Edit2,
  X,
  FileImage,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isExtractingExif, setIsExtractingExif] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // Editing state
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Street");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFeatured, setFormFeatured] = useState(true);
  const [formCamera, setFormCamera] = useState("");
  const [formLens, setFormLens] = useState("");
  const [formFocalLength, setFormFocalLength] = useState("");
  const [formAperture, setFormAperture] = useState("");
  const [formShutterSpeed, setFormShutterSpeed] = useState("");
  const [formIso, setFormIso] = useState("");

  // Check auth
  useEffect(() => {
    const isAuth = sessionStorage.getItem("uri_admin_authenticated") === "true";
    if (!isAuth) {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
      loadPhotos();
    }
  }, [router]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await getPhotos();
      setPhotos(data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("uri_admin_authenticated");
    router.push("/admin/login");
  };

  // Handle file select & EXIF extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));

    // Guess initial title from filename (removing extension and hyphens)
    const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setFormTitle(rawName.charAt(0).toUpperCase() + rawName.slice(1));

    // Extract EXIF automatically!
    setIsExtractingExif(true);
    try {
      const exif = await extractExifData(file);
      if (exif.camera) setFormCamera(exif.camera);
      if (exif.lens) setFormLens(exif.lens);
      if (exif.focal_length) setFormFocalLength(exif.focal_length);
      if (exif.aperture) setFormAperture(exif.aperture);
      if (exif.shutter_speed) setFormShutterSpeed(exif.shutter_speed);
      if (exif.iso) setFormIso(exif.iso);
    } catch (err) {
      console.warn("Could not parse EXIF:", err);
    } finally {
      setIsExtractingExif(false);
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      // Upload image to Supabase Storage or local Data URL
      const imageUrl = await uploadImageFile(uploadFile);

      const newPhoto: Photo = {
        id: `photo-${Date.now()}`,
        title: formTitle.trim() || "Sin Título",
        slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        url: imageUrl,
        thumbnail_url: imageUrl,
        category: formCategory.trim() || "General",
        description: formDescription.trim() || undefined,
        featured: formFeatured,
        order_index: photos.length,
        camera: formCamera.trim() || undefined,
        lens: formLens.trim() || undefined,
        focal_length: formFocalLength.trim() || undefined,
        aperture: formAperture.trim() || undefined,
        shutter_speed: formShutterSpeed.trim() || undefined,
        iso: formIso.trim() || undefined,
        location: formLocation.trim() || undefined,
        created_at: new Date().toISOString(),
      };

      await savePhoto(newPhoto);

      // Refresh list
      await loadPhotos();

      // Reset form
      setUploadFile(null);
      setUploadPreview(null);
      setFormTitle("");
      setFormDescription("");
      setFormLocation("");
      setFormCamera("");
      setFormLens("");
      setFormFocalLength("");
      setFormAperture("");
      setFormShutterSpeed("");
      setFormIso("");
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al subir la fotografía";
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  // Toggle Featured in 3D Hero
  const handleToggleFeatured = async (photo: Photo) => {
    const updated = { ...photo, featured: !photo.featured };
    await savePhoto(updated);
    setPhotos(photos.map((p) => (p.id === photo.id ? updated : p)));
  };

  // Delete Photo
  const handleDeletePhoto = async (photo: Photo) => {
    if (confirm(`¿Estás seguro de eliminar "${photo.title}"?`)) {
      await deletePhoto(photo.id);
      setPhotos(photos.filter((p) => p.id !== photo.id));
    }
  };

  // Move photo up/down
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(targetIndex, 0, moved);

    // Update order indices
    const updated = newPhotos.map((p, i) => ({ ...p, order_index: i }));
    setPhotos(updated);
    await saveAllPhotos(updated);
  };

  // Reset to default sample photos
  const handleResetToSamples = async () => {
    if (confirm("¿Quieres restaurar las fotografías de muestra de alta resolución?")) {
      await saveAllPhotos(INITIAL_PHOTOS);
      setPhotos(INITIAL_PHOTOS);
    }
  };

  // Save edited photo
  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    await savePhoto(editingPhoto);
    setPhotos(photos.map((p) => (p.id === editingPhoto.id ? editingPhoto : p)));
    setEditingPhoto(null);
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 sm:p-8">
      {/* Header bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e2c08d]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-white">Panel de Administración</h1>
              <p className="text-xs text-zinc-400 font-mono">PORTFOLIO PERSONAL • GESTIÓN DE OBRAS</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs uppercase tracking-wider text-white hover:text-[#e2c08d] transition-colors"
          >
            <span>Ver Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 space-y-8">
        {/* Status & Storage Banner */}
        <div className="p-4 rounded-xl glass-panel border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isSupabaseConfigured ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-amber-400"
              }`}
            />
            <div>
              <span className="text-xs font-medium text-white block">
                {isSupabaseConfigured
                  ? "Conexión Supabase Activa (Base de datos Cloud & Storage Bucket)"
                  : "Modo Local Listo (Puedes probar y subir fotos ahora mismo)"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isSupabaseConfigured
                  ? "Tus fotos se guardan en tu bucket y base de datos persistente de Supabase."
                  : "Las fotos se guardan temporalmente en tu navegador. Puedes conectar Supabase cuando desees."}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#e2c08d] transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showConfigHelp ? "Ocultar Guía Supabase" : "Configurar Supabase (1 min)"}</span>
          </button>
        </div>

        {/* Collapsible Supabase Instructions */}
        {showConfigHelp && (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-[#e2c08d]/30 text-xs space-y-3">
            <h3 className="text-sm font-medium text-[#e2c08d] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Cómo conectar tu Supabase gratuito en 3 pasos:
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-300">
              <li>
                Crea un proyecto gratis en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#e2c08d] underline">supabase.com</a>.
              </li>
              <li>
                Ve al <strong>SQL Editor</strong> en Supabase, copia el contenido del archivo <code className="text-[#e2c08d]">supabase/schema.sql</code> que ya te hemos generado en este proyecto, y pulsa <strong>Run</strong>. (Crea la tabla de fotos y el bucket de almacenamiento automáticamente).
              </li>
              <li>
                Ve a <strong>Project Settings &gt; API</strong> en Supabase, copia la <strong>URL del proyecto</strong> y la <strong>anon public key</strong>, y pégalas en tu archivo <code className="text-[#e2c08d]">.env.local</code>. ¡Listo!
              </li>
            </ol>
          </div>
        )}

        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Total Obras</div>
            <div className="text-3xl font-light text-white mt-1">{photos.length}</div>
          </div>
          <div className="p-5 rounded-2xl glass-panel border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Destacadas en 3D</div>
            <div className="text-3xl font-light text-[#e2c08d] mt-1">
              {photos.filter((p) => p.featured).length}
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-panel border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Categorías</div>
            <div className="text-3xl font-light text-white mt-1">
              {new Set(photos.map((p) => p.category)).size}
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Restauración</div>
            <button
              onClick={handleResetToSamples}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fotos de Muestra</span>
            </button>
          </div>
        </div>

        {/* Upload Form Section */}
        <section className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <Upload className="w-5 h-5 text-[#e2c08d]" />
            <h2 className="text-lg font-light text-white">Subir Nueva Fotografía</h2>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            {/* Drag & Drop File Input Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                uploadPreview
                  ? "border-[#e2c08d]/50 bg-black/40"
                  : "border-white/10 hover:border-white/30 bg-black/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadPreview ? (
                <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-white/20 shadow-xl">
                  <Image src={uploadPreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-mono uppercase text-white">Cambiar imagen</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#e2c08d]">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Haz clic o arrastra tu fotografía aquí</p>
                    <p className="text-xs text-zinc-500 mt-1">Soporta JPG, PNG, WEBP en alta resolución</p>
                  </div>
                </>
              )}

              {isExtractingExif && (
                <div className="flex items-center gap-2 text-xs text-[#e2c08d] font-mono animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Leyendo metadatos EXIF de la cámara automáticamente...</span>
                </div>
              )}
            </div>

            {/* Metadata Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                  Título de la Obra *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Niebla en Shinjuku"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                  Categoría / Serie *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                >
                  <option value="Street">Street</option>
                  <option value="Paisaje">Paisaje</option>
                  <option value="Retrato">Retrato</option>
                  <option value="Arquitectura">Arquitectura</option>
                  <option value="Naturaleza">Naturaleza</option>
                  <option value="Analógico">Analógico</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                  Ubicación / Ciudad
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Ej: Tokyo, Japón"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                />
              </div>

              {/* EXIF Data fields (Auto-filled by EXIF or editable) */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                  Cámara (Cuerpo)
                </label>
                <input
                  type="text"
                  value={formCamera}
                  onChange={(e) => setFormCamera(e.target.value)}
                  placeholder="Ej: Sony A7R V"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                  Lente / Óptica
                </label>
                <input
                  type="text"
                  value={formLens}
                  onChange={(e) => setFormLens(e.target.value)}
                  placeholder="Ej: FE 35mm F1.4 GM"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                    Apertura
                  </label>
                  <input
                    type="text"
                    value={formAperture}
                    onChange={(e) => setFormAperture(e.target.value)}
                    placeholder="f/1.4"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                    Velocidad
                  </label>
                  <input
                    type="text"
                    value={formShutterSpeed}
                    onChange={(e) => setFormShutterSpeed(e.target.value)}
                    placeholder="1/500s"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                    Focal
                  </label>
                  <input
                    type="text"
                    value={formFocalLength}
                    onChange={(e) => setFormFocalLength(e.target.value)}
                    placeholder="35mm"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                    ISO
                  </label>
                  <input
                    type="text"
                    value={formIso}
                    onChange={(e) => setFormIso(e.target.value)}
                    placeholder="100"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                  Descripción o Historia
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalles sobre el momento, iluminación o concepto..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e2c08d]"
                />
              </div>
            </div>

            {/* Featured toggle & Submit */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e2c08d] focus:ring-0 accent-[#e2c08d]"
                />
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#e2c08d]" />
                  <span>Destacar en el carrusel 3D del Hero</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className={`px-6 py-3 rounded-xl font-medium text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
                  !uploadFile || uploading
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-[#e2c08d] text-black hover:bg-[#ebd4b0] shadow-lg shadow-[#e2c08d]/20 cursor-pointer"
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo Obra...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Publicar Fotografía</span>
                  </>
                )}
              </button>
            </div>

            {uploadSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Fotografía subida y publicada con éxito en el portfolio!</span>
              </div>
            )}
          </form>
        </section>

        {/* Existing Photos List & Ordering */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-white">Fotografías Publicadas ({photos.length})</h2>
            <span className="text-xs text-zinc-500 font-mono">
              ★ = Visible en Carrusel 3D • Usa las flechas para ordenar
            </span>
          </div>

          <div className="space-y-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl glass-panel border border-white/5 hover:border-white/15 transition-all gap-4"
              >
                {/* Photo thumbnail and info */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <Image src={photo.url} alt={photo.title} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{photo.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                        {photo.category}
                      </span>
                      {photo.featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e2c08d]/20 text-[#e2c08d] font-mono">
                          ★ Hero 3D
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 flex flex-wrap gap-2 font-mono">
                      {photo.location && <span>{photo.location}</span>}
                      {photo.camera && <span>• {photo.camera}</span>}
                      {photo.lens && <span>• {photo.lens}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions: Reorder, Star, Edit, Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleMoveOrder(index, "up")}
                    disabled={index === 0}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300"
                    title="Mover arriba"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(index, "down")}
                    disabled={index === photos.length - 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300"
                    title="Mover abajo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(photo)}
                    className={`p-2 rounded-lg transition-colors ${
                      photo.featured
                        ? "bg-[#e2c08d]/20 text-[#e2c08d] border border-[#e2c08d]/30"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                    title={photo.featured ? "Quitar de Hero 3D" : "Añadir a Hero 3D"}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingPhoto(photo)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                    title="Editar información"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Eliminar fotografía"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">Editar Ficha de Fotografía</h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Título</label>
                <input
                  type="text"
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={editingPhoto.location || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, location: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Descripción</label>
                <textarea
                  value={editingPhoto.description || ""}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                  rows={2}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Cámara</label>
                  <input
                    type="text"
                    value={editingPhoto.camera || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, camera: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Lente</label>
                  <input
                    type="text"
                    value={editingPhoto.lens || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, lens: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Apertura</label>
                  <input
                    type="text"
                    value={editingPhoto.aperture || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, aperture: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-[#e2c08d] text-black font-medium text-xs uppercase tracking-wider"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

