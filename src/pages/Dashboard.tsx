import { useMemo } from 'react';
import { useFridge } from '@/lib/fridge-context';
import FoodItemCard from '@/components/FoodItemCard';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { computeSustainability } from '@/lib/sustainability';

const TIER_EMOJI: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇' };

export default function Dashboard() {
  const { items, removeItem, markConsumed } = useFridge();

  const sortedItems = [...items].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const expiringCount = sortedItems.filter(i => {
    const days = Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 3;
  }).length;

  const sustainability = useMemo(() => computeSustainability(items), [items]);

  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">Good morning 👋</h2>
        <p className="text-muted-foreground">Here's what's in your fridge today.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 fade-in-up-delay-1">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <Package className="h-5 w-5 text-primary mb-1" />
          <p className="text-2xl font-semibold tabular-nums">{items.length}</p>
          <p className="text-xs text-muted-foreground">Total items</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-warning mb-1" />
          <p className="text-2xl font-semibold tabular-nums">{expiringCount}</p>
          <p className="text-xs text-muted-foreground">Expiring soon</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TrendingDown className="h-5 w-5 text-success mb-1" />
          <p className="text-2xl font-semibold tabular-nums">{sustainability.wastePercentage}%</p>
          <p className="text-xs text-muted-foreground">Waste rate</p>
        </div>
      </div>

      <div className="fade-in-up-delay-2 flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-2xl">
          {TIER_EMOJI[sustainability.tier] || '🥉'}
        </div>
        <div>
          <p className="font-medium capitalize">{sustainability.tier} Tier — {sustainability.score}/100</p>
          <p className="text-sm text-muted-foreground">
            {sustainability.streakDays}-day streak · {sustainability.itemsSaved} items saved
          </p>
        </div>
      </div>

      <div className="fade-in-up-delay-3 space-y-2">
        <h3 className="font-display text-lg font-semibold">Your Fridge</h3>
        <div className="space-y-2">
          {sortedItems.map((item, i) => (
            <FoodItemCard
              key={item.id}
              item={item}
              onRemove={removeItem}
              onConsume={markConsumed}
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
