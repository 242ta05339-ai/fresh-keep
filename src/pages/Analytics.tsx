import { useMemo } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { useI18n } from '@/lib/i18n-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--info))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function Analytics() {
  const { items } = useFridge();
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const stats = useMemo(() => {
    if (!items.length) return null;

    const mostConsumed = [...items]
      .sort((a, b) => b.consumed - a.consumed)
      .slice(0, 5)
      .map(i => ({ name: i.name, count: i.consumed }));

    const today = new Date().toISOString().split('T')[0];
    const wastedItems = items
      .map(i => ({
        name: i.name,
        percentage: i.expiryDate <= today ? Math.max(100 - i.consumed, 10) : 100 - i.consumed,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    const catSpend: Record<string, { spent: number; wasted: number }> = {};
    items.forEach(i => {
      const cat = i.category;
      if (!catSpend[cat]) catSpend[cat] = { spent: 0, wasted: 0 };
      const cost = i.cost ?? 0;
      catSpend[cat].spent += cost;
      catSpend[cat].wasted += cost * ((100 - i.consumed) / 100);
    });
    const monthlySpending = Object.entries(catSpend).map(([cat, v]) => ({
      month: cat.charAt(0).toUpperCase() + cat.slice(1),
      spent: Math.round(v.spent * 100) / 100,
      wasted: Math.round(v.wasted * 100) / 100,
    }));

    const purchaseFrequency = items.slice(0, 5).map(i => {
      const addedDate = new Date(i.addedDate);
      const expiryDate = new Date(i.expiryDate);
      const shelfDays = Math.max(1, Math.round((expiryDate.getTime() - addedDate.getTime()) / 86400000));
      return {
        item: i.name,
        avgDays: shelfDays,
        wastePercent: Math.round(100 - i.consumed),
      };
    });

    return { mostConsumed, mostWasted: wastedItems, monthlySpending, purchaseFrequency };
  }, [items]);

  if (!items.length) {
    return (
      <div className="space-y-6">
        <div className="fade-in-up">
          <h2 className="font-display text-2xl font-semibold">{t('analytics')}</h2>
          <p className="text-muted-foreground">{t('understand')}</p>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          <p className="text-lg">📊</p>
          <p className="mt-2">{t('addItemsAnalytics')}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { mostConsumed, mostWasted, monthlySpending, purchaseFrequency } = stats;

  return (
    <div className="space-y-7 sm:space-y-8">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">{t('analytics')}</h2>
        <p className="text-muted-foreground">{t('understand')}</p>
      </div>

      <section className="fade-in-up-delay-1 min-w-0 space-y-3">
        <h3 className="font-display text-lg font-semibold">{t('spendingVsWaste')}</h3>
        <div className="overflow-hidden rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {[
              { key: 'spent' as const, label: t('spent') },
              { key: 'wasted' as const, label: t('wasted') },
            ].map(({ key, label }) => (
              <div key={key} className="min-w-0 rounded-lg border bg-background/60 p-2 sm:p-3">
                <p className="px-1 text-sm font-semibold">{label}</p>
                <ResponsiveContainer width="100%" height={isMobile ? 190 : 230}>
                  <PieChart>
                    <Pie
                      data={monthlySpending}
                      dataKey={key}
                      nameKey="month"
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 42 : 52}
                      outerRadius={isMobile ? 68 : 82}
                      paddingAngle={2}
                      label={false}
                    >
                      {monthlySpending.map((_, i) => (
                        <Cell key={`${key}-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value}`} />
                    <Legend verticalAlign="bottom" height={32} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 border-t pt-3">
            {monthlySpending.map((category, i) => (
              <span key={category.month} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="max-w-28 truncate">{category.month}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="fade-in-up-delay-2 min-w-0 space-y-3">
        <h3 className="font-display text-lg font-semibold">{t('mostConsumed')}</h3>
        <div className="overflow-hidden rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 240}>
            <BarChart data={mostConsumed} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={isMobile ? 68 : 90} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name={t('consume')}>
                {mostConsumed.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="fade-in-up-delay-3 space-y-3">
        <h3 className="font-display text-lg font-semibold">{t('highestWaste')}</h3>
        <div className="space-y-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          {mostWasted.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="w-20 shrink-0 truncate text-sm font-medium">{item.name}</span>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums w-10 text-right">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">{t('itemInsights')}</h3>
        <div className="space-y-2">
          {purchaseFrequency.map(pf => (
            <div key={pf.item} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3 shadow-sm sm:items-center">
              <div className="min-w-0">
                <p className="font-medium">{pf.item}</p>
                <p className="text-xs text-muted-foreground">{t('shelfLife')}: ~{pf.avgDays} {t('daysLeft')}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-semibold ${pf.wastePercent > 20 ? 'text-destructive' : 'text-success'}`}>
                  {pf.wastePercent}% {t('unused')}
                </p>
                {pf.wastePercent > 20 && (
                  <p className="text-[11px] text-muted-foreground">{t('considerBuyLess')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
