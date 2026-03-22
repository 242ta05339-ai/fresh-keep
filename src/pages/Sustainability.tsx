import { mockSustainability } from '@/lib/mock-data';
import { Leaf, Flame, TrendingUp, Award } from 'lucide-react';

const tierConfig = {
  bronze: { emoji: '🥉', next: 'Silver', threshold: 50, color: 'text-bronze' },
  silver: { emoji: '🥈', next: 'Gold', threshold: 80, color: 'text-silver' },
  gold: { emoji: '🥇', next: null, threshold: 100, color: 'text-gold' },
};

export default function Sustainability() {
  const data = mockSustainability;
  const tier = tierConfig[data.tier];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">Sustainability Score</h2>
        <p className="text-muted-foreground">Your eco-friendly consumption journey.</p>
      </div>

      {/* Score ring */}
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
        <p className="mt-3 font-display text-lg font-semibold capitalize">{data.tier} Tier</p>
        {tier.next && (
          <p className="text-sm text-muted-foreground">
            {tier.threshold - data.score} more points to {tier.next}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="fade-in-up-delay-2 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm">
          <Leaf className="h-5 w-5 text-success mb-1" />
          <p className="text-xl font-semibold tabular-nums">{data.itemsSaved}</p>
          <p className="text-[11px] text-muted-foreground text-center">Items saved</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm">
          <Flame className="h-5 w-5 text-accent mb-1" />
          <p className="text-xl font-semibold tabular-nums">{data.streakDays}</p>
          <p className="text-[11px] text-muted-foreground text-center">Day streak</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm">
          <TrendingUp className="h-5 w-5 text-info mb-1" />
          <p className="text-xl font-semibold tabular-nums">{100 - data.wastePercentage}%</p>
          <p className="text-[11px] text-muted-foreground text-center">Efficiency</p>
        </div>
      </div>

      {/* Tips */}
      <div className="fade-in-up-delay-3 space-y-3">
        <h3 className="font-display text-lg font-semibold">Tips to Level Up</h3>
        {[
          { icon: '🥗', tip: 'Use spinach in a smoothie before it wilts' },
          { icon: '🍞', tip: 'Freeze bread if you won't finish it in 2 days' },
          { icon: '📋', tip: 'Plan meals around expiring items first' },
        ].map(({ icon, tip }) => (
          <div key={tip} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
            <span className="text-lg">{icon}</span>
            <p className="text-sm">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
