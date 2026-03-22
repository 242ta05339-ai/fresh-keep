import { useFridge } from '@/lib/fridge-context';
import { Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const typeConfig = {
  urgent: { icon: AlertTriangle, className: 'border-l-destructive bg-destructive/5' },
  warning: { icon: AlertCircle, className: 'border-l-warning bg-warning/5' },
  info: { icon: Info, className: 'border-l-info bg-info/5' },
};

export default function Notifications() {
  const { notifications, markNotificationRead } = useFridge();
  const sorted = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">Notifications</h2>
        <p className="text-muted-foreground">Stay on top of your fridge.</p>
      </div>

      <div className="space-y-2">
        {sorted.map((n, i) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          return (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`stagger-child w-full text-left rounded-xl border border-l-4 p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${config.className} ${n.read ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className={`font-medium ${n.read ? '' : 'font-semibold'}`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                </div>
                {!n.read && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
