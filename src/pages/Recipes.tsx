import { useMemo } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { useI18n } from '@/lib/i18n-context';
import { generateRecipes } from '@/lib/recipe-engine';
import { Clock, Users, ChefHat, Flame } from 'lucide-react';

export default function Recipes() {
  const { items } = useFridge();
  const { t } = useI18n();

  const recipes = useMemo(() => generateRecipes(items), [items]);

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
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{t(recipe.titleKey as any)}</h3>
                  {recipe.priority > 90 && (
                    <span className="flex items-center gap-0.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      <Flame className="h-3 w-3" /> {t('expiringSoon')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{t(recipe.descKey as any)}</p>
                <div className="flex gap-3 mt-1.5 text-sm text-muted-foreground">
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
