import { createClient, isSupabaseConfigured } from "./client";

export const PRODUCT_IMAGE_BUCKET = "product-images";

export function getStorageImageUrl(path: string): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!isSupabaseConfigured || !supabaseUrl) {
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${path}`;
}

export function productImagePath(
  slug: string,
  filename: string
): string {
  return `${slug}/${filename}`;
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateProductImageFile(
  file: File
): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG or WEBP image.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image is too large — please keep it under ${
      MAX_IMAGE_SIZE_BYTES / (1024 * 1024)
    }MB.`;
  }

  return null;
}

export async function uploadProductImage(
  file: File,
  slug: string,
  filename: string
): Promise<{ path: string | null; error: string | null }> {
  const validationError = validateProductImageFile(file);

  if (validationError) {
    return {
      path: null,
      error: validationError,
    };
  }

  const supabase = createClient();

  if (!supabase) {
    return {
      path: null,
      error:
        "Supabase Storage isn't configured yet — connect a project to enable uploads.",
    };
  }

  const path = productImagePath(slug, filename);

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) {
    return {
      path: null,
      error: error.message,
    };
  }

  return {
    path,
    error: null,
  };
}

export async function deleteProductImage(
  slug: string,
  filename: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return {
      error:
        "Supabase Storage isn't configured yet — connect a project to enable uploads.",
    };
  }

  const path = productImagePath(slug, filename);

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([path]);

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    error: null,
  };
}
