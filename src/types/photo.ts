export interface Photo {
  id: string;
  title: string;
  slug: string;
  url: string;
  thumbnail_url?: string;
  category: string;
  description?: string;
  featured: boolean; // True to appear in the 3D Hero Carousel
  order_index: number;
  camera?: string; // e.g. "Sony A7R V"
  lens?: string; // e.g. "FE 35mm F1.4 GM"
  focal_length?: string; // e.g. "35mm"
  aperture?: string; // e.g. "f/1.4"
  shutter_speed?: string; // e.g. "1/1000s"
  iso?: string; // e.g. "100"
  location?: string; // e.g. "Kyoto, Japan"
  captured_at?: string;
  created_at: string;
  width?: number;
  height?: number;
}

export type Category = string;

