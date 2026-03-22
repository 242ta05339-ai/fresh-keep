import { mockRecipes } from '@/lib/mock-data';
import { Clock, Users, ChefHat } from 'lucide-react';

export default function Recipes() {
  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">Recipe Suggestions</h2>
        <p className="text-muted-foreground">Use up items before they expire.</p>
      </div>

      <div className="space-y-4">
        {mockRecipes.map((recipe, i) => (
          <div
            key={recipe.id}
            className="stagger-child rounded-xl border bg-card p-4 shadow-sm space-y-3"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{recipe.title}</h3>
                <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {recipe.readyInMinutes}m</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {recipe.servings} servings</span>
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
