import { useMemo } from 'react';
import { useFridge } from '@/lib/fridge-context';
import { useI18n } from '@/lib/i18n-context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['hsl(152,45%,38%)', 'hsl(28,80%,56%)', 'hsl(210,60%,55%)', 'hsl(38,92%,50%)', 'hsl(4,72%,56%)'];

export default function Analytics() {
  const { items } = useFridge();
  const { t } = useI18n();

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
    <div className="space-y-8">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">{t('analytics')}</h2>
        <p className="text-muted-foreground">{t('understand')}</p>
      </div>

      <section className="fade-in-up-delay-1 space-y-3">
        <h3 className="font-display text-lg font-semibold">{t('spendingVsWaste')}</h3>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySpending} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,20%,88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: number) => `₹${v}`} />
              <Bar dataKey="spent" fill="hsl(152,45%,38%)" radius={[4, 4, 0, 0]} name={t('spent')} />
              <Bar dataKey="wasted" fill="hsl(4,72%,56%)" radius={[4, 4, 0, 0]} name={t('wasted')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="fade-in-up-delay-2 space-y-3">
        <h3 className="font-display text-lg font-semibold">{t('mostConsumed')}</h3>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mostConsumed} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
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
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
          {mostWasted.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium truncate">{item.name}</span>
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
            <div key={pf.item} className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm">
              <div>
                <p className="font-medium">{pf.item}</p>
                <p className="text-xs text-muted-foreground">{t('shelfLife')}: ~{pf.avgDays} {t('daysLeft')}</p>
              </div>
              <div className="text-right">
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
