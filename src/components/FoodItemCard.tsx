import { FoodItem, CATEGORY_EMOJI } from '@/lib/types';
import { Trash2 } from 'lucide-react';

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryLabel(days: number) {
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: 'bg-destructive/10 text-destructive' };
  if (days === 0) return { text: 'Expires today', className: 'bg-destructive/10 text-destructive' };
  if (days <= 3) return { text: `${days}d left`, className: 'bg-warning/10 text-warning' };
  return { text: `${days}d left`, className: 'bg-success/10 text-success' };
}

interface Props {
  item: FoodItem;
  onRemove: (id: string) => void;
  style?: React.CSSProperties;
}

export default function FoodItemCard({ item, onRemove, style }: Props) {
  const days = daysUntilExpiry(item.expiryDate);
  const label = expiryLabel(days);

  return (
    <div
      className="group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
      style={style}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg">
        {CATEGORY_EMOJI[item.category]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{item.name}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${label.className}`}>
            {label.text}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {item.quantity} {item.unit} · added by {item.addedBy}
        </p>
      </div>
      {/* Consumed bar */}
      <div className="hidden sm:flex flex-col items-end gap-1 min-w-[60px]">
        <span className="text-[11px] text-muted-foreground">{item.consumed}% used</span>
        <div className="h-1.5 w-14 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.consumed}%` }} />
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 active:scale-90"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
