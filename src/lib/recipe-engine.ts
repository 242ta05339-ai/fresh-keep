import { FoodItem, FoodCategory } from './types';

export interface DynamicRecipe {
  id: string;
  titleKey: string;
  descKey: string;
  readyInMinutes: number;
  servings: number;
  usedIngredients: string[];
  missedIngredients: string[];
  priority: number; // higher = more urgent (expiring sooner)
}

interface RecipeRule {
  titleKey: string;
  descKey: string;
  minutes: number;
  servings: number;
  requiredCategories?: FoodCategory[];
  requiredKeywords?: string[];
  optionalKeywords?: string[];
  minMatch: number;
  missing: string[];
}

const RECIPE_RULES: RecipeRule[] = [
  // Dairy-based
  { titleKey: 'recipe_paneerBhurji', descKey: 'recipe_paneerBhurjiDesc', minutes: 15, servings: 2, requiredKeywords: ['paneer', 'cheese'], optionalKeywords: ['tomato', 'onion', 'pepper'], minMatch: 1, missing: ['Spices'] },
  { titleKey: 'recipe_smoothie', descKey: 'recipe_smoothieDesc', minutes: 5, servings: 1, requiredKeywords: ['milk', 'yogurt', 'curd', 'दूध', 'दही'], optionalKeywords: ['banana', 'fruit', 'berry'], minMatch: 1, missing: ['Honey'] },
  { titleKey: 'recipe_lassi', descKey: 'recipe_lassiDesc', minutes: 5, servings: 2, requiredKeywords: ['yogurt', 'curd', 'दही'], minMatch: 1, missing: ['Sugar', 'Cardamom'] },

  // Egg-based
  { titleKey: 'recipe_omelette', descKey: 'recipe_omeletteDesc', minutes: 10, servings: 2, requiredKeywords: ['egg', 'eggs', 'अंडा'], optionalKeywords: ['cheese', 'onion', 'pepper', 'tomato'], minMatch: 1, missing: ['Herbs'] },
  { titleKey: 'recipe_eggCurry', descKey: 'recipe_eggCurryDesc', minutes: 25, servings: 3, requiredKeywords: ['egg', 'eggs', 'अंडा'], optionalKeywords: ['onion', 'tomato'], minMatch: 1, missing: ['Spices', 'Oil'] },
  { titleKey: 'recipe_frenchToast', descKey: 'recipe_frenchToastDesc', minutes: 15, servings: 2, requiredKeywords: ['egg', 'bread'], minMatch: 2, missing: ['Cinnamon', 'Butter'] },

  // Meat-based
  { titleKey: 'recipe_chickenCurry', descKey: 'recipe_chickenCurryDesc', minutes: 40, servings: 4, requiredKeywords: ['chicken', 'चिकन'], optionalKeywords: ['onion', 'tomato'], minMatch: 1, missing: ['Spices', 'Oil'] },
  { titleKey: 'recipe_stirFry', descKey: 'recipe_stirFryDesc', minutes: 20, servings: 3, requiredKeywords: ['chicken', 'meat', 'मांस'], optionalKeywords: ['vegetable', 'pepper', 'carrot'], minMatch: 1, missing: ['Soy Sauce', 'Garlic'] },
  { titleKey: 'recipe_fishFry', descKey: 'recipe_fishFryDesc', minutes: 20, servings: 2, requiredKeywords: ['fish', 'मछली'], minMatch: 1, missing: ['Lemon', 'Spices'] },

  // Produce-based
  { titleKey: 'recipe_salad', descKey: 'recipe_saladDesc', minutes: 10, servings: 2, requiredCategories: ['produce'], requiredKeywords: ['spinach', 'lettuce', 'tomato', 'cucumber', 'carrot', 'सब्जी'], minMatch: 1, missing: ['Dressing'] },
  { titleKey: 'recipe_vegCurry', descKey: 'recipe_vegCurryDesc', minutes: 30, servings: 3, requiredCategories: ['produce'], requiredKeywords: ['potato', 'onion', 'tomato', 'आलू', 'प्याज', 'टमाटर', 'spinach', 'carrot'], minMatch: 2, missing: ['Spices', 'Oil'] },
  { titleKey: 'recipe_aloo', descKey: 'recipe_alooDesc', minutes: 25, servings: 3, requiredKeywords: ['potato', 'आलू'], optionalKeywords: ['onion', 'tomato'], minMatch: 1, missing: ['Cumin', 'Turmeric'] },

  // Grain-based
  { titleKey: 'recipe_sandwich', descKey: 'recipe_sandwichDesc', minutes: 10, servings: 2, requiredKeywords: ['bread', 'रोटी'], optionalKeywords: ['cheese', 'chicken', 'egg', 'tomato'], minMatch: 1, missing: ['Butter'] },
  { titleKey: 'recipe_friedRice', descKey: 'recipe_friedRiceDesc', minutes: 20, servings: 3, requiredKeywords: ['rice', 'चावल'], optionalKeywords: ['egg', 'vegetable', 'carrot', 'onion'], minMatch: 1, missing: ['Soy Sauce', 'Oil'] },
  { titleKey: 'recipe_rotiSabzi', descKey: 'recipe_rotiSabziDesc', minutes: 30, servings: 3, requiredKeywords: ['flour', 'atta', 'आटा'], optionalKeywords: ['potato', 'onion', 'spinach'], minMatch: 1, missing: ['Oil', 'Spices'] },

  // Beverage-based
  { titleKey: 'recipe_fruitJuice', descKey: 'recipe_fruitJuiceDesc', minutes: 5, servings: 2, requiredKeywords: ['juice', 'fruit', 'फल', 'जूस'], optionalKeywords: ['banana', 'apple'], minMatch: 1, missing: ['Ice'] },

  // Snack-based
  { titleKey: 'recipe_nachos', descKey: 'recipe_nachosDesc', minutes: 10, servings: 2, requiredKeywords: ['chips', 'cheese'], minMatch: 2, missing: ['Salsa'] },

  // Generic combos
  { titleKey: 'recipe_pasta', descKey: 'recipe_pastaDesc', minutes: 25, servings: 4, requiredKeywords: ['tomato', 'cheese', 'टमाटर'], optionalKeywords: ['spinach', 'pepper', 'chicken'], minMatch: 1, missing: ['Pasta', 'Olive Oil'] },
  { titleKey: 'recipe_dalRice', descKey: 'recipe_dalRiceDesc', minutes: 30, servings: 3, requiredKeywords: ['rice', 'चावल'], minMatch: 1, missing: ['Dal/Lentils', 'Turmeric'] },
];

export function generateRecipes(items: FoodItem[]): DynamicRecipe[] {
  if (!items.length) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Only non-expired items
  const validItems = items.filter(i => new Date(i.expiryDate) >= now && i.consumed < 100);
  if (!validItems.length) return [];

  const matched: DynamicRecipe[] = [];

  for (const rule of RECIPE_RULES) {
    const allKeywords = [...(rule.requiredKeywords || []), ...(rule.optionalKeywords || [])];

    const used = validItems.filter(item => {
      const lower = item.name.toLowerCase();
      const catMatch = rule.requiredCategories?.includes(item.category as FoodCategory);
      const kwMatch = allKeywords.some(kw => lower.includes(kw) || item.category.toLowerCase().includes(kw));
      return catMatch || kwMatch;
    });

    if (used.length >= rule.minMatch) {
      // Priority: average days until expiry (lower = more urgent = higher priority)
      const avgDays = used.reduce((sum, item) => {
        const diff = (new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0) / used.length;

      matched.push({
        id: rule.titleKey,
        titleKey: rule.titleKey,
        descKey: rule.descKey,
        readyInMinutes: rule.minutes,
        servings: rule.servings,
        usedIngredients: [...new Set(used.map(i => i.name))],
        missedIngredients: rule.missing,
        priority: 100 - avgDays, // higher priority for sooner expiry
      });
    }
  }

  // Sort by priority (most urgent first), take top 8
  matched.sort((a, b) => b.priority - a.priority);
  return matched.slice(0, 8);
}
