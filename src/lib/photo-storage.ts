import { Photo } from "@/types/photo";
import { INITIAL_PHOTOS } from "@/data/initialPhotos";
import { supabase, isSupabaseConfigured } from "./supabase";
import exifr from "exifr";

const LOCAL_STORAGE_KEY = "uri_portfolio_photos";

/**
 * Extract EXIF metadata from an uploaded image file
 */
export async function extractExifData(file: File): Promise<Partial<Photo>> {
  try {
    const data = await exifr.parse(file, [
      "Make",
      "Model",
      "LensModel",
      "FocalLength",
      "FNumber",
      "ExposureTime",
      "ISO",
      "DateTimeOriginal",
      "latitude",
      "longitude",
    ]);

    if (!data) return {};

    const camera = data.Make && data.Model
      ? `${data.Make} ${data.Model}`.replace(new RegExp(`^${data.Make}\\s+${data.Make}`, "i"), data.Make)
      : data.Model || data.Make;

    let shutterSpeed: string | undefined = undefined;
    if (data.ExposureTime) {
      if (data.ExposureTime < 1) {
        shutterSpeed = `1/${Math.round(1 / data.ExposureTime)}s`;
      } else {
        shutterSpeed = `${data.ExposureTime}s`;
      }
    }

    return {
      camera: camera || undefined,
      lens: data.LensModel || undefined,
      focal_length: data.FocalLength ? `${Math.round(data.FocalLength)}mm` : undefined,
      aperture: data.FNumber ? `f/${data.FNumber.toFixed(1).replace(".0", "")}` : undefined,
      shutter_speed: shutterSpeed,
      iso: data.ISO ? String(data.ISO) : undefined,
      captured_at: data.DateTimeOriginal
        ? new Date(data.DateTimeOriginal).toISOString().split("T")[0]
        : undefined,
    };
  } catch (error) {
    console.warn("Could not read EXIF data:", error);
    return {};
  }
}

/**
 * Fetch all photos, either from Supabase or local state/fallback
 */
export async function getPhotos(): Promise<Photo[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Photo[];
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to local storage:", e);
    }
  }

  // Client-side fallback to localStorage or INITIAL_PHOTOS
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0]?.id?.startsWith("photo-")) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PHOTOS));
            return INITIAL_PHOTOS;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }

  return INITIAL_PHOTOS;
}

/**
 * Upload an image file to Supabase Storage (bucket: portfolio-photos)
 * or convert to a local object URL / base64 fallback.
 */
export async function uploadImageFile(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Error al subir imagen a Supabase: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("portfolio-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Fallback: Read file as Data URL for immediate local preview
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Save or update a photo
 */
export async function savePhoto(photo: Photo): Promise<Photo> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("photos")
      .upsert(photo)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al guardar en Supabase: ${error.message}`);
    }
    return data as Photo;
  }

  // Local fallback
  if (typeof window !== "undefined") {
    const current = await getPhotos();
    const existingIndex = current.findIndex((p) => p.id === photo.id);
    let updated: Photo[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = photo;
    } else {
      updated = [photo, ...current];
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }

  return photo;
}

/**
 * Delete a photo
 */
export async function deletePhoto(photoId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("photos").delete().eq("id", photoId);
    if (error) {
      throw new Error(`Error al eliminar de Supabase: ${error.message}`);
    }
  }

  if (typeof window !== "undefined") {
    const current = await getPhotos();
    const filtered = current.filter((p) => p.id !== photoId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }
}

/**
 * Update photo order or properties in batch
 */
export async function saveAllPhotos(photos: Photo[]): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("photos").upsert(photos);
    if (error) {
      throw new Error(`Error al actualizar fotos: ${error.message}`);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  }
}

