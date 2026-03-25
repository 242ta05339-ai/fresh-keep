import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const { t } = useI18n();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName || email.split('@')[0]);
        toast.success(t('added'));
      } else {
        await signIn(email, password);
        toast.success(t('goodMorning'));
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-5xl">🧊</span>
          <h1 className="font-display text-2xl font-semibold">FreshKeep</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? t('createAccount') : t('signInToFridge')}
          </p>
        </div>

        <div className="flex justify-center">
          <LanguageSelector />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('displayName')}</Label>
              <Input id="name" placeholder="e.g. Mom" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {isSignUp ? <><UserPlus className="h-4 w-4" /> {t('createAccountBtn')}</> : <><LogIn className="h-4 w-4" /> {t('signIn')}</>}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? t('alreadyHaveAccount') : t('noAccount')}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
            {isSignUp ? t('signIn') : t('signUp')}
          </button>
        </p>
      </div>
    </div>
  );
}
