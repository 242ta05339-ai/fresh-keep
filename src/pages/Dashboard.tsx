import { useMemo } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { useI18n } from '@/lib/i18n-context';
import FoodItemCard from '@/components/FoodItemCard';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { computeSustainability } from '@/lib/sustainability';

const TIER_EMOJI: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇' };

export default function Dashboard() {
  const { items, removeItem, markConsumed } = useFridge();
  const { t } = useI18n();

  const sortedItems = [...items].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const expiringCount = sortedItems.filter(i => {
    const days = Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 3;
  }).length;

  const sustainability = useMemo(() => computeSustainability(items), [items]);

  return (
    <div className="space-y-6">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">{t('goodMorning')}</h2>
        <p className="text-muted-foreground">{t('fridgeToday')}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 fade-in-up-delay-1 sm:gap-3">
        <div className="min-w-0 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          <Package className="mb-1 h-4 w-4 text-primary sm:h-5 sm:w-5" />
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">{items.length}</p>
          <p className="text-[11px] leading-tight text-muted-foreground sm:text-xs">{t('totalItems')}</p>
        </div>
        <div className="min-w-0 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          <AlertTriangle className="mb-1 h-4 w-4 text-warning sm:h-5 sm:w-5" />
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">{expiringCount}</p>
          <p className="text-[11px] leading-tight text-muted-foreground sm:text-xs">{t('expiringSoon')}</p>
        </div>
        <div className="min-w-0 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          <TrendingDown className="mb-1 h-4 w-4 text-success sm:h-5 sm:w-5" />
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">{sustainability.wastePercentage}%</p>
          <p className="text-[11px] leading-tight text-muted-foreground sm:text-xs">{t('wasteRate')}</p>
        </div>
      </div>

      <div className="fade-in-up-delay-2 flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl sm:h-12 sm:w-12">
          {TIER_EMOJI[sustainability.tier] || '🥉'}
        </div>
        <div className="min-w-0">
          <p className="break-words text-sm font-medium capitalize sm:text-base">{sustainability.tier} {t('tier')} — {sustainability.score}/100</p>
          <p className="text-sm text-muted-foreground">
            {sustainability.streakDays}-{t('dayStreak')} · {sustainability.itemsSaved} {t('itemsSaved')}
          </p>
        </div>
      </div>

      <div className="fade-in-up-delay-3 space-y-2">
        <h3 className="font-display text-lg font-semibold">{t('yourFridge')}</h3>
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
