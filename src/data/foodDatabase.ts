export interface FoodEntry {
  name: string;
  category: string;
  calPer100g: number;
  gramsPerCup: number | null; // null if cup measurement doesn't apply
}

// Conversion helpers for units → grams
const OZ_TO_G = 28.35;
const LB_TO_G = 453.6;
const TBSP_RATIO = 1 / 16; // 1 tbsp = 1/16 cup
const TSP_RATIO = 1 / 48;  // 1 tsp = 1/48 cup

export function calculateCalories(
  food: FoodEntry,
  amount: number,
  unit: string,
): number | null {
  if (!amount || amount <= 0) return null;

  switch (unit) {
    case 'g':
      return Math.round((amount / 100) * food.calPer100g);
    case 'ml':
      // Approximate: 1ml ≈ 1g for most foods
      return Math.round((amount / 100) * food.calPer100g);
    case 'oz':
      return Math.round((amount * OZ_TO_G / 100) * food.calPer100g);
    case 'lb':
      return Math.round((amount * LB_TO_G / 100) * food.calPer100g);
    case 'cups':
      if (!food.gramsPerCup) return null;
      return Math.round((amount * food.gramsPerCup / 100) * food.calPer100g);
    case 'tbsp':
      if (!food.gramsPerCup) return null;
      return Math.round((amount * food.gramsPerCup * TBSP_RATIO / 100) * food.calPer100g);
    case 'tsp':
      if (!food.gramsPerCup) return null;
      return Math.round((amount * food.gramsPerCup * TSP_RATIO / 100) * food.calPer100g);
    default:
      return null;
  }
}

export function searchFoods(query: string, limit = 8): FoodEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const exact: FoodEntry[] = [];
  const startsWith: FoodEntry[] = [];
  const contains: FoodEntry[] = [];

  for (const food of FOOD_DATABASE) {
    const name = food.name.toLowerCase();
    if (name === q) {
      exact.push(food);
    } else if (name.startsWith(q)) {
      startsWith.push(food);
    } else if (name.includes(q)) {
      contains.push(food);
    }
  }
  return [...exact, ...startsWith, ...contains].slice(0, limit);
}

export const FOOD_DATABASE: FoodEntry[] = [
  // ═══════════════════════════════════════════
  // FRUITS
  // ═══════════════════════════════════════════
  { name: 'Apple', category: 'Fruits', calPer100g: 52, gramsPerCup: 125 },
  { name: 'Apricot', category: 'Fruits', calPer100g: 48, gramsPerCup: 155 },
  { name: 'Avocado', category: 'Fruits', calPer100g: 160, gramsPerCup: 150 },
  { name: 'Banana', category: 'Fruits', calPer100g: 89, gramsPerCup: 150 },
  { name: 'Blackberries', category: 'Fruits', calPer100g: 43, gramsPerCup: 144 },
  { name: 'Blueberries', category: 'Fruits', calPer100g: 57, gramsPerCup: 148 },
  { name: 'Cantaloupe', category: 'Fruits', calPer100g: 34, gramsPerCup: 160 },
  { name: 'Cherries', category: 'Fruits', calPer100g: 50, gramsPerCup: 138 },
  { name: 'Clementine', category: 'Fruits', calPer100g: 47, gramsPerCup: 180 },
  { name: 'Coconut (fresh)', category: 'Fruits', calPer100g: 354, gramsPerCup: 80 },
  { name: 'Cranberries', category: 'Fruits', calPer100g: 46, gramsPerCup: 100 },
  { name: 'Dates (Medjool)', category: 'Fruits', calPer100g: 277, gramsPerCup: 147 },
  { name: 'Dragon fruit', category: 'Fruits', calPer100g: 50, gramsPerCup: 227 },
  { name: 'Figs (fresh)', category: 'Fruits', calPer100g: 74, gramsPerCup: 149 },
  { name: 'Grapefruit', category: 'Fruits', calPer100g: 42, gramsPerCup: 230 },
  { name: 'Grapes (green)', category: 'Fruits', calPer100g: 69, gramsPerCup: 151 },
  { name: 'Grapes (red)', category: 'Fruits', calPer100g: 69, gramsPerCup: 151 },
  { name: 'Guava', category: 'Fruits', calPer100g: 68, gramsPerCup: 165 },
  { name: 'Honeydew melon', category: 'Fruits', calPer100g: 36, gramsPerCup: 170 },
  { name: 'Kiwi', category: 'Fruits', calPer100g: 61, gramsPerCup: 180 },
  { name: 'Lemon', category: 'Fruits', calPer100g: 29, gramsPerCup: 212 },
  { name: 'Lime', category: 'Fruits', calPer100g: 30, gramsPerCup: 67 },
  { name: 'Lychee', category: 'Fruits', calPer100g: 66, gramsPerCup: 190 },
  { name: 'Mango', category: 'Fruits', calPer100g: 60, gramsPerCup: 165 },
  { name: 'Nectarine', category: 'Fruits', calPer100g: 44, gramsPerCup: 143 },
  { name: 'Orange', category: 'Fruits', calPer100g: 47, gramsPerCup: 180 },
  { name: 'Papaya', category: 'Fruits', calPer100g: 43, gramsPerCup: 145 },
  { name: 'Passion fruit', category: 'Fruits', calPer100g: 97, gramsPerCup: 236 },
  { name: 'Peach', category: 'Fruits', calPer100g: 39, gramsPerCup: 154 },
  { name: 'Pear', category: 'Fruits', calPer100g: 57, gramsPerCup: 140 },
  { name: 'Persimmon', category: 'Fruits', calPer100g: 70, gramsPerCup: 168 },
  { name: 'Pineapple', category: 'Fruits', calPer100g: 50, gramsPerCup: 165 },
  { name: 'Plantain (raw)', category: 'Fruits', calPer100g: 122, gramsPerCup: 148 },
  { name: 'Plum', category: 'Fruits', calPer100g: 46, gramsPerCup: 165 },
  { name: 'Pomegranate seeds', category: 'Fruits', calPer100g: 83, gramsPerCup: 174 },
  { name: 'Raspberries', category: 'Fruits', calPer100g: 52, gramsPerCup: 123 },
  { name: 'Starfruit', category: 'Fruits', calPer100g: 31, gramsPerCup: 132 },
  { name: 'Strawberries', category: 'Fruits', calPer100g: 32, gramsPerCup: 152 },
  { name: 'Tangerine', category: 'Fruits', calPer100g: 53, gramsPerCup: 195 },
  { name: 'Watermelon', category: 'Fruits', calPer100g: 30, gramsPerCup: 152 },

  // ═══════════════════════════════════════════
  // VEGETABLES
  // ═══════════════════════════════════════════
  { name: 'Artichoke', category: 'Vegetables', calPer100g: 47, gramsPerCup: 168 },
  { name: 'Arugula', category: 'Vegetables', calPer100g: 25, gramsPerCup: 20 },
  { name: 'Asparagus', category: 'Vegetables', calPer100g: 20, gramsPerCup: 134 },
  { name: 'Beet', category: 'Vegetables', calPer100g: 43, gramsPerCup: 136 },
  { name: 'Bell pepper (green)', category: 'Vegetables', calPer100g: 20, gramsPerCup: 150 },
  { name: 'Bell pepper (red)', category: 'Vegetables', calPer100g: 31, gramsPerCup: 150 },
  { name: 'Bell pepper (yellow)', category: 'Vegetables', calPer100g: 27, gramsPerCup: 150 },
  { name: 'Bok choy', category: 'Vegetables', calPer100g: 13, gramsPerCup: 70 },
  { name: 'Broccoli', category: 'Vegetables', calPer100g: 34, gramsPerCup: 91 },
  { name: 'Brussels sprouts', category: 'Vegetables', calPer100g: 43, gramsPerCup: 88 },
  { name: 'Butternut squash', category: 'Vegetables', calPer100g: 45, gramsPerCup: 205 },
  { name: 'Cabbage (green)', category: 'Vegetables', calPer100g: 25, gramsPerCup: 89 },
  { name: 'Cabbage (red)', category: 'Vegetables', calPer100g: 31, gramsPerCup: 89 },
  { name: 'Carrot', category: 'Vegetables', calPer100g: 41, gramsPerCup: 128 },
  { name: 'Cauliflower', category: 'Vegetables', calPer100g: 25, gramsPerCup: 107 },
  { name: 'Celery', category: 'Vegetables', calPer100g: 14, gramsPerCup: 101 },
  { name: 'Corn (sweet)', category: 'Vegetables', calPer100g: 86, gramsPerCup: 154 },
  { name: 'Cucumber', category: 'Vegetables', calPer100g: 15, gramsPerCup: 119 },
  { name: 'Eggplant', category: 'Vegetables', calPer100g: 25, gramsPerCup: 82 },
  { name: 'Endive', category: 'Vegetables', calPer100g: 17, gramsPerCup: 50 },
  { name: 'Fennel', category: 'Vegetables', calPer100g: 31, gramsPerCup: 87 },
  { name: 'Garlic', category: 'Vegetables', calPer100g: 149, gramsPerCup: 136 },
  { name: 'Ginger root', category: 'Vegetables', calPer100g: 80, gramsPerCup: 96 },
  { name: 'Green beans', category: 'Vegetables', calPer100g: 31, gramsPerCup: 110 },
  { name: 'Green onion (scallion)', category: 'Vegetables', calPer100g: 32, gramsPerCup: 100 },
  { name: 'Green peas', category: 'Vegetables', calPer100g: 81, gramsPerCup: 145 },
  { name: 'Jalapeño', category: 'Vegetables', calPer100g: 29, gramsPerCup: 90 },
  { name: 'Kale', category: 'Vegetables', calPer100g: 49, gramsPerCup: 67 },
  { name: 'Leek', category: 'Vegetables', calPer100g: 61, gramsPerCup: 89 },
  { name: 'Lettuce (iceberg)', category: 'Vegetables', calPer100g: 14, gramsPerCup: 72 },
  { name: 'Lettuce (romaine)', category: 'Vegetables', calPer100g: 17, gramsPerCup: 47 },
  { name: 'Mushrooms (white)', category: 'Vegetables', calPer100g: 22, gramsPerCup: 70 },
  { name: 'Mushrooms (cremini)', category: 'Vegetables', calPer100g: 22, gramsPerCup: 72 },
  { name: 'Mushrooms (portobello)', category: 'Vegetables', calPer100g: 22, gramsPerCup: 86 },
  { name: 'Mushrooms (shiitake)', category: 'Vegetables', calPer100g: 34, gramsPerCup: 145 },
  { name: 'Okra', category: 'Vegetables', calPer100g: 33, gramsPerCup: 100 },
  { name: 'Onion (white)', category: 'Vegetables', calPer100g: 40, gramsPerCup: 160 },
  { name: 'Onion (red)', category: 'Vegetables', calPer100g: 40, gramsPerCup: 160 },
  { name: 'Parsnip', category: 'Vegetables', calPer100g: 75, gramsPerCup: 133 },
  { name: 'Potato (white)', category: 'Vegetables', calPer100g: 77, gramsPerCup: 150 },
  { name: 'Potato (sweet)', category: 'Vegetables', calPer100g: 86, gramsPerCup: 133 },
  { name: 'Pumpkin', category: 'Vegetables', calPer100g: 26, gramsPerCup: 116 },
  { name: 'Radish', category: 'Vegetables', calPer100g: 16, gramsPerCup: 116 },
  { name: 'Shallot', category: 'Vegetables', calPer100g: 72, gramsPerCup: 160 },
  { name: 'Snap peas', category: 'Vegetables', calPer100g: 42, gramsPerCup: 98 },
  { name: 'Spinach', category: 'Vegetables', calPer100g: 23, gramsPerCup: 30 },
  { name: 'Spaghetti squash', category: 'Vegetables', calPer100g: 31, gramsPerCup: 155 },
  { name: 'Swiss chard', category: 'Vegetables', calPer100g: 19, gramsPerCup: 36 },
  { name: 'Tomato', category: 'Vegetables', calPer100g: 18, gramsPerCup: 149 },
  { name: 'Cherry tomatoes', category: 'Vegetables', calPer100g: 18, gramsPerCup: 149 },
  { name: 'Turnip', category: 'Vegetables', calPer100g: 28, gramsPerCup: 130 },
  { name: 'Watercress', category: 'Vegetables', calPer100g: 11, gramsPerCup: 34 },
  { name: 'Zucchini', category: 'Vegetables', calPer100g: 17, gramsPerCup: 124 },

  // ═══════════════════════════════════════════
  // HERBS & SPICES (fresh)
  // ═══════════════════════════════════════════
  { name: 'Basil (fresh)', category: 'Herbs', calPer100g: 23, gramsPerCup: 24 },
  { name: 'Cilantro (fresh)', category: 'Herbs', calPer100g: 23, gramsPerCup: 16 },
  { name: 'Dill (fresh)', category: 'Herbs', calPer100g: 43, gramsPerCup: 9 },
  { name: 'Mint (fresh)', category: 'Herbs', calPer100g: 44, gramsPerCup: 14 },
  { name: 'Parsley (fresh)', category: 'Herbs', calPer100g: 36, gramsPerCup: 60 },
  { name: 'Rosemary (fresh)', category: 'Herbs', calPer100g: 131, gramsPerCup: 50 },
  { name: 'Thyme (fresh)', category: 'Herbs', calPer100g: 101, gramsPerCup: 28 },

  // ═══════════════════════════════════════════
  // NUTS & SEEDS
  // ═══════════════════════════════════════════
  { name: 'Almonds', category: 'Nuts & Seeds', calPer100g: 579, gramsPerCup: 143 },
  { name: 'Brazil nuts', category: 'Nuts & Seeds', calPer100g: 659, gramsPerCup: 133 },
  { name: 'Cashews', category: 'Nuts & Seeds', calPer100g: 553, gramsPerCup: 137 },
  { name: 'Chia seeds', category: 'Nuts & Seeds', calPer100g: 486, gramsPerCup: 170 },
  { name: 'Coconut (dried, shredded)', category: 'Nuts & Seeds', calPer100g: 660, gramsPerCup: 93 },
  { name: 'Flaxseed', category: 'Nuts & Seeds', calPer100g: 534, gramsPerCup: 168 },
  { name: 'Hazelnuts', category: 'Nuts & Seeds', calPer100g: 628, gramsPerCup: 135 },
  { name: 'Hemp seeds', category: 'Nuts & Seeds', calPer100g: 553, gramsPerCup: 160 },
  { name: 'Macadamia nuts', category: 'Nuts & Seeds', calPer100g: 718, gramsPerCup: 134 },
  { name: 'Peanuts', category: 'Nuts & Seeds', calPer100g: 567, gramsPerCup: 146 },
  { name: 'Pecans', category: 'Nuts & Seeds', calPer100g: 691, gramsPerCup: 109 },
  { name: 'Pine nuts', category: 'Nuts & Seeds', calPer100g: 673, gramsPerCup: 135 },
  { name: 'Pistachios', category: 'Nuts & Seeds', calPer100g: 560, gramsPerCup: 123 },
  { name: 'Poppy seeds', category: 'Nuts & Seeds', calPer100g: 525, gramsPerCup: 141 },
  { name: 'Pumpkin seeds', category: 'Nuts & Seeds', calPer100g: 559, gramsPerCup: 129 },
  { name: 'Sesame seeds', category: 'Nuts & Seeds', calPer100g: 573, gramsPerCup: 144 },
  { name: 'Sunflower seeds', category: 'Nuts & Seeds', calPer100g: 584, gramsPerCup: 140 },
  { name: 'Walnuts', category: 'Nuts & Seeds', calPer100g: 654, gramsPerCup: 117 },

  // ═══════════════════════════════════════════
  // MEATS (raw)
  // ═══════════════════════════════════════════
  { name: 'Beef (ground, lean)', category: 'Meat', calPer100g: 137, gramsPerCup: null },
  { name: 'Beef (ground, regular)', category: 'Meat', calPer100g: 254, gramsPerCup: null },
  { name: 'Beef (sirloin)', category: 'Meat', calPer100g: 150, gramsPerCup: null },
  { name: 'Beef (ribeye)', category: 'Meat', calPer100g: 291, gramsPerCup: null },
  { name: 'Beef (tenderloin)', category: 'Meat', calPer100g: 218, gramsPerCup: null },
  { name: 'Beef (chuck roast)', category: 'Meat', calPer100g: 198, gramsPerCup: null },
  { name: 'Beef (brisket)', category: 'Meat', calPer100g: 194, gramsPerCup: null },
  { name: 'Beef (flank steak)', category: 'Meat', calPer100g: 158, gramsPerCup: null },
  { name: 'Beef liver', category: 'Meat', calPer100g: 135, gramsPerCup: null },
  { name: 'Bison (ground)', category: 'Meat', calPer100g: 146, gramsPerCup: null },
  { name: 'Chicken breast', category: 'Meat', calPer100g: 120, gramsPerCup: 140 },
  { name: 'Chicken thigh', category: 'Meat', calPer100g: 177, gramsPerCup: 140 },
  { name: 'Chicken drumstick', category: 'Meat', calPer100g: 161, gramsPerCup: null },
  { name: 'Chicken wing', category: 'Meat', calPer100g: 203, gramsPerCup: null },
  { name: 'Chicken liver', category: 'Meat', calPer100g: 119, gramsPerCup: 140 },
  { name: 'Chicken (ground)', category: 'Meat', calPer100g: 143, gramsPerCup: null },
  { name: 'Duck breast', category: 'Meat', calPer100g: 132, gramsPerCup: null },
  { name: 'Goat meat', category: 'Meat', calPer100g: 109, gramsPerCup: null },
  { name: 'Lamb (leg)', category: 'Meat', calPer100g: 162, gramsPerCup: null },
  { name: 'Lamb (chop)', category: 'Meat', calPer100g: 232, gramsPerCup: null },
  { name: 'Lamb (ground)', category: 'Meat', calPer100g: 282, gramsPerCup: null },
  { name: 'Lamb (shoulder)', category: 'Meat', calPer100g: 206, gramsPerCup: null },
  { name: 'Pork (loin)', category: 'Meat', calPer100g: 143, gramsPerCup: null },
  { name: 'Pork (chop)', category: 'Meat', calPer100g: 172, gramsPerCup: null },
  { name: 'Pork (ground)', category: 'Meat', calPer100g: 263, gramsPerCup: null },
  { name: 'Pork (ribs)', category: 'Meat', calPer100g: 277, gramsPerCup: null },
  { name: 'Pork (tenderloin)', category: 'Meat', calPer100g: 120, gramsPerCup: null },
  { name: 'Pork belly', category: 'Meat', calPer100g: 518, gramsPerCup: null },
  { name: 'Rabbit', category: 'Meat', calPer100g: 136, gramsPerCup: null },
  { name: 'Turkey breast', category: 'Meat', calPer100g: 104, gramsPerCup: 140 },
  { name: 'Turkey (ground)', category: 'Meat', calPer100g: 148, gramsPerCup: null },
  { name: 'Veal', category: 'Meat', calPer100g: 144, gramsPerCup: null },
  { name: 'Venison', category: 'Meat', calPer100g: 120, gramsPerCup: null },

  // ═══════════════════════════════════════════
  // FISH & SEAFOOD (raw)
  // ═══════════════════════════════════════════
  { name: 'Salmon (Atlantic)', category: 'Seafood', calPer100g: 208, gramsPerCup: null },
  { name: 'Salmon (sockeye)', category: 'Seafood', calPer100g: 131, gramsPerCup: null },
  { name: 'Tuna (fresh)', category: 'Seafood', calPer100g: 132, gramsPerCup: null },
  { name: 'Cod', category: 'Seafood', calPer100g: 82, gramsPerCup: null },
  { name: 'Tilapia', category: 'Seafood', calPer100g: 96, gramsPerCup: null },
  { name: 'Halibut', category: 'Seafood', calPer100g: 91, gramsPerCup: null },
  { name: 'Sea bass', category: 'Seafood', calPer100g: 97, gramsPerCup: null },
  { name: 'Trout', category: 'Seafood', calPer100g: 148, gramsPerCup: null },
  { name: 'Sardines (fresh)', category: 'Seafood', calPer100g: 208, gramsPerCup: null },
  { name: 'Mackerel', category: 'Seafood', calPer100g: 205, gramsPerCup: null },
  { name: 'Swordfish', category: 'Seafood', calPer100g: 121, gramsPerCup: null },
  { name: 'Mahi-mahi', category: 'Seafood', calPer100g: 85, gramsPerCup: null },
  { name: 'Anchovies (fresh)', category: 'Seafood', calPer100g: 131, gramsPerCup: null },
  { name: 'Shrimp', category: 'Seafood', calPer100g: 85, gramsPerCup: 145 },
  { name: 'Crab meat', category: 'Seafood', calPer100g: 83, gramsPerCup: 135 },
  { name: 'Lobster', category: 'Seafood', calPer100g: 89, gramsPerCup: 145 },
  { name: 'Scallops', category: 'Seafood', calPer100g: 69, gramsPerCup: null },
  { name: 'Mussels', category: 'Seafood', calPer100g: 86, gramsPerCup: 150 },
  { name: 'Clams', category: 'Seafood', calPer100g: 86, gramsPerCup: null },
  { name: 'Oysters', category: 'Seafood', calPer100g: 68, gramsPerCup: null },
  { name: 'Squid (calamari)', category: 'Seafood', calPer100g: 92, gramsPerCup: null },
  { name: 'Octopus', category: 'Seafood', calPer100g: 82, gramsPerCup: null },

  // ═══════════════════════════════════════════
  // EGGS
  // ═══════════════════════════════════════════
  { name: 'Egg (whole)', category: 'Eggs', calPer100g: 155, gramsPerCup: 243 },
  { name: 'Egg white', category: 'Eggs', calPer100g: 52, gramsPerCup: 243 },
  { name: 'Egg yolk', category: 'Eggs', calPer100g: 322, gramsPerCup: 243 },
  { name: 'Quail egg', category: 'Eggs', calPer100g: 158, gramsPerCup: null },

  // ═══════════════════════════════════════════
  // DAIRY
  // ═══════════════════════════════════════════
  { name: 'Butter (salted)', category: 'Dairy', calPer100g: 717, gramsPerCup: 227 },
  { name: 'Butter (unsalted)', category: 'Dairy', calPer100g: 717, gramsPerCup: 227 },
  { name: 'Ghee', category: 'Dairy', calPer100g: 900, gramsPerCup: 205 },
  { name: 'Milk (whole)', category: 'Dairy', calPer100g: 61, gramsPerCup: 244 },
  { name: 'Milk (2%)', category: 'Dairy', calPer100g: 50, gramsPerCup: 244 },
  { name: 'Milk (1%)', category: 'Dairy', calPer100g: 42, gramsPerCup: 244 },
  { name: 'Milk (skim)', category: 'Dairy', calPer100g: 34, gramsPerCup: 245 },
  { name: 'Heavy cream', category: 'Dairy', calPer100g: 340, gramsPerCup: 238 },
  { name: 'Light cream', category: 'Dairy', calPer100g: 195, gramsPerCup: 240 },
  { name: 'Half and half', category: 'Dairy', calPer100g: 130, gramsPerCup: 242 },
  { name: 'Sour cream', category: 'Dairy', calPer100g: 198, gramsPerCup: 230 },
  { name: 'Cream cheese', category: 'Dairy', calPer100g: 342, gramsPerCup: 232 },
  { name: 'Yogurt (plain, whole)', category: 'Dairy', calPer100g: 61, gramsPerCup: 245 },
  { name: 'Yogurt (plain, low-fat)', category: 'Dairy', calPer100g: 56, gramsPerCup: 245 },
  { name: 'Yogurt (Greek, whole)', category: 'Dairy', calPer100g: 97, gramsPerCup: 245 },
  { name: 'Yogurt (Greek, 0%)', category: 'Dairy', calPer100g: 59, gramsPerCup: 245 },
  { name: 'Cottage cheese', category: 'Dairy', calPer100g: 98, gramsPerCup: 226 },
  { name: 'Ricotta (whole milk)', category: 'Dairy', calPer100g: 174, gramsPerCup: 246 },
  { name: 'Ricotta (part-skim)', category: 'Dairy', calPer100g: 138, gramsPerCup: 246 },
  { name: 'Mascarpone', category: 'Dairy', calPer100g: 429, gramsPerCup: 240 },
  { name: 'Condensed milk (sweetened)', category: 'Dairy', calPer100g: 321, gramsPerCup: 306 },
  { name: 'Evaporated milk', category: 'Dairy', calPer100g: 134, gramsPerCup: 252 },
  { name: 'Buttermilk', category: 'Dairy', calPer100g: 40, gramsPerCup: 245 },
  { name: 'Whipped cream', category: 'Dairy', calPer100g: 257, gramsPerCup: 60 },
  { name: 'Crème fraîche', category: 'Dairy', calPer100g: 292, gramsPerCup: 232 },

  // ═══════════════════════════════════════════
  // CHEESES
  // ═══════════════════════════════════════════
  { name: 'Cheddar', category: 'Cheese', calPer100g: 403, gramsPerCup: 113 },
  { name: 'Mozzarella (fresh)', category: 'Cheese', calPer100g: 280, gramsPerCup: 113 },
  { name: 'Mozzarella (low-moisture)', category: 'Cheese', calPer100g: 318, gramsPerCup: 113 },
  { name: 'Parmesan', category: 'Cheese', calPer100g: 431, gramsPerCup: 100 },
  { name: 'Swiss', category: 'Cheese', calPer100g: 380, gramsPerCup: 108 },
  { name: 'Gruyère', category: 'Cheese', calPer100g: 413, gramsPerCup: 108 },
  { name: 'Brie', category: 'Cheese', calPer100g: 334, gramsPerCup: null },
  { name: 'Camembert', category: 'Cheese', calPer100g: 300, gramsPerCup: null },
  { name: 'Gouda', category: 'Cheese', calPer100g: 356, gramsPerCup: 108 },
  { name: 'Provolone', category: 'Cheese', calPer100g: 351, gramsPerCup: 113 },
  { name: 'Goat cheese (soft)', category: 'Cheese', calPer100g: 364, gramsPerCup: 113 },
  { name: 'Feta', category: 'Cheese', calPer100g: 264, gramsPerCup: 150 },
  { name: 'Blue cheese', category: 'Cheese', calPer100g: 353, gramsPerCup: 135 },
  { name: 'Monterey Jack', category: 'Cheese', calPer100g: 373, gramsPerCup: 113 },
  { name: 'Colby', category: 'Cheese', calPer100g: 394, gramsPerCup: 113 },
  { name: 'Emmental', category: 'Cheese', calPer100g: 380, gramsPerCup: 108 },
  { name: 'Havarti', category: 'Cheese', calPer100g: 371, gramsPerCup: null },
  { name: 'Manchego', category: 'Cheese', calPer100g: 376, gramsPerCup: null },
  { name: 'Pecorino Romano', category: 'Cheese', calPer100g: 387, gramsPerCup: 100 },
  { name: 'Halloumi', category: 'Cheese', calPer100g: 321, gramsPerCup: null },
  { name: 'Paneer', category: 'Cheese', calPer100g: 265, gramsPerCup: null },
  { name: 'Burrata', category: 'Cheese', calPer100g: 233, gramsPerCup: null },
  { name: 'Queso fresco', category: 'Cheese', calPer100g: 299, gramsPerCup: null },

  // ═══════════════════════════════════════════
  // GRAINS & LEGUMES (dry/raw)
  // ═══════════════════════════════════════════
  { name: 'Rice (white, raw)', category: 'Grains', calPer100g: 365, gramsPerCup: 185 },
  { name: 'Rice (brown, raw)', category: 'Grains', calPer100g: 370, gramsPerCup: 185 },
  { name: 'Rice (basmati, raw)', category: 'Grains', calPer100g: 360, gramsPerCup: 185 },
  { name: 'Rice (jasmine, raw)', category: 'Grains', calPer100g: 365, gramsPerCup: 185 },
  { name: 'Rice (wild, raw)', category: 'Grains', calPer100g: 357, gramsPerCup: 160 },
  { name: 'Quinoa (raw)', category: 'Grains', calPer100g: 368, gramsPerCup: 170 },
  { name: 'Oats (rolled)', category: 'Grains', calPer100g: 389, gramsPerCup: 81 },
  { name: 'Oats (steel-cut)', category: 'Grains', calPer100g: 379, gramsPerCup: 160 },
  { name: 'Couscous (raw)', category: 'Grains', calPer100g: 376, gramsPerCup: 173 },
  { name: 'Bulgur (raw)', category: 'Grains', calPer100g: 342, gramsPerCup: 140 },
  { name: 'Barley (raw)', category: 'Grains', calPer100g: 354, gramsPerCup: 184 },
  { name: 'Polenta / cornmeal', category: 'Grains', calPer100g: 362, gramsPerCup: 157 },
  { name: 'Buckwheat (raw)', category: 'Grains', calPer100g: 343, gramsPerCup: 170 },
  { name: 'Millet (raw)', category: 'Grains', calPer100g: 378, gramsPerCup: 200 },
  { name: 'Pasta (dry)', category: 'Grains', calPer100g: 371, gramsPerCup: 105 },
  { name: 'Bread (white)', category: 'Grains', calPer100g: 265, gramsPerCup: null },
  { name: 'Bread (whole wheat)', category: 'Grains', calPer100g: 247, gramsPerCup: null },
  { name: 'Flour (all-purpose)', category: 'Grains', calPer100g: 364, gramsPerCup: 125 },
  { name: 'Flour (whole wheat)', category: 'Grains', calPer100g: 340, gramsPerCup: 120 },
  { name: 'Flour (almond)', category: 'Grains', calPer100g: 571, gramsPerCup: 96 },
  { name: 'Flour (coconut)', category: 'Grains', calPer100g: 400, gramsPerCup: 112 },
  { name: 'Cornstarch', category: 'Grains', calPer100g: 381, gramsPerCup: 128 },
  { name: 'Breadcrumbs', category: 'Grains', calPer100g: 395, gramsPerCup: 108 },
  { name: 'Lentils (raw)', category: 'Legumes', calPer100g: 352, gramsPerCup: 192 },
  { name: 'Chickpeas (raw)', category: 'Legumes', calPer100g: 364, gramsPerCup: 200 },
  { name: 'Black beans (raw)', category: 'Legumes', calPer100g: 341, gramsPerCup: 194 },
  { name: 'Kidney beans (raw)', category: 'Legumes', calPer100g: 333, gramsPerCup: 184 },
  { name: 'Navy beans (raw)', category: 'Legumes', calPer100g: 337, gramsPerCup: 208 },
  { name: 'Pinto beans (raw)', category: 'Legumes', calPer100g: 347, gramsPerCup: 193 },
  { name: 'Lima beans (raw)', category: 'Legumes', calPer100g: 338, gramsPerCup: 178 },
  { name: 'Edamame (shelled)', category: 'Legumes', calPer100g: 122, gramsPerCup: 155 },
  { name: 'Tofu (firm)', category: 'Legumes', calPer100g: 144, gramsPerCup: 252 },
  { name: 'Tofu (silken)', category: 'Legumes', calPer100g: 55, gramsPerCup: 248 },
  { name: 'Tempeh', category: 'Legumes', calPer100g: 192, gramsPerCup: 166 },

  // ═══════════════════════════════════════════
  // OILS & FATS
  // ═══════════════════════════════════════════
  { name: 'Olive oil', category: 'Oils', calPer100g: 884, gramsPerCup: 216 },
  { name: 'Coconut oil', category: 'Oils', calPer100g: 862, gramsPerCup: 218 },
  { name: 'Vegetable oil', category: 'Oils', calPer100g: 884, gramsPerCup: 218 },
  { name: 'Canola oil', category: 'Oils', calPer100g: 884, gramsPerCup: 218 },
  { name: 'Sesame oil', category: 'Oils', calPer100g: 884, gramsPerCup: 218 },
  { name: 'Avocado oil', category: 'Oils', calPer100g: 884, gramsPerCup: 218 },
  { name: 'Lard', category: 'Oils', calPer100g: 902, gramsPerCup: 205 },

  // ═══════════════════════════════════════════
  // SWEETENERS & BAKING
  // ═══════════════════════════════════════════
  { name: 'Sugar (white)', category: 'Sweeteners', calPer100g: 387, gramsPerCup: 200 },
  { name: 'Sugar (brown)', category: 'Sweeteners', calPer100g: 380, gramsPerCup: 220 },
  { name: 'Sugar (powdered)', category: 'Sweeteners', calPer100g: 389, gramsPerCup: 120 },
  { name: 'Honey', category: 'Sweeteners', calPer100g: 304, gramsPerCup: 340 },
  { name: 'Maple syrup', category: 'Sweeteners', calPer100g: 260, gramsPerCup: 315 },
  { name: 'Agave nectar', category: 'Sweeteners', calPer100g: 310, gramsPerCup: 336 },
  { name: 'Molasses', category: 'Sweeteners', calPer100g: 290, gramsPerCup: 337 },
  { name: 'Cocoa powder (unsweetened)', category: 'Sweeteners', calPer100g: 228, gramsPerCup: 86 },
  { name: 'Dark chocolate (70-85%)', category: 'Sweeteners', calPer100g: 598, gramsPerCup: 132 },
  { name: 'Vanilla extract', category: 'Sweeteners', calPer100g: 288, gramsPerCup: 208 },
  { name: 'Baking powder', category: 'Sweeteners', calPer100g: 53, gramsPerCup: 230 },
  { name: 'Baking soda', category: 'Sweeteners', calPer100g: 0, gramsPerCup: 220 },

  // ═══════════════════════════════════════════
  // CONDIMENTS & SAUCES
  // ═══════════════════════════════════════════
  { name: 'Soy sauce', category: 'Condiments', calPer100g: 53, gramsPerCup: 255 },
  { name: 'Fish sauce', category: 'Condiments', calPer100g: 35, gramsPerCup: 240 },
  { name: 'Vinegar (white)', category: 'Condiments', calPer100g: 18, gramsPerCup: 240 },
  { name: 'Vinegar (apple cider)', category: 'Condiments', calPer100g: 21, gramsPerCup: 240 },
  { name: 'Vinegar (balsamic)', category: 'Condiments', calPer100g: 88, gramsPerCup: 255 },
  { name: 'Lemon juice', category: 'Condiments', calPer100g: 22, gramsPerCup: 244 },
  { name: 'Lime juice', category: 'Condiments', calPer100g: 25, gramsPerCup: 246 },
  { name: 'Tomato paste', category: 'Condiments', calPer100g: 82, gramsPerCup: 262 },
  { name: 'Coconut milk (canned)', category: 'Condiments', calPer100g: 197, gramsPerCup: 226 },
  { name: 'Coconut cream', category: 'Condiments', calPer100g: 330, gramsPerCup: 240 },
  { name: 'Tahini', category: 'Condiments', calPer100g: 595, gramsPerCup: 240 },
  { name: 'Peanut butter', category: 'Condiments', calPer100g: 588, gramsPerCup: 258 },
  { name: 'Almond butter', category: 'Condiments', calPer100g: 614, gramsPerCup: 250 },
  { name: 'Mustard (Dijon)', category: 'Condiments', calPer100g: 66, gramsPerCup: 249 },
  { name: 'Miso paste', category: 'Condiments', calPer100g: 199, gramsPerCup: 275 },
  { name: 'Hot sauce', category: 'Condiments', calPer100g: 11, gramsPerCup: null },
  { name: 'Worcestershire sauce', category: 'Condiments', calPer100g: 78, gramsPerCup: 253 },
];
