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
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">🧊</span>
            <h1 className="font-display text-lg font-semibold sm:text-xl">FreshKeep</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <LanguageSelector />
            <NavLink
              to="/notifications"
              aria-label={t('notifications')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted active:scale-95"
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
      <main className="container px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-24 sm:pt-6">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="container grid grid-cols-6 items-stretch px-1 py-1.5 sm:px-6 sm:py-2">
          {linkDefs.map(({ to, icon: Icon, labelKey }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-center text-[10px] font-medium leading-tight transition-colors sm:gap-1 sm:px-2 sm:text-[11px] ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 sm:h-5 sm:w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="max-w-full break-words">{t(labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <FridgeChatbot />
    </div>
  );
}
