const MESSAGES = [
  "Free shipping in Ulaanbaatar over 150,000₮",
  "New arrivals every Friday",
  "Cash on delivery available",
  "Considered fabrics, made to last",
];

export function MarqueeStrip() {
  const items = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden border-y border-line bg-cream py-3">
      <div className="flex w-max animate-marquee gap-10">
        {items.map((msg, i) => (
          <span key={i} className="eyebrow flex items-center gap-10 whitespace-nowrap text-ink/70">
            {msg}
            <span aria-hidden="true" className="text-rose-deep">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
