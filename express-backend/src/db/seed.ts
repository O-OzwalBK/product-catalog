import "dotenv/config";
import { db, pool } from "./index";
import { products } from "./schema";

const sampleProducts = [
  {
    slug: "wireless-noise-cancelling-headphones",
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    price: "129.99",
    rating: "4.5",
    shortDescription: "Over-ear headphones with 30-hour battery life.",
    longDescription:
      "These over-ear wireless headphones combine active noise cancellation with a 30-hour battery life, so you can focus on your work or commute without interruption. Includes a carrying case and USB-C fast charging.",
    imageUrl: "https://picsum.photos/seed/headphones/600/600",
    stock: 42,
  },
  {
    slug: "mechanical-keyboard-rgb",
    name: "Mechanical Keyboard with RGB Backlight",
    category: "Electronics",
    price: "89.5",
    rating: "4.3",
    shortDescription: "Hot-swappable switches, per-key RGB lighting.",
    longDescription:
      "A tenkeyless mechanical keyboard with hot-swappable switches, letting you change the feel of your typing without soldering. Per-key RGB lighting is fully programmable through companion software.",
    imageUrl: "https://picsum.photos/seed/keyboard/600/600",
    stock: 30,
  },
  {
    slug: "ceramic-pour-over-coffee-set",
    name: "Ceramic Pour-Over Coffee Set",
    category: "Home",
    price: "34.0",
    rating: "4.7",
    shortDescription: "Hand-glazed dripper, carafe, and 2 cups.",
    longDescription:
      "A hand-glazed ceramic pour-over set including a dripper, 500ml carafe, and two matching cups. Each piece is individually fired, so glaze patterns vary slightly between sets.",
    imageUrl: "https://picsum.photos/seed/pourover/600/600",
    stock: 18,
  },
  {
    slug: "merino-wool-crew-socks-3-pack",
    name: "Merino Wool Crew Socks (3-Pack)",
    category: "Apparel",
    price: "24.99",
    rating: "4.6",
    shortDescription: "Breathable, odor-resistant, all-season.",
    longDescription:
      "A three-pack of crew socks knitted from a merino wool blend. Naturally odor-resistant and temperature-regulating, they work equally well on winter hikes and summer runs.",
    imageUrl: "https://picsum.photos/seed/socks/600/600",
    stock: 75,
  },
  {
    slug: "stainless-steel-water-bottle-1l",
    name: "Stainless Steel Water Bottle (1L)",
    category: "Outdoor",
    price: "19.99",
    rating: "4.4",
    shortDescription: "Double-walled, keeps drinks cold 24 hours.",
    longDescription:
      "A double-walled, vacuum-insulated 1-liter bottle that keeps cold drinks cold for up to 24 hours and hot drinks hot for up to 12. Powder-coated finish resists scratches and condensation.",
    imageUrl: "https://picsum.photos/seed/bottle/600/600",
    stock: 60,
  },
  {
    slug: "adjustable-dumbbell-set",
    name: "Adjustable Dumbbell Set (5-25kg)",
    category: "Fitness",
    price: "219.0",
    rating: "4.2",
    shortDescription: "Space-saving, dial-adjustable, pair.",
    longDescription:
      "A pair of dial-adjustable dumbbells replacing 15 pairs of fixed-weight dumbbells, adjustable from 5kg to 25kg per hand in 2.5kg increments. Includes a storage tray.",
    imageUrl: "https://picsum.photos/seed/dumbbell/600/600",
    stock: 12,
  },
  {
    slug: "canvas-messenger-bag",
    name: "Canvas Messenger Bag",
    category: "Accessories",
    price: "58.0",
    rating: "4.1",
    shortDescription: "Water-resistant canvas, fits 15-inch laptop.",
    longDescription:
      "A water-resistant waxed canvas messenger bag with a padded 15-inch laptop sleeve, full-grain leather straps, and a magnetic flap closure for quick access.",
    imageUrl: "https://picsum.photos/seed/bag/600/600",
    stock: 25,
  },
  {
    slug: "cast-iron-skillet-12in",
    name: 'Cast Iron Skillet (12")',
    category: "Home",
    price: "44.99",
    rating: "4.8",
    shortDescription: "Pre-seasoned, oven and induction safe.",
    longDescription:
      "A 12-inch pre-seasoned cast iron skillet safe for oven, stovetop, induction, and open-flame cooking. Develops a naturally non-stick surface with use and lasts for generations with basic care.",
    imageUrl: "https://picsum.photos/seed/skillet/600/600",
    stock: 22,
  },
  {
    slug: "bluetooth-portable-speaker",
    name: "Bluetooth Portable Speaker",
    category: "Electronics",
    price: "49.99",
    rating: "3.9",
    shortDescription: "IPX7 waterproof, 12-hour playback.",
    longDescription:
      "A compact IPX7 waterproof speaker delivering 12 hours of playback per charge, with a built-in mic for calls and a carabiner clip for attaching to a bag or bike.",
    imageUrl: "https://picsum.photos/seed/speaker/600/600",
    stock: 38,
  },
  {
    slug: "linen-throw-blanket",
    name: "Linen Throw Blanket",
    category: "Home",
    price: "42.5",
    rating: "4.5",
    shortDescription: "Pre-washed European linen, 130x170cm.",
    longDescription:
      "A pre-washed European linen throw blanket, 130x170cm, that softens further with every wash. Breathable enough for summer, cozy enough layered for winter.",
    imageUrl: "https://picsum.photos/seed/blanket/600/600",
    stock: 33,
  },
  {
    slug: "running-shoes-lightweight",
    name: "Lightweight Running Shoes",
    category: "Apparel",
    price: "94.99",
    rating: "4.3",
    shortDescription: "Breathable mesh upper, responsive foam sole.",
    longDescription:
      "Running shoes built with a breathable engineered mesh upper and a responsive foam midsole tuned for daily training miles rather than race day only.",
    imageUrl: "https://picsum.photos/seed/shoes/600/600",
    stock: 27,
  },
  {
    slug: "ceramic-plant-pot-set",
    name: "Ceramic Plant Pot Set (3 Sizes)",
    category: "Home",
    price: "29.99",
    rating: "4.6",
    shortDescription: "Matte finish, drainage holes, bamboo trays.",
    longDescription:
      "A set of three matte-glazed ceramic plant pots in graduated sizes, each with a drainage hole and a matching bamboo tray to protect windowsills and shelves.",
    imageUrl: "https://picsum.photos/seed/planter/600/600",
    stock: 20,
  },
  {
    slug: "leather-wallet-slim",
    name: "Slim Leather Bifold Wallet",
    category: "Accessories",
    price: "38.0",
    rating: "4.4",
    shortDescription: "Full-grain leather, RFID-blocking layer.",
    longDescription:
      "A slim bifold wallet cut from full-grain leather with a hidden RFID-blocking layer, holding up to 8 cards plus cash without the usual bulk.",
    imageUrl: "https://picsum.photos/seed/wallet/600/600",
    stock: 50,
  },
  {
    slug: "yoga-mat-non-slip",
    name: "Non-Slip Yoga Mat",
    category: "Fitness",
    price: "32.0",
    rating: "4.0",
    shortDescription: "6mm cushioning, textured non-slip surface.",
    longDescription:
      "A 6mm thick yoga mat with a textured, non-slip surface on both sides, offering enough cushioning for floor work without sacrificing stability in standing poses.",
    imageUrl: "https://picsum.photos/seed/yogamat/600/600",
    stock: 45,
  },
  {
    slug: "desk-lamp-adjustable",
    name: "Adjustable LED Desk Lamp",
    category: "Home",
    price: "36.99",
    rating: "4.2",
    shortDescription: "5 brightness levels, USB charging port.",
    longDescription:
      "An LED desk lamp with 5 brightness levels and 3 color temperatures, a flexible gooseneck arm, and a built-in USB-A port for charging a phone alongside your work.",
    imageUrl: "https://picsum.photos/seed/desklamp/600/600",
    stock: 40,
  },
];

async function seed() {
  console.log(`Seeding ${sampleProducts.length} products...`);

  // onConflictDoUpdate makes this script idempotent: re-running it after
  // editing a product above updates the row instead of erroring on the
  // duplicate slug or creating a second copy.
  for (const product of sampleProducts) {
    await db.insert(products).values(product).onConflictDoUpdate({
      target: products.slug,
      set: product,
    });
  }

  console.log("Seed complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
