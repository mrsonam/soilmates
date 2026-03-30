import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Private bucket for plant photos — must not be public. */
export const PLANT_IMAGES_BUCKET = "plant-images";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

let _admin: SupabaseClient | null = null;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(`${name} is not set`);
  }
  return v.trim();
}

/** Server-only Supabase client with service role (Storage + signed URLs). */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = requireEnv("SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  _admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export async function createSignedUrlForStoragePath(
  storagePath: string,
  expiresIn = SIGNED_URL_TTL_SECONDS,
): Promise<string | null> {
  if (!isSupabaseStorageConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(PLANT_IMAGES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) {
    console.error("[storage] signed URL failed", error?.message ?? error);
    return null;
  }
  return data.signedUrl;
}

export async function createSignedUrlsForPaths(
  paths: string[],
  expiresIn = SIGNED_URL_TTL_SECONDS,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (paths.length === 0 || !isSupabaseStorageConfigured()) return out;
  const supabase = getSupabaseAdmin();
  await Promise.all(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(PLANT_IMAGES_BUCKET)
        .createSignedUrl(path, expiresIn);
      if (!error && data?.signedUrl) out.set(path, data.signedUrl);
    }),
  );
  return out;
}

export async function uploadPlantImageObject(
  storagePath: string,
  body: ArrayBuffer | Blob,
  contentType: string,
): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseAdmin();
    const buffer =
      body instanceof Blob ? await body.arrayBuffer() : body;
    const { error } = await supabase.storage
      .from(PLANT_IMAGES_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return { error: msg };
  }
}

export async function deletePlantImageObject(
  storagePath: string,
): Promise<void> {
  if (!isSupabaseStorageConfigured()) return;
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(PLANT_IMAGES_BUCKET).remove([storagePath]);
}
