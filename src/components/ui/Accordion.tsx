"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ items }: { items: AccordionItemProps[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <AccordionRow key={i} {...item} />
      ))}
    </div>
  );
}

function AccordionRow({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-wide"
        aria-expanded={open}
      >
        {title}
        <span className={cn("text-lg transition-transform duration-300", open && "rotate-45")}>+</span>
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300 ease-lune",
          open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 text-sm leading-relaxed text-taupe">{children}</div>
      </div>
    </div>
  );
}
