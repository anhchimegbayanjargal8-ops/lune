import { Category } from "./types";

export const SITE = {
  name: "LUNE",
  tagline: "Quiet luxury, everyday",
  description:
    "LUNE is a Ulaanbaatar-based fashion house creating quiet, considered pieces for the modern woman — minimal silhouettes, premium fabrics, honest prices.",
  city: "Ulaanbaatar, Mongolia",
  email: "hello@lune.mn",
  phone: "+976 7000 1234",
  instagram: "@lune.mn",
  freeShippingThreshold: 150000,
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
] as const;

export const CATEGORIES: Category[] = [
  {
    slug: "dresses",
    name: "Dresses",
    description: "Fluid silhouettes cut from silk, linen and crepe.",
    image: "https://picsum.photos/seed/lune-cat-dresses/900/1100",
  },
  {
    slug: "outerwear",
    name: "Outerwear",
    description: "Tailored coats and jackets built for the steppe wind.",
    image: "https://picsum.photos/seed/lune-cat-outerwear/900/1100",
  },
  {
    slug: "knitwear",
    name: "Knitwear",
    description: "Cashmere-blend knits, soft against Ulaanbaatar winters.",
    image: "https://picsum.photos/seed/lune-cat-knitwear/900/1100",
  },
  {
    slug: "tops",
    name: "Tops",
    description: "Considered blouses and shirting in quiet colourways.",
    image: "https://picsum.photos/seed/lune-cat-tops/900/1100",
  },
  {
    slug: "bottoms",
    name: "Bottoms",
    description: "Trousers and skirts with a clean, architectural line.",
    image: "https://picsum.photos/seed/lune-cat-bottoms/900/1100",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "The finishing details — bags, scarves, small leather goods.",
    image: "https://picsum.photos/seed/lune-cat-accessories/900/1100",
  },
];

export const SIZE_RUN = ["XS", "S", "M", "L", "XL"];
