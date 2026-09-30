"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label: string;
  maxWidthClassName?: string;
}

export function Modal({ isOpen, onClose, children, label, maxWidthClassName = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-end justify-center p-0 transition-opacity duration-300 ease-lune sm:items-center sm:p-6",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-y-auto bg-ivory transition-all duration-300 ease-lune sm:max-h-[88vh] sm:rounded-none",
          maxWidthClassName,
          isOpen ? "translate-y-0 sm:scale-100" : "translate-y-6 sm:scale-95"
        )}
      >
        {children}
      </div>
    </div>
  );
}
