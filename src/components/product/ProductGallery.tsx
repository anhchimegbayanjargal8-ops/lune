"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ProductImage, PRODUCT_IMAGE_TYPE_LABEL } from "@/lib/product-images";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
}

const SWIPE_THRESHOLD = 40;

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goTo = (index: number) => {
    setActive(((index % images.length) + images.length) % images.length);
  };
  const goNext = () => goTo(active + 1);
  const goPrev = () => goTo(active - 1);

  return (
    <div>
      <div className="flex flex-col-reverse gap-3 lg:flex-row">
        {/* Thumbnails */}
        <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
          {images.map((image, i) => (
            <button
              key={image.type}
              onClick={() => goTo(i)}
              aria-label={`View ${PRODUCT_IMAGE_TYPE_LABEL[image.type]} image`}
              title={PRODUCT_IMAGE_TYPE_LABEL[image.type]}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden bg-cream transition-opacity lg:h-24 lg:w-20",
                active === i ? "opacity-100 ring-1 ring-ink" : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>

        {/* Main image with hover-zoom + swipe + fullscreen trigger */}
        <ZoomableImage
          images={images}
          active={active}
          name={name}
          onNext={goNext}
          onPrev={goPrev}
          onExpand={() => setIsFullscreen(true)}
        />
      </div>

      {isFullscreen && (
        <FullscreenViewer
          images={images}
          name={name}
          active={active}
          onClose={() => setIsFullscreen(false)}
          onNext={goNext}
          onPrev={goPrev}
          onSelect={goTo}
        />
      )}
    </div>
  );
}

/** The large in-page image: hover-to-magnify on desktop, swipe on touch, click to open fullscreen. */
function ZoomableImage({
  images,
  active,
  name,
  onNext,
  onPrev,
  onExpand,
}: {
  images: ProductImage[];
  active: number;
  name: string;
  onNext: () => void;
  onPrev: () => void;
  onExpand: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touchStartX = useRef<number | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) onPrev();
    else if (deltaX < -SWIPE_THRESHOLD) onNext();
    touchStartX.current = null;
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[4/5] w-full flex-1 cursor-zoom-in select-none overflow-hidden bg-cream"
      onMouseEnter={() => setIsZooming(true)}
      onMouseLeave={() => setIsZooming(false)}
      onMouseMove={handleMouseMove}
      onClick={onExpand}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={`Open fullscreen view of ${name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onExpand();
      }}
    >
      {images.map((image, i) => (
        <Image
          key={image.type}
          src={image.url}
          alt={image.alt}
          fill
          priority={i === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn(
            "object-cover transition-[opacity,transform] duration-500 ease-lune",
            active === i ? "opacity-100" : "pointer-events-none absolute opacity-0",
            active === i && isZooming && "scale-[1.8]"
          )}
          style={active === i && isZooming ? { transformOrigin: origin } : undefined}
        />
      ))}

      <span className="pointer-events-none absolute bottom-3 left-3 bg-ivory/90 px-2.5 py-1 text-[10px] uppercase tracking-widest2 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {PRODUCT_IMAGE_TYPE_LABEL[images[active].type]}
      </span>

      <span
        className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-ivory/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      >
        <ExpandIcon />
      </span>
    </div>
  );
}

function FullscreenViewer({
  images,
  name,
  active,
  onClose,
  onNext,
  onPrev,
  onSelect,
}: {
  images: ProductImage[];
  name: string;
  active: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelect: (index: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) onPrev();
    else if (deltaX < -SWIPE_THRESHOLD) onNext();
    touchStartX.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-ivory animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={`Fullscreen view of ${name}`}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="text-xs uppercase tracking-widest2 text-taupe">
          {active + 1} / {images.length} — {PRODUCT_IMAGE_TYPE_LABEL[images[active].type]}
        </span>
        <button aria-label="Close fullscreen view" onClick={onClose} className="text-2xl leading-none">
          ×
        </button>
      </div>

      <div
        className="relative flex-1 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, i) => (
          <Image
            key={image.type}
            src={image.url}
            alt={image.alt}
            fill
            sizes="100vw"
            className={cn(
              "object-contain transition-opacity duration-400 ease-lune",
              active === i ? "opacity-100" : "pointer-events-none absolute opacity-0"
            )}
          />
        ))}

        <button
          aria-label="Previous image"
          onClick={onPrev}
          className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center bg-ivory/90 text-ink sm:flex"
        >
          ‹
        </button>
        <button
          aria-label="Next image"
          onClick={onNext}
          className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center bg-ivory/90 text-ink sm:flex"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-3 overflow-x-auto px-5 py-5">
        {images.map((image, i) => (
          <button
            key={image.type}
            onClick={() => onSelect(i)}
            aria-label={`View ${PRODUCT_IMAGE_TYPE_LABEL[image.type]} image`}
            className={cn(
              "relative h-16 w-14 shrink-0 overflow-hidden bg-cream transition-opacity",
              active === i ? "opacity-100 ring-1 ring-ink" : "opacity-50 hover:opacity-90"
            )}
          >
            <Image src={image.url} alt="" fill sizes="56px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
