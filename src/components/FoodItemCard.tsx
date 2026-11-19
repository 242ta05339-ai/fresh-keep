import { useState } from 'react';
import { FoodItem, CATEGORY_EMOJI } from '@/lib/types';
import { useI18n } from '@/lib/i18n-context';
import { Trash2, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const CONSUME_OPTIONS = [25, 50, 75, 100];

interface Props {
  item: FoodItem;
  onRemove: (id: string) => void;
  onConsume: (id: string, percentage: number) => void;
  style?: React.CSSProperties;
}

export default function FoodItemCard({ item, onRemove, onConsume, style }: Props) {
  const [showConsume, setShowConsume] = useState(false);
  const { t } = useI18n();
  const days = daysUntilExpiry(item.expiryDate);

  const label = days < 0
    ? { text: `${Math.abs(days)}${t('dOverdue')}`, className: 'bg-destructive/10 text-destructive' }
    : days === 0
    ? { text: t('expiresToday'), className: 'bg-destructive/10 text-destructive' }
    : days <= 3
    ? { text: `${days}${t('dLeft')}`, className: 'bg-warning/10 text-warning' }
    : { text: `${days}${t('dLeft')}`, className: 'bg-success/10 text-success' };

  return (
    <div
      className="group rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
      style={style}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
          {CATEGORY_EMOJI[item.category]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <p className="min-w-0 flex-1 break-words text-sm font-semibold sm:text-base">{item.name}</p>
            <span className={`max-w-full shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${label.className}`}>
              {label.text}
            </span>
          </div>
          <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {item.quantity} {item.unit} · {t('addedBy')} {item.addedBy}
          </p>
        </div>

        <div className="hidden min-w-[60px] flex-col items-end gap-1 md:flex">
          <span className="text-[11px] text-muted-foreground">{item.consumed}% {t('used')}</span>
          <div className="h-1.5 w-14 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${item.consumed}%` }}
            />
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-1 md:flex">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs"
            onClick={() => setShowConsume(!showConsume)}
          >
            <Utensils className="h-3.5 w-3.5" />
            {t('consume')}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Remove ${item.name}`}
            title={`Remove ${item.name}`}
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-3 border-t pt-3 md:hidden">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('used')}</span>
            <span className="font-medium tabular-nums">{item.consumed}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.consumed}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="min-h-10 flex-1 gap-2" onClick={() => setShowConsume(!showConsume)}>
            <Utensils className="h-4 w-4" />
            {t('consume')}
          </Button>
          <Button size="icon" variant="ghost" aria-label={`Remove ${item.name}`} title={`Remove ${item.name}`} onClick={() => onRemove(item.id)} className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showConsume && (
        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t('setUsed')}</p>
          <div className="grid grid-cols-4 gap-2 md:flex md:items-center">
            {CONSUME_OPTIONS.map(pct => (
              <Button
                key={pct}
                size="sm"
                variant={item.consumed >= pct ? 'default' : 'outline'}
                className="h-9 px-2 text-xs md:h-7 md:px-2.5"
                onClick={() => {
                  onConsume(item.id, pct);
                  setShowConsume(false);
                }}
              >
                {pct}%
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
