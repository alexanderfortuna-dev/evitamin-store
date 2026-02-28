export interface Product {
  sku: string;
  title: string;
  brand: string;
  category: string;
  priceUsd: number;
  priceIdr: number;
  weightG: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumetricWeightG: number;
  bpomNo: string | null;
  imagePaths: string[];
  description: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isHalal: boolean;
  origin: string;
  flavors: string[];
  ingredients: string;
  nutritionFacts: string;
  usageInstructions: string;
  warnings: string;
}

const EXCHANGE_RATE = 16780;

const categories = [
  "Protein",
  "Pre-workout",
  "Creatine",
  "BCAA",
  "Multivitamin",
  "Nootropics",
  "Weight Gainers",
  "Joint Support",
  "Omega",
  "Testo Support",
];

const brands = [
  "TopBrand",
  "FlashLabs",
  "StrongLabs",
  "VitaForce",
  "NutraPeak",
  "BioFuel",
  "PrimeFit",
  "MaxPower",
  "CoreNutrition",
  "EliteSupps",
];

const origins = ["USA", "UK", "Australia", "Germany", "Japan", "Canada"];

const categoryProducts: Record<string, { names: string[]; priceRange: [number, number]; weights: number[]; flavors: string[][] }> = {
  Protein: {
    names: ["Whey Protein Isolate", "Whey Protein Concentrate", "Casein Protein", "Plant Protein Blend", "Hydrolyzed Whey", "Egg White Protein", "Collagen Protein", "Mass Protein", "Diet Whey", "Protein Bar Box"],
    priceRange: [22, 85],
    weights: [500, 1000, 2000, 2500],
    flavors: [["Chocolate", "Vanilla", "Strawberry"], ["Cookies & Cream", "Banana"], ["Unflavored", "Mocha"], ["Salted Caramel", "Peanut Butter"]],
  },
  "Pre-workout": {
    names: ["Pre-Workout Extreme", "Pre-Workout Focus", "Pump Formula", "Stim-Free Pre", "Energy Igniter", "Nitric Oxide Booster", "Beta-Alanine Blend", "Pre-Workout Original", "Caffeine Rush", "Pre-Workout Elite"],
    priceRange: [18, 55],
    weights: [200, 250, 300, 400],
    flavors: [["Citrus Blast", "Blue Raspberry"], ["Watermelon", "Fruit Punch"], ["Green Apple", "Grape"], ["Tropical Mix", "Lemonade"]],
  },
  Creatine: {
    names: ["Micronized Creatine", "Creatine HCL", "Creatine Monohydrate", "Creatine Blend", "Buffered Creatine", "Creapure", "Creatine Capsules", "Creatine Ethyl Ester", "Creatine Nitrate", "Tri-Creatine"],
    priceRange: [12, 40],
    weights: [200, 300, 500, 1000],
    flavors: [["Unflavored"], ["Lemon", "Berry"], ["Unflavored", "Fruit Punch"]],
  },
  BCAA: {
    names: ["BCAA 2:1:1", "BCAA 4:1:1", "Essential Amino Acids", "Amino Energy", "BCAA Capsules", "Intra-Workout BCAA", "Fermented BCAA", "BCAA Recovery", "Amino Hydrate", "BCAA Extreme"],
    priceRange: [15, 45],
    weights: [250, 300, 400, 500],
    flavors: [["Mango", "Grape"], ["Watermelon", "Peach"], ["Lemon Lime", "Cola"], ["Tropical", "Berry"]],
  },
  Multivitamin: {
    names: ["Daily Multi Men", "Daily Multi Women", "Sport Multivitamin", "Mega Multi Complex", "Vitamin C 1000mg", "Vitamin D3 5000IU", "B-Complex", "Zinc + Selenium", "Iron + Folic Acid", "Immunity Pack"],
    priceRange: [8, 35],
    weights: [100, 150, 200, 250],
    flavors: [["Unflavored"]],
  },
  Nootropics: {
    names: ["Focus Formula", "Brain Boost", "Alpha GPC", "L-Theanine", "Lion's Mane Extract", "Nootropic Stack", "Memory Plus", "Cognitive Support", "NeuroFuel", "Mind Sharp"],
    priceRange: [20, 65],
    weights: [60, 90, 120, 150],
    flavors: [["Unflavored"], ["Berry", "Citrus"]],
  },
  "Weight Gainers": {
    names: ["Mass Gainer 3000", "Serious Mass", "Lean Gainer", "Calorie Bomb", "Clean Mass", "Weight Gain Shake", "Mega Mass", "Power Gainer", "Bulk Builder", "Mass Matrix"],
    priceRange: [30, 120],
    weights: [2000, 2500, 3000, 5000],
    flavors: [["Chocolate", "Vanilla"], ["Strawberry", "Cookies & Cream"], ["Banana", "Caramel"]],
  },
  "Joint Support": {
    names: ["Glucosamine Chondroitin", "Joint Flex", "Collagen Type II", "MSM Complex", "Turmeric Curcumin", "Joint Recovery", "Hyaluronic Acid", "Bone & Joint", "Mobility Plus", "Cartilage Support"],
    priceRange: [15, 50],
    weights: [90, 120, 180, 250],
    flavors: [["Unflavored"]],
  },
  Omega: {
    names: ["Omega-3 Fish Oil", "Triple Omega", "Krill Oil", "Omega-3 Ultra", "Fish Oil Capsules", "Cod Liver Oil", "Vegan Omega DHA", "High EPA Omega", "Omega Complex", "Pure Fish Oil"],
    priceRange: [12, 55],
    weights: [90, 120, 180, 250],
    flavors: [["Unflavored"], ["Lemon Coated"]],
  },
  "Testo Support": {
    names: ["Testo Booster", "Tribulus Extract", "D-Aspartic Acid", "ZMA Complex", "Fenugreek Extract", "Tongkat Ali", "Ashwagandha KSM-66", "Test Matrix", "Male Performance", "Hormone Support"],
    priceRange: [18, 60],
    weights: [60, 90, 120, 180],
    flavors: [["Unflavored"]],
  },
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateProducts(): Product[] {
  const products: Product[] = [];
  const rand = seededRandom(42);
  let skuCounter = 0;

  for (const category of categories) {
    const config = categoryProducts[category];
    const productsPerCategory = 10;

    for (let i = 0; i < productsPerCategory; i++) {
      skuCounter++;
      const name = config.names[i % config.names.length];
      const brand = brands[Math.floor(rand() * brands.length)];
      const priceUsd = Number((config.priceRange[0] + rand() * (config.priceRange[1] - config.priceRange[0])).toFixed(2));
      const weight = config.weights[Math.floor(rand() * config.weights.length)];
      const flavorSet = config.flavors[Math.floor(rand() * config.flavors.length)];
      const flavor = flavorSet[Math.floor(rand() * flavorSet.length)];
      const origin = origins[Math.floor(rand() * origins.length)];
      const hasBpom = rand() > 0.4;
      const isHalal = rand() > 0.3;

      const sku = `${category.replace(/[^A-Z]/gi, "").substring(0, 4).toUpperCase()}-${String(skuCounter).padStart(3, "0")}`;
      const l = 10 + Math.floor(rand() * 20);
      const w = 10 + Math.floor(rand() * 15);
      const h = 10 + Math.floor(rand() * 25);

      products.push({
        sku,
        title: `${name} ${weight >= 1000 ? `${weight / 1000}kg` : `${weight}g`} - ${flavor}`,
        brand,
        category,
        priceUsd,
        priceIdr: Math.round(priceUsd * EXCHANGE_RATE),
        weightG: weight,
        lengthCm: l,
        widthCm: w,
        heightCm: h,
        volumetricWeightG: Math.round((l * w * h) / 5),
        bpomNo: hasBpom ? `BPOM-${Math.floor(10000 + rand() * 89999)}-${String.fromCharCode(65 + Math.floor(rand() * 26))}${String.fromCharCode(65 + Math.floor(rand() * 26))}${String.fromCharCode(65 + Math.floor(rand() * 26))}` : null,
        imagePaths: [`https://picsum.photos/seed/${sku}/400/400`],
        description: generateDescription(name, brand, category, weight, flavor),
        rating: Number((3.5 + rand() * 1.5).toFixed(1)),
        reviewCount: Math.floor(10 + rand() * 500),
        inStock: rand() > 0.1,
        isHalal,
        origin,
        flavors: flavorSet,
        ingredients: generateIngredients(category),
        nutritionFacts: generateNutrition(category, weight),
        usageInstructions: generateUsage(category),
        warnings: generateWarnings(category),
      });
    }
  }

  return products;
}

function generateDescription(name: string, brand: string, category: string, weight: number, flavor: string): string {
  const descriptions: Record<string, string> = {
    Protein: `Premium quality ${name.toLowerCase()} from ${brand}. ${weight}g of pure protein powder in delicious ${flavor} flavor. Supports muscle growth and recovery. Made with high-quality ingredients for maximum bioavailability.`,
    "Pre-workout": `${brand} ${name} in refreshing ${flavor} flavor. Designed to boost energy, focus, and endurance during your workouts. Contains clinically dosed ingredients for peak performance.`,
    Creatine: `${brand} ${name} - pure creatine for strength and power. Micronized for better absorption. Mix with water or your favorite beverage. ${weight}g supply for consistent gains.`,
    BCAA: `${brand} ${name} in ${flavor} flavor. Essential amino acids in optimal ratio for muscle recovery and growth. Perfect for intra-workout or post-workout use.`,
    Multivitamin: `${brand} ${name} - comprehensive daily vitamin and mineral formula. Supports overall health, immunity, and wellbeing. Easy-to-swallow capsules with high bioavailability.`,
    Nootropics: `${brand} ${name} - advanced cognitive support formula. Enhances focus, memory, and mental clarity. Made with premium nootropic compounds.`,
    "Weight Gainers": `${brand} ${name} in ${flavor} - high-calorie mass gainer with quality protein and complex carbs. Ideal for hard gainers looking to build size and strength.`,
    "Joint Support": `${brand} ${name} - comprehensive joint care formula. Supports cartilage health, flexibility, and mobility. Premium ingredients for long-term joint wellness.`,
    Omega: `${brand} ${name} - premium omega fatty acid supplement. Supports heart, brain, and joint health. Molecularly distilled for purity.`,
    "Testo Support": `${brand} ${name} - natural testosterone support formula. Promotes healthy hormone levels, energy, and vitality. Made with clinically studied ingredients.`,
  };
  return descriptions[category] || `${brand} ${name} - premium supplement.`;
}

function generateIngredients(category: string): string {
  const ingredients: Record<string, string> = {
    Protein: "Whey Protein Isolate, Cocoa Powder, Natural Flavoring, Lecithin, Sucralose, Digestive Enzyme Blend",
    "Pre-workout": "Beta-Alanine, Caffeine Anhydrous, L-Citrulline, Creatine Monohydrate, Taurine, B-Vitamins",
    Creatine: "Creatine Monohydrate (100%)",
    BCAA: "L-Leucine, L-Isoleucine, L-Valine, Citric Acid, Natural Flavoring, Sucralose",
    Multivitamin: "Vitamin A, Vitamin C, Vitamin D3, Vitamin E, Thiamine, Riboflavin, Niacin, Vitamin B6, Folic Acid, Vitamin B12, Biotin, Zinc, Iron, Calcium",
    Nootropics: "Alpha-GPC, Lion's Mane Extract, Bacopa Monnieri, L-Theanine, Caffeine, Phosphatidylserine",
    "Weight Gainers": "Maltodextrin, Whey Protein Concentrate, Cocoa Powder, MCT Oil, Creatine, Vitamin & Mineral Blend",
    "Joint Support": "Glucosamine Sulfate, Chondroitin Sulfate, MSM, Turmeric Extract, Hyaluronic Acid, Vitamin C",
    Omega: "Fish Oil Concentrate (EPA/DHA), Gelatin Capsule, Glycerin, Vitamin E (as preservative)",
    "Testo Support": "D-Aspartic Acid, Fenugreek Extract, Zinc, Magnesium, Vitamin B6, Ashwagandha Extract",
  };
  return ingredients[category] || "See product label for full ingredients list.";
}

function generateNutrition(category: string, weight: number): string {
  const nutrition: Record<string, string> = {
    Protein: "Per serving (30g): Calories 120, Protein 25g, Carbs 2g, Fat 1g, Sodium 100mg",
    "Pre-workout": "Per serving (10g): Calories 10, Beta-Alanine 3.2g, Caffeine 200mg, L-Citrulline 6g",
    Creatine: "Per serving (5g): Creatine Monohydrate 5g",
    BCAA: "Per serving (10g): L-Leucine 3g, L-Isoleucine 1.5g, L-Valine 1.5g, Calories 15",
    Multivitamin: "Per serving (1 capsule): See supplement facts panel for detailed vitamin and mineral amounts",
    Nootropics: "Per serving (2 capsules): Alpha-GPC 300mg, Lion's Mane 500mg, L-Theanine 200mg",
    "Weight Gainers": "Per serving (150g): Calories 650, Protein 50g, Carbs 90g, Fat 8g",
    "Joint Support": "Per serving (2 capsules): Glucosamine 1500mg, Chondroitin 1200mg, MSM 500mg",
    Omega: "Per serving (2 softgels): Fish Oil 2000mg, EPA 720mg, DHA 480mg",
    "Testo Support": "Per serving (3 capsules): D-Aspartic Acid 3g, Fenugreek 600mg, Zinc 30mg",
  };
  return nutrition[category] || "See product label for nutrition information.";
}

function generateUsage(category: string): string {
  const usage: Record<string, string> = {
    Protein: "Mix 1 scoop (30g) with 200-300ml of cold water or milk. Shake well. Consume 1-2 servings daily, preferably post-workout or between meals.",
    "Pre-workout": "Mix 1 scoop with 200ml of cold water. Consume 20-30 minutes before exercise. Do not exceed 1 serving per day.",
    Creatine: "Mix 1 scoop (5g) with water or juice. Take daily, preferably post-workout. Loading phase: 20g/day for 5 days, then 5g/day maintenance.",
    BCAA: "Mix 1 scoop with 300ml of cold water. Sip during or after workout. Can be consumed up to 3 times daily.",
    Multivitamin: "Take 1 capsule daily with food. Best taken in the morning with breakfast.",
    Nootropics: "Take 2 capsules in the morning with food. Do not exceed recommended dose.",
    "Weight Gainers": "Mix 2-3 scoops with 400-500ml of whole milk. Consume 1-2 servings daily between meals or post-workout.",
    "Joint Support": "Take 2 capsules daily with food. Results may be noticeable after 4-6 weeks of consistent use.",
    Omega: "Take 2 softgels daily with meals. Store in a cool, dry place.",
    "Testo Support": "Take 3 capsules daily with food. Use for 8 weeks followed by a 4-week break.",
  };
  return usage[category] || "Follow the dosage instructions on the product label.";
}

function generateWarnings(category: string): string {
  return "For adult use only. Consult a healthcare professional before use if you have any medical condition or are taking medication. Keep out of reach of children. Do not exceed recommended dose. Store in a cool, dry place.";
}

export const allProducts: Product[] = generateProducts();

export function getProductsBySku(sku: string): Product | undefined {
  return allProducts.find((p) => p.sku === sku);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All" || !category) return allProducts;
  return allProducts.filter((p) => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return allProducts;
  return allProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
  );
}

export function getCategories(): string[] {
  return categories;
}

export function getBrands(): string[] {
  return brands;
}
