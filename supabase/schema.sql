-- ==============================================================================
-- URI PORTFOLIO - SUPABASE SETUP SCHEMA
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase (https://supabase.com)
-- ==============================================================================

-- 1. Crear la tabla de Fotos
CREATE TABLE IF NOT EXISTS public.photos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    description TEXT,
    featured BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    camera TEXT,
    lens TEXT,
    focal_length TEXT,
    aperture TEXT,
    shutter_speed TEXT,
    iso TEXT,
    location TEXT,
    captured_at TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    width INTEGER,
    height INTEGER
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acceso:
-- Todo el mundo puede ver las fotos (Lectura pública)
CREATE POLICY "Public Read Access"
    ON public.photos FOR SELECT
    USING (true);

-- Solo los usuarios autenticados (Tú en el portal de admin) pueden insertar, modificar o borrar fotos
CREATE POLICY "Authenticated Users Insert"
    ON public.photos FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Update"
    ON public.photos FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Delete"
    ON public.photos FOR DELETE
    USING (auth.role() = 'authenticated');

-- 4. Crear el Bucket de almacenamiento para las fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-photos', 'portfolio-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para el Bucket:
-- Lectura pública de fotos en el bucket
CREATE POLICY "Public Storage Read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-photos');

-- Solo usuarios autenticados pueden subir fotos al bucket
CREATE POLICY "Authenticated Storage Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'portfolio-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Storage Delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'portfolio-photos' AND auth.role() = 'authenticated');

