import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { FoodItem, Notification } from './types';
import { mockNotifications } from './mock-data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';

interface FridgeContextType {
  items: FoodItem[];
  notifications: Notification[];
  addItem: (item: Omit<FoodItem, 'id' | 'addedDate' | 'consumed'>) => Promise<void>;
  removeItem: (id: string) => void;
  markConsumed: (id: string, percentage: number) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  loading: boolean;
}

const FridgeContext = createContext<FridgeContextType | null>(null);

function mapRowToItem(row: any): FoodItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    expiryDate: row.expiry_date,
    category: row.category,
    addedDate: row.added_date,
    addedBy: row.added_by,
    consumed: row.consumed,
    cost: row.cost ? Number(row.cost) : undefined,
  };
}

export function FridgeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data.map(mapRowToItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel('food_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchItems]);

  const addItem = useCallback(async (item: Omit<FoodItem, 'id' | 'addedDate' | 'consumed'>) => {
    // Try to get user's family_id
    let familyId: string | null = null;
    if (user) {
      const { data } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      if (data) familyId = data.family_id;
    }

    const { error } = await supabase.from('food_items').insert({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiryDate,
      category: item.category,
      added_by: item.addedBy,
      cost: item.cost ?? null,
      user_id: user?.id ?? null,
      family_id: familyId,
    });

    if (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  }, [user]);

  const removeItem = useCallback(async (id: string) => {
    await supabase.from('food_items').delete().eq('id', id);
  }, []);

  const markConsumed = useCallback(async (id: string, percentage: number) => {
    await supabase.from('food_items').update({ consumed: Math.min(100, percentage) }).eq('id', id);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <FridgeContext.Provider value={{ items, notifications, addItem, removeItem, markConsumed, markNotificationRead, unreadCount, loading }}>
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridge() {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge must be used within FridgeProvider');
  return ctx;
}
