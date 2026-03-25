import { useMemo } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { useI18n } from '@/lib/i18n-context';
import { Clock, Users, ChefHat } from 'lucide-react';

interface GeneratedRecipe {
  id: string;
  title: string;
  readyInMinutes: number;
  servings: number;
  usedIngredients: string[];
  missedIngredients: string[];
}

const RECIPE_TEMPLATES: { title: string; minutes: number; servings: number; keywords: string[]; missing: string[] }[] = [
  { title: 'Quick Stir-Fry', minutes: 20, servings: 3, keywords: ['chicken', 'meat', 'vegetable', 'spinach', 'pepper'], missing: ['Soy Sauce', 'Garlic'] },
  { title: 'Smoothie Bowl', minutes: 5, servings: 1, keywords: ['milk', 'yogurt', 'berry', 'fruit', 'banana'], missing: ['Granola', 'Honey'] },
  { title: 'Toast & Eggs', minutes: 10, servings: 2, keywords: ['bread', 'egg', 'avocado', 'cheese'], missing: [] },
  { title: 'Fresh Salad', minutes: 10, servings: 2, keywords: ['spinach', 'lettuce', 'tomato', 'cucumber', 'produce'], missing: ['Dressing', 'Croutons'] },
  { title: 'Cheesy Omelette', minutes: 15, servings: 2, keywords: ['egg', 'cheese', 'pepper', 'mushroom'], missing: ['Herbs'] },
  { title: 'Pasta with Veggies', minutes: 25, servings: 4, keywords: ['tomato', 'pepper', 'spinach', 'cheese'], missing: ['Pasta', 'Olive Oil'] },
  { title: 'Fruit Yogurt Parfait', minutes: 5, servings: 1, keywords: ['yogurt', 'berry', 'fruit'], missing: ['Granola'] },
  { title: 'Grilled Sandwich', minutes: 15, servings: 2, keywords: ['bread', 'cheese', 'meat', 'chicken'], missing: ['Butter'] },
];

export default function Recipes() {
  const { items } = useFridge();
  const { t } = useI18n();

  const recipes = useMemo<GeneratedRecipe[]>(() => {
    if (!items.length) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const validItems = items.filter(i => new Date(i.expiryDate) >= now);
    if (!validItems.length) return [];

    const expiringFirst = [...validItems].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

    const matched: GeneratedRecipe[] = [];

    for (const template of RECIPE_TEMPLATES) {
      const used = expiringFirst.filter(item =>
        template.keywords.some(kw =>
          item.name.toLowerCase().includes(kw) || item.category.toLowerCase().includes(kw)
        )
      );
      if (used.length > 0) {
        matched.push({
          id: template.title,
          title: template.title,
          readyInMinutes: template.minutes,
          servings: template.servings,
          usedIngredients: used.map(i => i.name),
          missedIngredients: template.missing,
        });
      }
    }

    return matched.slice(0, 6);
  }, [items]);

  if (!items.length) {
    return (
      <div className="space-y-6">
        <div className="fade-in-up">
          <h2 className="font-display text-2xl font-semibold">{t('recipeSuggestions')}</h2>
          <p className="text-muted-foreground">{t('useUpItems')}</p>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          <p className="text-lg">🍳</p>
          <p className="mt-2">{t('addItemsRecipes')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">{t('recipeSuggestions')}</h2>
        <p className="text-muted-foreground">{t('recipeDesc')}</p>
      </div>

      <div className="space-y-4">
        {recipes.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
            <p>{t('noRecipeMatch')}</p>
          </div>
        )}
        {recipes.map((recipe, i) => (
          <div
            key={recipe.id}
            className="stagger-child rounded-xl border bg-card p-4 shadow-sm space-y-3"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{recipe.title}</h3>
                <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {recipe.readyInMinutes}{t('minutes')}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {recipe.servings} {t('servings')}</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                {recipe.usedIngredients.map(ing => (
                  <span key={ing} className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                    ✓ {ing}
                  </span>
                ))}
                {recipe.missedIngredients.map(ing => (
                  <span key={ing} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    + {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
