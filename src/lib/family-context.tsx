import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface FamilyMember {
  id: string;
  user_id: string;
  role: string;
  display_name: string;
  avatar_emoji: string;
}

interface FamilyGroup {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
}

interface FamilyContextType {
  family: FamilyGroup | null;
  members: FamilyMember[];
  loading: boolean;
  createFamily: (name: string) => Promise<void>;
  joinFamily: (code: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  isOwner: boolean;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamily = useCallback(async () => {
    if (!user) { setFamily(null); setMembers([]); setLoading(false); return; }

    // Get user's family membership
    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) { setFamily(null); setMembers([]); setLoading(false); return; }

    // Get family details
    const { data: familyData } = await supabase
      .from('family_groups')
      .select('*')
      .eq('id', memberData.family_id)
      .single();

    if (familyData) setFamily(familyData as FamilyGroup);

    // Get members with profiles
    const { data: membersData } = await supabase
      .from('family_members')
      .select('id, user_id, role')
      .eq('family_id', memberData.family_id);

    if (membersData) {
      const userIds = membersData.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_emoji')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      setMembers(membersData.map(m => ({
        ...m,
        display_name: profileMap.get(m.user_id)?.display_name || 'Unknown',
        avatar_emoji: profileMap.get(m.user_id)?.avatar_emoji || '👤',
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFamily(); }, [fetchFamily]);

  const createFamily = useCallback(async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('family_groups')
      .insert({ name, owner_id: user.id })
      .select()
      .single();
    if (error) throw error;

    // Add owner as member
    await supabase.from('family_members').insert({
      family_id: data.id, user_id: user.id, role: 'owner',
    });

    // Assign existing food items to this family
    await supabase.from('food_items').update({ family_id: data.id, user_id: user.id }).is('family_id', null);

    toast.success('Family group created!');
    await fetchFamily();
  }, [user, fetchFamily]);

  const joinFamily = useCallback(async (code: string) => {
    const { error } = await supabase.rpc('join_family_by_code', { _code: code });
    if (error) throw error;
    toast.success('Joined family!');
    await fetchFamily();
  }, [fetchFamily]);

  const removeMember = useCallback(async (userId: string) => {
    if (!family) return;
    await supabase.from('family_members').delete().eq('family_id', family.id).eq('user_id', userId);
    toast.success('Member removed');
    await fetchFamily();
  }, [family, fetchFamily]);

  const isOwner = family?.owner_id === user?.id;

  return (
    <FamilyContext.Provider value={{ family, members, loading, createFamily, joinFamily, removeMember, isOwner }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider');
  return ctx;
}
