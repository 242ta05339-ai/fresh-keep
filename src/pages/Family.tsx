import { Users, UserPlus, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const familyMembers = [
  { name: 'Sarah', role: 'Admin', avatar: 'S', color: 'bg-primary' },
  { name: 'Marcus', role: 'Member', avatar: 'M', color: 'bg-accent' },
  { name: 'Lily', role: 'Member', avatar: 'L', color: 'bg-info' },
];

export default function Family() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="fade-in-up">
        <h2 className="font-display text-2xl font-semibold">Family Sharing</h2>
        <p className="text-muted-foreground">Manage who has access to your fridge.</p>
      </div>

      <div className="fade-in-up-delay-1 space-y-2">
        {familyMembers.map((member, i) => (
          <div
            key={member.name}
            className="stagger-child flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${member.color}`}>
              {member.avatar}
            </div>
            <div className="flex-1">
              <p className="font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
            {member.role === 'Admin' && <Crown className="h-4 w-4 text-gold" />}
          </div>
        ))}
      </div>

      <div className="fade-in-up-delay-2 space-y-3">
        <Button className="w-full" variant="outline" size="lg">
          <UserPlus className="h-4 w-4" /> Invite Family Member
        </Button>
        <Button className="w-full" variant="ghost" size="lg">
          <Settings className="h-4 w-4" /> Sharing Settings
        </Button>
      </div>
    </div>
  );
}
