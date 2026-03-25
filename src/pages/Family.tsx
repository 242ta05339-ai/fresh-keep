import { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Copy, LogOut, Trash2, Link } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFamily } from '@/lib/family-context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { toast } from 'sonner';

export default function Family() {
  const { family, members, loading, createFamily, joinFamily, removeMember, isOwner } = useFamily();
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode && !family && !loading) {
      setInviteCode(joinCode);
      setShowJoin(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, family, loading, setSearchParams]);

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    try {
      await createFamily(familyName.trim());
      setShowCreate(false);
      setFamilyName('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    try {
      await joinFamily(inviteCode.trim());
      setShowJoin(false);
      setInviteCode('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copyInviteCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      toast.success(t('inviteCodeCopied'));
    }
  };

  const copyInviteLink = () => {
    if (family?.invite_code) {
      const link = `${window.location.origin}/family?join=${family.invite_code}`;
      navigator.clipboard.writeText(link);
      toast.success(t('inviteLinkCopied'));
    }
  };

  if (loading) return <div className="flex justify-center py-12 text-muted-foreground">{t('loading')}</div>;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="fade-in-up flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">{t('familySharing')}</h2>
          <p className="text-muted-foreground">{t('manageFridge')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
          <LogOut className="h-4 w-4" /> {t('signOut')}
        </Button>
      </div>

      {!family ? (
        <div className="fade-in-up-delay-1 space-y-4">
          <div className="rounded-xl border bg-card p-6 text-center space-y-3">
            <Users className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('createOrJoin')}</p>
          </div>

          {showCreate ? (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Label>{t('familyName')}</Label>
              <Input placeholder="e.g. The Smiths" value={familyName} onChange={e => setFamilyName(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">{t('create')}</Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>{t('cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" size="lg" onClick={() => { setShowCreate(true); setShowJoin(false); }}>
              <Users className="h-4 w-4" /> {t('createFamilyGroup')}
            </Button>
          )}

          {showJoin ? (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Label>{t('inviteCode')}</Label>
              <Input placeholder={t('pasteInviteCode')} value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleJoin} className="flex-1">{t('join')}</Button>
                <Button variant="outline" onClick={() => setShowJoin(false)}>{t('cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" variant="outline" size="lg" onClick={() => { setShowJoin(true); setShowCreate(false); }}>
              <UserPlus className="h-4 w-4" /> {t('joinWithInvite')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="fade-in-up-delay-1 rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{family.name}</h3>
              {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('inviteCodeLabel')}</span>
              <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{family.invite_code}</code>
              <button onClick={copyInviteCode} className="text-primary hover:text-primary/80 active:scale-95" title="Copy code">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button onClick={copyInviteLink} className="text-primary hover:text-primary/80 active:scale-95" title="Copy invite link">
                <Link className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="fade-in-up-delay-2 space-y-2">
            <h3 className="font-display text-lg font-semibold">{t('members')} ({members.length})</h3>
            {members.map((member, i) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                  {member.avatar_emoji}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{member.display_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
                {member.role === 'owner' && <Crown className="h-4 w-4 text-yellow-500" />}
                {isOwner && member.user_id !== user?.id && (
                  <button onClick={() => removeMember(member.user_id)} className="text-destructive hover:text-destructive/80 active:scale-95">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
