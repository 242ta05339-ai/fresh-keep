import { mockAnalytics } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const COLORS = ['hsl(152,45%,38%)', 'hsl(28,80%,56%)', 'hsl(210,60%,55%)', 'hsl(38,92%,50%)', 'hsl(4,72%,56%)'];

export default function Analytics() {
  const { mostConsumed, mostWasted, monthlySpending, purchaseFrequency } = mockAnalytics;

  return (
    <div className="space-y-8">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">Analytics</h2>
        <p className="text-muted-foreground">Understand your food habits.</p>
      </div>

      {/* Monthly spending vs waste */}
      <section className="fade-in-up-delay-1 space-y-3">
        <h3 className="font-display text-lg font-semibold">Monthly Spending vs Waste</h3>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySpending} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,20%,88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => `$${v}`} />
              <Bar dataKey="spent" fill="hsl(152,45%,38%)" radius={[4, 4, 0, 0]} name="Spent" />
              <Bar dataKey="wasted" fill="hsl(4,72%,56%)" radius={[4, 4, 0, 0]} name="Wasted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Most consumed */}
      <section className="fade-in-up-delay-2 space-y-3">
        <h3 className="font-display text-lg font-semibold">Most Consumed Items</h3>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mostConsumed} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Times purchased">
                {mostConsumed.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Most wasted */}
      <section className="fade-in-up-delay-3 space-y-3">
        <h3 className="font-display text-lg font-semibold">Highest Waste Items</h3>
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
          {mostWasted.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium">{item.name}</span>
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

      {/* AI Purchase frequency */}
      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">🤖 AI Purchase Insights</h3>
        <div className="space-y-2">
          {purchaseFrequency.map(pf => (
            <div key={pf.item} className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm">
              <div>
                <p className="font-medium">{pf.item}</p>
                <p className="text-xs text-muted-foreground">Bought every ~{pf.avgDays} days</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${pf.wastePercent > 20 ? 'text-destructive' : 'text-success'}`}>
                  {pf.wastePercent}% wasted
                </p>
                {pf.wastePercent > 20 && (
                  <p className="text-[11px] text-muted-foreground">Consider buying less</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
