import { useMemo } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { useI18n } from '@/lib/i18n-context';
import { Leaf, Flame, TrendingUp } from 'lucide-react';
import { SustainabilityTier } from '@/lib/types';

const tierConfig: Record<SustainabilityTier, { emoji: string; next: string | null; threshold: number }> = {
  bronze: { emoji: '🥉', next: 'Silver', threshold: 50 },
  silver: { emoji: '🥈', next: 'Gold', threshold: 80 },
  gold: { emoji: '🥇', next: null, threshold: 100 },
};

export default function Sustainability() {
  const { items } = useFridge();
  const { t } = useI18n();

  const data = useMemo(() => {
    if (!items.length) return null;

    const totalConsumed = items.reduce((sum, i) => sum + i.consumed, 0);
    const avgConsumed = totalConsumed / items.length;
    const wastePercentage = Math.round(100 - avgConsumed);
    const score = Math.round(avgConsumed);
    const tier: SustainabilityTier = score >= 80 ? 'gold' : score >= 50 ? 'silver' : 'bronze';
    const itemsSaved = items.filter(i => i.consumed >= 80).length;

    const uniqueDates = [...new Set(items.map(i => i.addedDate))].sort().reverse();
    let streakDays = 0;
    const todayDate = new Date();
    for (let d = 0; d < uniqueDates.length; d++) {
      const expected = new Date(todayDate);
      expected.setDate(expected.getDate() - d);
      if (uniqueDates[d] === expected.toISOString().split('T')[0]) {
        streakDays++;
      } else break;
    }

    return { score, tier, wastePercentage, itemsSaved, streakDays: Math.max(streakDays, 1) };
  }, [items]);

  const tips = useMemo(() => {
    if (!items.length) return [];
    const today = new Date();
    const expiringSoon = items.filter(i => {
      const exp = new Date(i.expiryDate);
      const diff = (exp.getTime() - today.getTime()) / 86400000;
      return diff <= 3 && diff >= 0;
    });

    const tips: { icon: string; tip: string }[] = [];
    expiringSoon.forEach(i => {
      tips.push({ icon: '⚡', tip: t('useSoon').replace('{name}', i.name).replace('{date}', i.expiryDate) });
    });
    if (tips.length === 0) {
      tips.push({ icon: '✅', tip: t('nothingExpiring') });
    }
    tips.push({ icon: '📋', tip: t('planMeals') });
    return tips.slice(0, 4);
  }, [items, t]);

  if (!items.length) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="fade-in-up">
          <h2 className="font-display text-2xl font-semibold">{t('sustainabilityScore')}</h2>
          <p className="text-muted-foreground">{t('ecoJourney')}</p>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          <p className="text-lg">🌱</p>
          <p className="mt-2">{t('addItemsSustain')}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const tier = tierConfig[data.tier];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">{t('sustainabilityScore')}</h2>
        <p className="text-muted-foreground">{t('ecoJourney')}</p>
      </div>

      <div className="fade-in-up-delay-1 flex flex-col items-center rounded-xl border bg-card p-8 shadow-sm">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="absolute inset-0" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="62" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <circle
              cx="72" cy="72" r="62"
              fill="none" stroke="hsl(var(--primary))" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(data.score / 100) * 390} 390`}
              transform="rotate(-90 72 72)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            <span className="text-3xl">{tier.emoji}</span>
            <p className="text-2xl font-bold tabular-nums">{data.score}</p>
          </div>
        </div>
        <p className="mt-3 font-display text-lg font-semibold capitalize">{data.tier} {t('tier')}</p>
        {tier.next && (
          <p className="text-sm text-muted-foreground">
            {tier.threshold - data.score} {t('pointsTo')} {tier.next}
          </p>
        )}
      </div>

      <div className="fade-in-up-delay-2 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm">
          <Leaf className="h-5 w-5 text-success mb-1" />
          <p className="text-xl font-semibold tabular-nums">{data.itemsSaved}</p>
          <p className="text-[11px] text-muted-foreground text-center">{t('itemsSaved')}</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm">
          <Flame className="h-5 w-5 text-accent mb-1" />
          <p className="text-xl font-semibold tabular-nums">{data.streakDays}</p>
          <p className="text-[11px] text-muted-foreground text-center">{t('dayStreak')}</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm">
          <TrendingUp className="h-5 w-5 text-info mb-1" />
          <p className="text-xl font-semibold tabular-nums">{100 - data.wastePercentage}%</p>
          <p className="text-[11px] text-muted-foreground text-center">{t('efficiency')}</p>
        </div>
      </div>

      <div className="fade-in-up-delay-3 space-y-3">
        <h3 className="font-display text-lg font-semibold">{t('tipsToLevel')}</h3>
        {tips.map(({ icon, tip }) => (
          <div key={tip} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
            <span className="text-lg">{icon}</span>
            <p className="text-sm">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
