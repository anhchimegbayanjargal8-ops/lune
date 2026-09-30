import { Product, ProductVariantOption, SizeMeasurement } from "./types";
import { SIZE_RUN } from "./constants";
import { getProductImages } from "./product-images";

/**
 * Default stock quantity per size — a light bell curve so M/L show more
 * units on hand than XS/XL, which reads more realistically in the UI.
 */
const DEFAULT_STOCK: Record<string, number> = { XS: 4, S: 9, M: 14, L: 10, XL: 5 };

/**
 * Builds a product's size run (with per-size stock) from a list of
 * available sizes. Pass `stock` to override specific sizes (e.g. to show a
 * "low stock" state on a particular size).
 */
function sizes(
  available: string[] = SIZE_RUN,
  stock: Partial<Record<string, number>> = {}
): ProductVariantOption[] {
  return SIZE_RUN.map((size) => {
    const inStock = available.includes(size);
    return {
      size,
      inStock,
      stockQuantity: inStock ? stock[size] ?? DEFAULT_STOCK[size] ?? 6 : 0,
    };
  });
}

interface ChartBase {
  bust: number;
  waist: number;
  hip: number;
  shoulder: number;
  length: number;
}

interface ChartDeltas {
  bust: number;
  waist: number;
  hip: number;
  shoulder: number;
  length: number;
}

const DEFAULT_DELTAS: ChartDeltas = { bust: 4, waist: 4, hip: 4, shoulder: 1.2, length: 1.5 };

/**
 * Generates a product's own size chart from a baseline (its "M" measurements)
 * and a per-step delta, only for the sizes the product is actually sold in.
 * This is what the size-recommendation algorithm compares customer
 * measurements against — every product can define its own baseline and
 * deltas, so charts genuinely differ garment to garment.
 */
function buildSizeChart(
  availableSizes: string[],
  base: ChartBase,
  deltas: Partial<ChartDeltas> = {}
): SizeMeasurement[] {
  const d = { ...DEFAULT_DELTAS, ...deltas };
  const mIndex = SIZE_RUN.indexOf("M");
  return SIZE_RUN.filter((s) => availableSizes.includes(s)).map((size) => {
    const offset = SIZE_RUN.indexOf(size) - mIndex;
    return {
      size,
      bust: Math.round((base.bust + d.bust * offset) * 10) / 10,
      waist: Math.round((base.waist + d.waist * offset) * 10) / 10,
      hip: Math.round((base.hip + d.hip * offset) * 10) / 10,
      shoulder: Math.round((base.shoulder + d.shoulder * offset) * 10) / 10,
      length: Math.round((base.length + d.length * offset) * 10) / 10,
    };
  });
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "silk-slip-dress-ivory",
    name: "Silk Slip Dress",
    category: "dresses",
    price: 289000,
    compareAtPrice: 349000,
    currency: "MNT",
    images: getProductImages("silk-slip-dress-ivory", "lune-p1", "Silk Slip Dress"),
    colors: [
      { name: "Ivory", hex: "#F2ECE3" },
      { name: "Black", hex: "#1B1917" },
    ],
    sizes: sizes(["XS", "S", "M", "L"]),
    description:
      "Cut on the bias from mulberry silk, our signature slip dress skims the body and pools softly at the hem. Adjustable straps, a fluid cowl neckline, and French seams throughout for a finish you'll feel from the inside.",
    material: "100% mulberry silk, 22 momme",
    details: [
      "Adjustable straps, bias cut",
      "Cowl neckline, French seams",
      "Made in limited runs — 40 pieces per colour",
    ],
    careInstructions: ["Dry clean only", "Cool iron on reverse if needed", "Store on a padded hanger"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L"], { bust: 86, waist: 68, hip: 92, shoulder: 36, length: 118 }),
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 34,
    createdAt: "2026-08-01",
  },
  {
    id: "2",
    slug: "wool-wrap-coat-camel",
    name: "Wool Wrap Coat",
    category: "outerwear",
    price: 420000,
    currency: "MNT",
    images: getProductImages("wool-wrap-coat-camel", "lune-p2", "Wool Wrap Coat"),
    colors: [
      { name: "Camel", hex: "#B58A5D" },
      { name: "Charcoal", hex: "#4A4844" },
    ],
    sizes: sizes(["S", "M", "L", "XL"]),
    description:
      "A double-faced wool coat built for real winters. The wrap front and self-belt create a clean line over knitwear, while the oversized collar folds up against the wind on the walk from Sükhbaatar Square.",
    material: "80% wool, 20% cashmere blend",
    details: ["Self-tie belt, side pockets", "Oversized fold collar", "Interior weight: 900g"],
    careInstructions: ["Professional dry clean only", "Air out between wears", "Store on a wide-shoulder hanger"],
    sizeChart: buildSizeChart(["S", "M", "L", "XL"], { bust: 100, waist: 88, hip: 104, shoulder: 42, length: 100 }, { length: 1.8 }),
    isNew: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 58,
    createdAt: "2026-07-28",
  },
  {
    id: "3",
    slug: "cashmere-crew-sweater-oat",
    name: "Cashmere Crew Sweater",
    category: "knitwear",
    price: 245000,
    currency: "MNT",
    images: getProductImages("cashmere-crew-sweater-oat", "lune-p3", "Cashmere Crew Sweater"),
    colors: [
      { name: "Oat", hex: "#EFE7D8" },
      { name: "Rose", hex: "#C9A199" },
      { name: "Black", hex: "#1B1917" },
    ],
    sizes: sizes(),
    description:
      "Twelve-gauge cashmere, knit fully fashioned so there's no bulk at the seams. A relaxed crew neck that layers cleanly under coats or stands alone with tailored trousers.",
    material: "100% grade-A cashmere",
    details: ["Fully fashioned knit construction", "Ribbed cuffs and hem", "Relaxed crew neckline"],
    careInstructions: ["Hand wash cold", "Dry flat, reshape while damp", "Store folded, not hung"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 92, waist: 78, hip: 98, shoulder: 39, length: 62 }),
    isNew: false,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 91,
    createdAt: "2026-06-14",
  },
  {
    id: "4",
    slug: "tailored-wide-trouser-black",
    name: "Tailored Wide-Leg Trouser",
    category: "bottoms",
    price: 178000,
    currency: "MNT",
    images: getProductImages("tailored-wide-trouser-black", "lune-p4", "Tailored Wide-Leg Trouser"),
    colors: [
      { name: "Black", hex: "#1B1917" },
      { name: "Taupe", hex: "#8C8377" },
    ],
    sizes: sizes(["XS", "S", "M", "L", "XL"]),
    description:
      "High-waisted and cut with a soft wide leg that moves as you walk. A fluid crepe fabric that holds its shape from the office to dinner without a single wrinkle.",
    material: "Crepe weave, mid-stretch (68% polyester, 29% viscose, 3% elastane)",
    details: ["Concealed side zip, welt pockets", "High-rise, wide leg", "Fully lined through the hip"],
    careInstructions: ["Machine washable, cold, gentle cycle", "Do not tumble dry", "Warm iron if needed"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L", "XL"], { bust: 94, waist: 70, hip: 98, shoulder: 38, length: 104 }),
    isNew: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 47,
    createdAt: "2026-05-22",
  },
  {
    id: "5",
    slug: "linen-shirt-white",
    name: "Relaxed Linen Shirt",
    category: "tops",
    price: 129000,
    currency: "MNT",
    images: getProductImages("linen-shirt-white", "lune-p5", "Relaxed Linen Shirt"),
    colors: [
      { name: "White", hex: "#FFFDFB" },
      { name: "Sage", hex: "#A9B29B" },
    ],
    sizes: sizes(),
    description:
      "A boxy, relaxed shirt in washed European linen. Dropped shoulders, a single chest pocket, and a slightly cropped length so it sits easily over trousers or tucked into a skirt.",
    material: "100% European flax linen",
    details: ["Dropped shoulders, single chest pocket", "Mother-of-pearl buttons", "Slightly cropped length"],
    careInstructions: ["Pre-washed for softness", "Machine wash cold", "Tumble dry low, remove promptly"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 96, waist: 84, hip: 98, shoulder: 41, length: 60 }),
    isNew: true,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 28,
    createdAt: "2026-08-05",
  },
  {
    id: "6",
    slug: "leather-shoulder-bag-cream",
    name: "Structured Shoulder Bag",
    category: "accessories",
    price: 312000,
    currency: "MNT",
    images: getProductImages("leather-shoulder-bag-cream", "lune-p6", "Structured Shoulder Bag"),
    colors: [
      { name: "Cream", hex: "#EFE7D8" },
      { name: "Black", hex: "#1B1917" },
    ],
    sizes: [{ size: "One Size", inStock: true, stockQuantity: 11 }],
    description:
      "Vegetable-tanned leather, hand-cut and assembled by a small atelier. A structured silhouette with a detachable strap, sized to carry a tablet, wallet, and the everyday essentials.",
    material: "Full-grain vegetable-tanned leather",
    details: ["Detachable, adjustable strap — 55–65cm drop", "Interior zip pocket and card slots", "Brass hardware"],
    careInstructions: ["Wipe clean with a dry cloth", "Condition leather every 6 months", "Store in the dust bag"],
    sizeChart: [],
    isNew: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 22,
    createdAt: "2026-04-30",
  },
  {
    id: "7",
    slug: "satin-midi-skirt-black",
    name: "Satin Bias Midi Skirt",
    category: "bottoms",
    price: 165000,
    compareAtPrice: 198000,
    currency: "MNT",
    images: getProductImages("satin-midi-skirt-black", "lune-p7", "Satin Bias Midi Skirt"),
    colors: [{ name: "Black", hex: "#1B1917" }],
    sizes: sizes(["XS", "S", "M", "L"]),
    description:
      "A liquid satin skirt cut on the bias for a fluid drape and gentle sheen. Elastic back waistband for ease, with a fall that skims rather than clings.",
    material: "97% polyester satin, 3% elastane",
    details: ["Elasticated back waist", "Bias-cut fluid drape", "Midi length"],
    careInstructions: ["Hand wash cold", "Do not wring", "Hang dry away from direct sun"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L"], { bust: 90, waist: 66, hip: 92, shoulder: 37, length: 70 }),
    isNew: false,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 19,
    createdAt: "2026-03-11",
  },
  {
    id: "8",
    slug: "puff-sleeve-blouse-rose",
    name: "Puff-Sleeve Blouse",
    category: "tops",
    price: 142000,
    currency: "MNT",
    images: getProductImages("puff-sleeve-blouse-rose", "lune-p8", "Puff-Sleeve Blouse"),
    colors: [
      { name: "Rose", hex: "#C9A199" },
      { name: "Ivory", hex: "#F2ECE3" },
    ],
    sizes: sizes(),
    description:
      "A softly structured blouse with statement puff sleeves gathered at a narrow cuff. Cut from a crisp cotton poplin with a touch of stretch for a flattering, easy fit.",
    material: "97% cotton, 3% elastane poplin",
    details: ["Statement puff sleeves, narrow cuff", "Covered button placket", "Softly structured shoulder"],
    careInstructions: ["Machine washable, cold", "Warm iron on reverse", "Tumble dry low"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 94, waist: 78, hip: 98, shoulder: 40, length: 58 }),
    isNew: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 15,
    createdAt: "2026-08-08",
  },
  {
    id: "9",
    slug: "quilted-vest-black",
    name: "Quilted Liner Vest",
    category: "outerwear",
    price: 168000,
    currency: "MNT",
    images: getProductImages("quilted-vest-black", "lune-p9", "Quilted Liner Vest"),
    colors: [
      { name: "Black", hex: "#1B1917" },
      { name: "Camel", hex: "#B58A5D" },
    ],
    sizes: sizes(["S", "M", "L", "XL"]),
    description:
      "A lightweight quilted vest designed to layer under coats or over knitwear. Recycled fill for warmth without the weight, with a stand collar and welt pockets.",
    material: "Shell: recycled polyester; Fill: recycled polyfill insulation",
    details: ["Stand collar, welt pockets", "Water-resistant shell finish", "Snap-front closure"],
    careInstructions: ["Machine wash cold, gentle cycle", "Do not iron the shell", "Reshape and air dry flat"],
    sizeChart: buildSizeChart(["S", "M", "L", "XL"], { bust: 98, waist: 88, hip: 100, shoulder: 40, length: 56 }),
    isNew: false,
    isFeatured: false,
    rating: 4.3,
    reviewCount: 12,
    createdAt: "2026-02-18",
  },
  {
    id: "10",
    slug: "ribbed-knit-dress-taupe",
    name: "Ribbed Knit Midi Dress",
    category: "dresses",
    price: 198000,
    currency: "MNT",
    images: getProductImages("ribbed-knit-dress-taupe", "lune-p10", "Ribbed Knit Midi Dress"),
    colors: [
      { name: "Taupe", hex: "#8C8377" },
      { name: "Black", hex: "#1B1917" },
    ],
    sizes: sizes(),
    description:
      "A body-skimming ribbed knit dress that moves with you. Fine merino blend, a soft turtleneck, and a midi length that layers effortlessly with boots or heels.",
    material: "70% merino wool, 30% viscose",
    details: ["Turtleneck collar", "Body-skimming ribbed knit", "Midi length"],
    careInstructions: ["Hand wash cold", "Dry flat", "Do not bleach"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 86, waist: 70, hip: 92, shoulder: 36, length: 108 }),
    isNew: true,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 41,
    createdAt: "2026-08-10",
  },
  {
    id: "11",
    slug: "cropped-blazer-charcoal",
    name: "Cropped Tailored Blazer",
    category: "outerwear",
    price: 268000,
    currency: "MNT",
    images: getProductImages("cropped-blazer-charcoal", "lune-p11", "Cropped Tailored Blazer"),
    colors: [{ name: "Charcoal", hex: "#4A4844" }],
    sizes: sizes(["XS", "S", "M", "L"]),
    description:
      "A sharply tailored blazer cropped at the hip, with structured shoulders and a single-button close. Fully lined in the same fluid crepe as our trousers for an easy set.",
    material: "70% wool, 30% polyester suiting",
    details: ["Structured shoulder, single-button close", "Fully lined", "Cropped at the hip"],
    careInstructions: ["Dry clean only", "Steam to refresh between wears", "Store on a structured hanger"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L"], { bust: 96, waist: 82, hip: 100, shoulder: 40, length: 54 }),
    isNew: false,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 33,
    createdAt: "2026-01-25",
  },
  {
    id: "12",
    slug: "cotton-poplin-shirtdress-white",
    name: "Poplin Shirtdress",
    category: "dresses",
    price: 176000,
    currency: "MNT",
    images: getProductImages("cotton-poplin-shirtdress-white", "lune-p12", "Poplin Shirtdress"),
    colors: [
      { name: "White", hex: "#FFFDFB" },
      { name: "Sage", hex: "#A9B29B" },
    ],
    sizes: sizes(),
    description:
      "A crisp shirtdress with a self-belt to define the waist, mother-of-pearl buttons, and a fall that works equally well open over trousers or belted alone.",
    material: "100% cotton poplin",
    details: ["Self-tie belt included", "Mother-of-pearl buttons", "Point collar"],
    careInstructions: ["Machine washable, cold", "Tumble dry low", "Warm iron while slightly damp"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 92, waist: 76, hip: 96, shoulder: 39, length: 100 }),
    isNew: false,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 26,
    createdAt: "2026-03-30",
  },
  {
    id: "13",
    slug: "mohair-cardigan-ivory",
    name: "Mohair Blend Cardigan",
    category: "knitwear",
    price: 215000,
    currency: "MNT",
    images: getProductImages("mohair-cardigan-ivory", "lune-p13", "Mohair Blend Cardigan"),
    colors: [
      { name: "Ivory", hex: "#F2ECE3" },
      { name: "Rose", hex: "#C9A199" },
    ],
    sizes: sizes(),
    description:
      "A brushed mohair-blend cardigan with a fine, hazy texture. Oversized fit, dropped shoulders, and horn buttons for a piece that feels lived-in from the first wear.",
    material: "62% mohair, 25% wool, 13% nylon",
    details: ["Oversized fit, dropped shoulders", "Horn buttons", "Brushed, hazy texture"],
    careInstructions: ["Hand wash cold", "Dry flat, do not hang", "Store folded with tissue between layers"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 100, waist: 88, hip: 102, shoulder: 44, length: 64 }, { shoulder: 1.6 }),
    isNew: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 20,
    createdAt: "2026-08-03",
  },
  {
    id: "14",
    slug: "straight-leg-denim-indigo",
    name: "Straight-Leg Denim",
    category: "bottoms",
    price: 149000,
    currency: "MNT",
    images: getProductImages("straight-leg-denim-indigo", "lune-p14", "Straight-Leg Denim"),
    colors: [{ name: "Indigo", hex: "#3A4048" }],
    sizes: sizes(["XS", "S", "M", "L", "XL"]),
    description:
      "Rigid Japanese denim in a clean straight leg, high-waisted with minimal distressing. Cut to soften and mould to you over the first few wears.",
    material: "100% cotton rigid denim, 13oz",
    details: ["High-rise, straight leg", "Five-pocket styling", "Minimal distressing"],
    careInstructions: ["Wash cold, inside out", "Wash sparingly to preserve colour", "Line dry"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L", "XL"], { bust: 92, waist: 68, hip: 96, shoulder: 37, length: 102 }),
    isNew: false,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 37,
    createdAt: "2025-12-08",
  },
  {
    id: "15",
    slug: "silk-scarf-print",
    name: "Printed Silk Scarf",
    category: "accessories",
    price: 78000,
    currency: "MNT",
    images: getProductImages("silk-scarf-print", "lune-p15", "Printed Silk Scarf"),
    colors: [
      { name: "Rose Print", hex: "#C9A199" },
      { name: "Ink Print", hex: "#1B1917" },
    ],
    sizes: [{ size: "One Size", inStock: true, stockQuantity: 18 }],
    description:
      "A generous silk twill scarf finished with hand-rolled edges. An easy way to add a considered detail to a plain coat or knit — worn at the neck, on a bag, or as a hair tie.",
    material: "100% silk twill",
    details: ["90 x 90cm", "Hand-rolled edges", "Original in-house print"],
    careInstructions: ["Dry clean only", "Store flat or loosely rolled", "Keep away from perfume and direct sun"],
    sizeChart: [],
    isNew: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 44,
    createdAt: "2026-07-15",
  },
  {
    id: "16",
    slug: "pleated-midi-skirt-camel",
    name: "Pleated Midi Skirt",
    category: "bottoms",
    price: 158000,
    currency: "MNT",
    images: getProductImages("pleated-midi-skirt-camel", "lune-p16", "Pleated Midi Skirt"),
    colors: [
      { name: "Camel", hex: "#B58A5D" },
      { name: "Black", hex: "#1B1917" },
    ],
    sizes: sizes(),
    description:
      "Fine knife pleats set into a fluid crepe, falling to a clean midi length. An elasticated waistband keeps it comfortable through long days without losing its shape.",
    material: "Crepe weave with permanent pleating",
    details: ["Fine knife pleats", "Elasticated waistband", "Midi length"],
    careInstructions: ["Hand wash cold", "Do not iron directly over pleats", "Hang to dry"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 90, waist: 68, hip: 94, shoulder: 36, length: 72 }),
    isNew: false,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 17,
    createdAt: "2026-02-02",
  },
  {
    id: "17",
    slug: "merino-turtleneck-black",
    name: "Merino Turtleneck",
    category: "knitwear",
    price: 132000,
    currency: "MNT",
    images: getProductImages("merino-turtleneck-black", "lune-p17", "Merino Turtleneck"),
    colors: [
      { name: "Black", hex: "#1B1917" },
      { name: "Oat", hex: "#EFE7D8" },
      { name: "Taupe", hex: "#8C8377" },
    ],
    sizes: sizes(),
    description:
      "The everyday layer, done properly. Fine-gauge merino wool, a close but not clingy fit, and a turtleneck that sits comfortably under coats and blazers alike.",
    material: "100% merino wool, 18.5 micron",
    details: ["Fine 14-gauge knit", "Turtleneck collar", "Close, not clingy fit"],
    careInstructions: ["Machine washable, wool cycle", "Dry flat", "Do not tumble dry"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 88, waist: 74, hip: 94, shoulder: 37, length: 58 }),
    isNew: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 63,
    createdAt: "2025-11-20",
  },
  {
    id: "18",
    slug: "leather-belt-bag-black",
    name: "Leather Belt Bag",
    category: "accessories",
    price: 158000,
    currency: "MNT",
    images: getProductImages("leather-belt-bag-black", "lune-p18", "Leather Belt Bag"),
    colors: [
      { name: "Black", hex: "#1B1917" },
      { name: "Camel", hex: "#B58A5D" },
    ],
    sizes: [{ size: "One Size", inStock: true, stockQuantity: 9 }],
    description:
      "A compact leather belt bag sized for a phone, cards and keys. Adjustable strap worn at the waist or crossbody, with a soft curved silhouette.",
    material: "Full-grain leather",
    details: ["Adjustable strap, 70–110cm", "Interior slip pocket", "Soft curved silhouette"],
    careInstructions: ["Wipe clean with a dry cloth", "Avoid prolonged water exposure", "Store in the dust bag"],
    sizeChart: [],
    isNew: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 9,
    createdAt: "2026-08-11",
  },

  /* ---- Core basics range — added for the size-recommendation feature ---- */
  {
    id: "19",
    slug: "oversized-cotton-tshirt-white",
    name: "Oversized Cotton T-Shirt",
    category: "tops",
    price: 59000,
    currency: "MNT",
    images: getProductImages("oversized-cotton-tshirt-white", "lune-p19", "Oversized Cotton T-Shirt"),
    colors: [
      { name: "White", hex: "#FFFDFB" },
      { name: "Black", hex: "#1B1917" },
      { name: "Taupe", hex: "#8C8377" },
    ],
    sizes: sizes(),
    description:
      "The everyday tee, reworked. Heavyweight combed cotton jersey, a dropped shoulder, and a boxy, oversized fit that still holds its shape after a hundred washes.",
    material: "100% heavyweight combed cotton, 240gsm",
    details: ["Dropped shoulder, boxy fit", "Ribbed crew neckline", "Double-stitched hems"],
    careInstructions: ["Machine wash cold with like colours", "Tumble dry low", "Do not bleach"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 108, waist: 104, hip: 106, shoulder: 46, length: 68 }, { shoulder: 1.6 }),
    isNew: true,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 52,
    createdAt: "2026-08-09",
  },
  {
    id: "20",
    slug: "black-blazer-tailored",
    name: "Black Blazer",
    category: "outerwear",
    price: 258000,
    currency: "MNT",
    images: getProductImages("black-blazer-tailored", "lune-p20", "Black Blazer"),
    colors: [{ name: "Black", hex: "#1B1917" }],
    sizes: sizes(["XS", "S", "M", "L", "XL"]),
    description:
      "A single-breasted blazer that anchors almost anything — sharp through the shoulder, nipped at the waist, and cut long enough to wear open over knitwear or belted alone.",
    material: "68% wool, 30% polyester, 2% elastane suiting",
    details: ["Single-breasted, two-button close", "Structured shoulder with light padding", "Interior pocket, fully lined"],
    careInstructions: ["Dry clean only", "Steam to refresh", "Store on a structured hanger, buttoned"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L", "XL"], { bust: 96, waist: 80, hip: 100, shoulder: 40, length: 66 }),
    isNew: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 40,
    createdAt: "2026-04-12",
  },
  {
    id: "21",
    slug: "wide-leg-jeans-mid-blue",
    name: "Wide Leg Jeans",
    category: "bottoms",
    price: 156000,
    currency: "MNT",
    images: getProductImages("wide-leg-jeans-mid-blue", "lune-p21", "Wide Leg Jeans"),
    colors: [
      { name: "Mid Blue", hex: "#5B7290" },
      { name: "Black", hex: "#1B1917" },
    ],
    sizes: sizes(["XS", "S", "M", "L", "XL"]),
    description:
      "A wide-leg jean with a soft mid-weight denim and a clean, uncropped hem that pools gently over shoes. High-waisted with a relaxed leg that balances a fitted top nicely.",
    material: "98% cotton, 2% elastane denim, 11.5oz",
    details: ["High-rise, wide uncropped leg", "Five-pocket styling", "Button-fly closure"],
    careInstructions: ["Wash cold, inside out", "Wash sparingly", "Line dry, do not tumble"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L", "XL"], { bust: 94, waist: 70, hip: 98, shoulder: 38, length: 106 }),
    isNew: true,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 23,
    createdAt: "2026-07-30",
  },
  {
    id: "22",
    slug: "knit-cardigan-camel",
    name: "Knit Cardigan",
    category: "knitwear",
    price: 172000,
    currency: "MNT",
    images: getProductImages("knit-cardigan-camel", "lune-p22", "Knit Cardigan"),
    colors: [
      { name: "Camel", hex: "#B58A5D" },
      { name: "Oat", hex: "#EFE7D8" },
      { name: "Black", hex: "#1B1917" },
    ],
    sizes: sizes(),
    description:
      "A simple, well-made cardigan for every day — a fine-gauge wool blend, patch pockets, and a relaxed body that layers easily over a tee or a slip dress alike.",
    material: "80% wool, 20% nylon",
    details: ["Patch pockets", "Relaxed, straight body", "Rib-knit cuffs and hem"],
    careInstructions: ["Hand wash cold", "Dry flat", "Store folded"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 96, waist: 84, hip: 98, shoulder: 40, length: 61 }),
    isNew: false,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 31,
    createdAt: "2026-03-20",
  },
  {
    id: "23",
    slug: "basic-white-shirt-cotton",
    name: "Basic White Shirt",
    category: "tops",
    price: 118000,
    currency: "MNT",
    images: getProductImages("basic-white-shirt-cotton", "lune-p23", "Basic White Shirt"),
    colors: [
      { name: "White", hex: "#FFFDFB" },
      { name: "Pale Blue", hex: "#C7D3DE" },
    ],
    sizes: sizes(),
    description:
      "The shirt everything else is measured against. Crisp cotton poplin, a clean point collar, and a true-to-size fit that tucks in cleanly without ever feeling stiff.",
    material: "100% cotton poplin",
    details: ["Point collar, classic placket", "Single chest pocket", "Curved shirttail hem"],
    careInstructions: ["Machine wash cold", "Tumble dry low or line dry", "Iron while slightly damp"],
    sizeChart: buildSizeChart(SIZE_RUN, { bust: 90, waist: 76, hip: 94, shoulder: 38, length: 66 }),
    isNew: false,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 48,
    createdAt: "2026-02-27",
  },
  {
    id: "24",
    slug: "satin-dress-midnight",
    name: "Satin Dress",
    category: "dresses",
    price: 226000,
    compareAtPrice: 265000,
    currency: "MNT",
    images: getProductImages("satin-dress-midnight", "lune-p24", "Satin Dress"),
    colors: [
      { name: "Midnight", hex: "#232733" },
      { name: "Rose", hex: "#C9A199" },
    ],
    sizes: sizes(["XS", "S", "M", "L"]),
    description:
      "A fluid satin dress cut with a cowl back and a fall that catches the light without trying too hard. Dress it up with heels or wear it open over the linen shirt.",
    material: "95% polyester satin, 5% elastane",
    details: ["Cowl back detail", "Adjustable straps", "Side-seam pockets"],
    careInstructions: ["Hand wash cold", "Hang dry away from direct heat", "Cool iron on reverse only"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L"], { bust: 88, waist: 70, hip: 92, shoulder: 36, length: 116 }),
    isNew: true,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 18,
    createdAt: "2026-08-06",
  },
  {
    id: "25",
    slug: "denim-jacket-classic-blue",
    name: "Denim Jacket",
    category: "outerwear",
    price: 148000,
    currency: "MNT",
    images: getProductImages("denim-jacket-classic-blue", "lune-p25", "Denim Jacket"),
    colors: [{ name: "Classic Blue", hex: "#4A6A8A" }],
    sizes: sizes(["XS", "S", "M", "L", "XL"]),
    description:
      "A trim, cropped denim jacket in a mid-weight rigid denim. Classic button front and chest flap pockets — the one layer that goes over everything from a slip dress to a hoodie.",
    material: "100% cotton denim, 10.5oz",
    details: ["Button-front closure", "Chest flap pockets", "Cropped, trim fit"],
    careInstructions: ["Wash cold, inside out", "Line dry", "Warm iron if needed"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L", "XL"], { bust: 94, waist: 84, hip: 96, shoulder: 39, length: 52 }),
    isNew: false,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 29,
    createdAt: "2026-01-15",
  },
  {
    id: "26",
    slug: "straight-leg-trousers-charcoal",
    name: "Straight Leg Trousers",
    category: "bottoms",
    price: 164000,
    currency: "MNT",
    images: getProductImages("straight-leg-trousers-charcoal", "lune-p26", "Straight Leg Trousers"),
    colors: [
      { name: "Charcoal", hex: "#4A4844" },
      { name: "Camel", hex: "#B58A5D" },
    ],
    sizes: sizes(["XS", "S", "M", "L", "XL"]),
    description:
      "A clean-lined straight trouser in a fluid suiting fabric. Mid-rise, tailored through the hip, and finished with a crisp centre crease for a polished, everyday silhouette.",
    material: "72% polyester, 26% viscose, 2% elastane suiting",
    details: ["Mid-rise, straight leg", "Centre crease", "Welt back pockets"],
    careInstructions: ["Machine wash cold, gentle cycle", "Do not tumble dry", "Warm iron with crease"],
    sizeChart: buildSizeChart(["XS", "S", "M", "L", "XL"], { bust: 92, waist: 72, hip: 96, shoulder: 37, length: 103 }),
    isNew: false,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 21,
    createdAt: "2026-05-02",
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export function getNewArrivals(): Product[] {
  return [...PRODUCTS]
    .filter((p) => p.isNew)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, limit);
}
