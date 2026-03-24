import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BarChart3, ChefHat, Bell, Leaf, Users } from 'lucide-react';
import { useFridge } from '@/lib/fridge-context';
import { useI18n } from '@/lib/i18n-context';
import FridgeChatbot from '@/components/FridgeChatbot';
import LanguageSelector from '@/components/LanguageSelector';

const linkDefs = [
  { to: '/', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { to: '/add', icon: PlusCircle, labelKey: 'addFood' as const },
  { to: '/analytics', icon: BarChart3, labelKey: 'analytics' as const },
  { to: '/recipes', icon: ChefHat, labelKey: 'recipes' as const },
  { to: '/sustainability', icon: Leaf, labelKey: 'ecoScore' as const },
  { to: '/family', icon: Users, labelKey: 'family' as const },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { unreadCount } = useFridge();
  const { t } = useI18n();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧊</span>
            <h1 className="font-display text-xl font-semibold tracking-tight">FreshKeep</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <NavLink
              to="/notifications"
              className="relative rounded-xl p-2.5 transition-colors hover:bg-muted active:scale-95"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container pb-24 pt-6">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/90 backdrop-blur-sm">
        <div className="container flex items-center justify-around py-2">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors active:scale-95 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <FridgeChatbot />
    </div>
  );
}
