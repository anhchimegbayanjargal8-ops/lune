"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/lib/types";
import {
  ProductImageType,
  PRODUCT_IMAGE_TYPE_LABEL,
  PRODUCT_IMAGE_TYPE_ORDER,
  getStorageImageUrl,
} from "@/lib/product-images";
import {
  ManifestEntry,
  getManifest,
  setManifestEntry,
  removeManifestEntry,
  reorderImage,
  MANIFEST_UPDATED_EVENT,
} from "@/lib/admin/image-manifest";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  deleteProductImage,
  uploadProductImage,
  validateProductImageFile,
} from "@/lib/supabase/storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function ProductImageManager({ product }: { product: Product }) {
  const [order, setOrder] = useState<ProductImageType[]>(PRODUCT_IMAGE_TYPE_ORDER);
  const [entries, setEntries] = useState<Partial<Record<ProductImageType, ManifestEntry>>>({});
  const [busyType, setBusyType] = useState<ProductImageType | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ProductImageType, string>>>({});

  async function refresh() {
    const manifest = await getManifest();
    const slugManifest = manifest[product.slug];
    setOrder(slugManifest?.order ?? PRODUCT_IMAGE_TYPE_ORDER);
    setEntries(slugManifest?.images ?? {});
  }

  useEffect(() => {
    refresh();
    window.addEventListener(MANIFEST_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MANIFEST_UPDATED_EVENT, refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  async function handleUpload(type: ProductImageType, file: File) {
    setErrors((e) => ({ ...e, [type]: undefined }));
    const validationError = validateProductImageFile(file);
    if (validationError) {
      setErrors((e) => ({ ...e, [type]: validationError }));
      return;
    }

    setBusyType(type);
    const { path, error } = await uploadProductImage(file, product.slug, `${type}.jpg`);
    if (error || !path) {
      setBusyType(null);
      setErrors((e) => ({ ...e, [type]: error ?? "Upload failed — please try again." }));
      return;
    }

    const { error: manifestError } = await setManifestEntry(product.slug, type, path);
    setBusyType(null);
    if (manifestError) {
      setErrors((e) => ({ ...e, [type]: manifestError }));
    }
  }

  async function handleDelete(type: ProductImageType) {
    setErrors((e) => ({ ...e, [type]: undefined }));
    setBusyType(type);
    const { error } = await deleteProductImage(product.slug, `${type}.jpg`);

    // In demo mode (Supabase not configured) there's nothing real to
    // delete — still clear the local reference so the UI stays honest.
    if (error && isSupabaseConfigured) {
      setBusyType(null);
      setErrors((e) => ({ ...e, [type]: error }));
      return;
    }

    const { error: manifestError } = await removeManifestEntry(product.slug, type);
    setBusyType(null);
    if (manifestError) {
      setErrors((e) => ({ ...e, [type]: manifestError }));
    }
  }

  async function handleMove(type: ProductImageType, direction: -1 | 1) {
    setErrors((e) => ({ ...e, [type]: undefined }));
    const { error } = await reorderImage(product.slug, type, direction);
    if (error) {
      setErrors((e) => ({ ...e, [type]: error }));
    }
  }

  const uploadedOrder = order.filter((t) => entries[t]);

  return (
    <div>
      {!isSupabaseConfigured && (
        <p className="mb-6 border border-rose bg-rose-pale/40 px-4 py-3 text-xs text-ink">
          Supabase isn&apos;t connected — uploads and reordering are saved to this browser only
          (see the README). Add your Supabase keys to enable real uploads to the{" "}
          <code>product-images</code> bucket and persist them in the <code>product_images</code>{" "}
          table.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {order.map((type) => {
          const isUploaded = Boolean(entries[type]);
          const uploadedIndex = uploadedOrder.indexOf(type);
          return (
            <ImageSlot
              key={type}
              type={type}
              placeholderUrl={product.images.find((i) => i.type === type)?.url}
              entry={entries[type]}
              canMovePrev={isUploaded && uploadedIndex > 0}
              canMoveNext={isUploaded && uploadedIndex < uploadedOrder.length - 1}
              isBusy={busyType === type}
              error={errors[type]}
              onUpload={(file) => handleUpload(type, file)}
              onDelete={() => handleDelete(type)}
              onMove={(direction) => handleMove(type, direction)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ImageSlot({
  type,
  placeholderUrl,
  entry,
  canMovePrev,
  canMoveNext,
  isBusy,
  error,
  onUpload,
  onDelete,
  onMove,
}: {
  type: ProductImageType;
  placeholderUrl: string | undefined;
  entry: ManifestEntry | undefined;
  canMovePrev: boolean;
  canMoveNext: boolean;
  isBusy: boolean;
  error: string | undefined;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadedUrl = entry ? getStorageImageUrl(entry.path) : null;
  const previewUrl = (uploadedUrl ? `${uploadedUrl}?v=${entry?.version}` : null) ?? placeholderUrl;
  const isUploaded = Boolean(uploadedUrl);

  return (
    <div className="border border-line p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest2 text-taupe">
          {PRODUCT_IMAGE_TYPE_LABEL[type]}
        </span>
        <span
          className={cn(
            "text-[10px] uppercase tracking-wide",
            isUploaded ? "text-rose-deep" : "text-taupe/60"
          )}
        >
          {isUploaded ? "Uploaded" : "Placeholder"}
        </span>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        {previewUrl && (
          <Image
            src={previewUrl}
            alt={`${PRODUCT_IMAGE_TYPE_LABEL[type]} preview`}
            fill
            sizes="300px"
            className="object-cover"
          />
        )}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center bg-ivory/80">
            <span className="text-xs uppercase tracking-widest2 text-ink">Uploading…</span>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-rose-deep">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
          className="border border-ink px-3 py-2 text-[11px] uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUploaded ? "Replace" : "Upload"}
        </button>
        {isUploaded && (
          <button
            type="button"
            disabled={isBusy}
            onClick={onDelete}
            className="border border-line px-3 py-2 text-[11px] uppercase tracking-wide text-taupe transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>
        )}
        {isUploaded && (
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Move earlier in gallery order"
              disabled={!canMovePrev || isBusy}
              onClick={() => onMove(-1)}
              className="flex h-8 w-8 items-center justify-center border border-line text-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Move later in gallery order"
              disabled={!canMoveNext || isBusy}
              onClick={() => onMove(1)}
              className="flex h-8 w-8 items-center justify-center border border-line text-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-taupe">
        JPG, PNG or WEBP, up to {MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.
      </p>
    </div>
  );
}
